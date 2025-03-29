import request from 'supertest';
import app from '@/app';
import { sequelize } from '@/database';
import User from '@/models/user';
import bcrypt from 'bcrypt';
import { CodeDictionary } from '@/utils/restful';

// 新增测试辅助函数
const expectSuccess = (res: any, data?: any) => {
  expect(res.status).toBe(200);
  expect(res.body.code).toBe(CodeDictionary.SUCCESS);
  if (data) {
    expect(res.body.data).toMatchObject(data);
  }
};

const expectError = (res: any, code: CodeDictionary) => {
  expect(res.status).toBe(200); // 注意：HTTP状态码始终为200
  expect(res.body.code).toBe(code);
  expect(res.body.message).toBeDefined();
};

describe('User Controller (Integration Test)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // 同步数据库结构
  });

  beforeEach(async () => {
    await User.destroy({ where: {} }); // 清空测试数据
  });

  describe('POST /users/register - 用户注册', () => {
    it('应成功注册新用户', async () => {
      const newUser = {
        account: 'testuser',
        password: 'Testpass123!',
        nickName: 'Test User',
      };
      const response = await request(app.callback()).post('/users/register').send(newUser);

      expectSuccess(response, {
        user: {
          account: 'testuser',
          nickName: 'Test User',
        },
        token: expect.any(String),
      });
    });

    it('应拒绝重复账号', async () => {
      const user = { account: 'testuser', password: 'Testpass123!' };
      await User.create(user);
      const response = await request(app.callback()).post('/users/register').send(user);

      expectError(response, CodeDictionary.ACCOUNT_EXISTS);
    });
  });

  describe('POST /users/login - 用户登录', () => {
    beforeEach(async () => {
      await User.create({
        account: 'testuser',
        password: await bcrypt.hash('Testpass123!', 10),
        nickName: 'Test User',
      });
    });

    it('应成功登录并返回Token', async () => {
      const response = await request(app.callback()).post('/users/login').send({
        account: 'testuser',
        password: 'Testpass123!',
      });

      expectSuccess(response, {
        user: {
          account: 'testuser',
          nickName: 'Test User',
        },
        token: expect.any(String),
      });
    });

    it('应拒绝错误密码', async () => {
      const response = await request(app.callback()).post('/users/login').send({
        account: 'testuser',
        password: 'wrongpass',
      });

      expectError(response, CodeDictionary.PASSWORD_ERROR);
    });
  });

  describe('GET /users/all', () => {
    it('应当返回空数组', async () => {
      const response = await request(app.callback()).get('/users/all');

      expectSuccess(response, []);
    });

    it('应当返回正确用户列表', async () => {
      // 准备测试数据
      const usersData = [
        { account: 'user1', password: 'pass1', nickName: 'User One' },
        { account: 'user2', password: 'pass2', nickName: 'User Two' },
      ];
      await User.bulkCreate(usersData);

      const response = await request(app.callback()).get('/users/all');

      expectSuccess(response, usersData);
    });
  });

  describe('GET /users/:id', () => {
    it('按id查询用户账号', async () => {
      const userData = {
        account: 'testuser',
        password: 'testpass',
        nickName: 'Test User',
      };

      const registerRes = await request(app.callback()).post('/users/register').send(userData);

      const response = await request(app.callback())
        .get(`/users/${registerRes.body.data.user.id}`)
        .set('Authorization', `Bearer ${registerRes.body.data.token}`);

      expectSuccess(response, userData);
    });

    it('查不到该用户', async () => {
      const userData = {
        account: 'testuser2',
        password: 'testpass',
        nickName: 'Test User',
      };

      const registerRes = await request(app.callback()).post('/users/register').send(userData);

      const response = await request(app.callback())
        .get('/users/9999')
        .set('Authorization', `Bearer ${registerRes.body.data.token}`);

      expectError(response, CodeDictionary.ACCOUNT_NOT_FOUND);
    });
  });

  describe('POST /users/update/:id', () => {
    it('更新用户信息', async () => {
      const userData = {
        account: 'original',
        password: 'originalPass',
        nickName: 'Original User',
      };
      const registerRes = await request(app.callback()).post('/users/register').send(userData);

      const updates = {
        nickName: 'Updated Name',
        avatar: 'https://new-avatar.jpg',
      };

      const response = await request(app.callback())
        .post(`/users/update/${registerRes.body.data.user.id}`)
        .send(updates)
        .set('Authorization', `Bearer ${registerRes.body.data.token}`);

      expectSuccess(response, {
        ...userData,
        ...updates,
      });

      // 验证数据库更新
      const updatedUser = await User.findByPk(response.body.data.id);
      expect(updatedUser?.nickName).toBe(updates.nickName);
    });

    it('更新他人账号', async () => {
      const userData = {
        account: 'original2',
        password: 'originalPass',
        nickName: 'Original User',
      };
      const registerRes = await request(app.callback()).post('/users/register').send(userData);

      const response = await request(app.callback())
        .post('/users/update/9999')
        .send({ nickName: 'New Name' })
        .set('Authorization', `Bearer ${registerRes.body.data.token}`);

      expectError(response, CodeDictionary.PERMISSION_DENIED);
    });
  });

  describe('POST /users/delete/:id', () => {
    it('删除自己账号', async () => {
      const userData = {
        account: 'original3',
        password: 'originalPass',
        nickName: 'Original User',
      };
      const registerRes = await request(app.callback()).post('/users/register').send(userData);

      const response = await request(app.callback())
        .post(`/users/delete/${registerRes.body.data.user.id}`)
        .set('Authorization', `Bearer ${registerRes.body.data.token}`);

      expectSuccess(response);

      // 验证是否真的删除
      const deletedUser = await User.findByPk(registerRes.body.data.user.id.id);
      expect(deletedUser).toBeNull();
    });

    it('删除他人账号', async () => {
      const userData = {
        account: 'original4',
        password: 'originalPass',
        nickName: 'Original User',
      };
      const registerRes = await request(app.callback()).post('/users/register').send(userData);

      const response = await request(app.callback())
        .post('/users/delete/9999')
        .set('Authorization', `Bearer ${registerRes.body.data.token}`);

      expectError(response, CodeDictionary.PERMISSION_DENIED);
    });
  });

  afterAll(async () => {
    await sequelize.close(); // 关闭数据库连接
  });
});
