import request from 'supertest';
import app from '@/app';
import { sequelize } from '@/database';
import User from '@/models/user';

describe('User Routes Integration Test', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // 初始化数据库
  });

  beforeEach(async () => {
    await User.destroy({ where: {} }); // 清空测试数据
  });

  // 测试数据准备函数
  const createTestUser = async (data = {}) => {
    return await User.create({
      account: 'testuser',
      password: 'Testpass123!',
      nickName: 'Test User',
      ...data,
    });
  };

  // 1. 测试 GET /users/all
  describe('GET /users/all - 获取所有用户', () => {
    it('应返回空数组当没有用户时', async () => {
      const res = await request(app.callback()).get('/users/all').expect(200);

      expect(res.body).toEqual([]);
    });

    it('应返回正确的用户列表', async () => {
      await createTestUser({ account: 'user1' });
      await createTestUser({ account: 'user2' });

      const res = await request(app.callback()).get('/users/all').expect(200);

      expect(res.body.length).toBe(2);
      expect(res.body[0].account).toBe('user1');
      expect(res.body[1].account).toBe('user2');
    });
  });

  // 2. 测试 POST /users/create
  describe('POST /users/create - 创建用户', () => {
    const validUserData = {
      account: 'newuser',
      password: 'ValidPass123!',
      nickName: 'New User',
    };

    it('应成功创建用户并返回201状态码', async () => {
      const res = await request(app.callback())
        .post('/users/create')
        .send(validUserData)
        .expect(200);

      expect(res.body.account).toBe(validUserData.account);

      // 验证数据库记录
      const dbUser = await User.findOne({ where: { account: 'newuser' } });
      expect(dbUser).not.toBeNull();
    });

    it('应拒绝无效数据并返回400状态码', async () => {
      const res = await request(app.callback())
        .post('/users/create')
        .send({ account: '', password: 'short' })
        .expect(400);

      expect(res.body.error).toContain('String must contain at least');
    });
  });

  // 3. 测试 GET /users/:id
  describe('GET /users/:id - 获取单个用户', () => {
    it('应返回正确的用户数据', async () => {
      const user = await createTestUser();

      const res = await request(app.callback()).get(`/users/${user.id}`).expect(200);

      expect(res.body.id).toBe(user.id);
      expect(res.body.account).toBe('testuser');
    });

    it('应返回404当用户不存在时', async () => {
      const res = await request(app.callback()).get('/users/9999').expect(404);

      expect(res.body.error).toBe('User not found');
    });
  });

  // 4. 测试 POST /users/update/:id
  describe('POST /users/update/:id - 更新用户', () => {
    it('应成功更新用户信息', async () => {
      const user = await createTestUser();
      const updates = { nickName: 'Updated Name' };

      const res = await request(app.callback())
        .post(`/users/update/${user.id}`)
        .send(updates)
        .expect(200);

      expect(res.body.nickName).toBe('Updated Name');

      // 验证数据库更新
      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser?.nickName).toBe('Updated Name');
    });

    it('应返回404当更新不存在的用户时', async () => {
      const res = await request(app.callback())
        .post('/users/update/9999')
        .send({ nickName: 'New Name' })
        .expect(404);

      expect(res.body.error).toBe('User not found');
    });
  });

  // 5. 测试 POST /users/delete/:id
  describe('POST /users/delete/:id - 删除用户', () => {
    it('应成功删除用户并返回200', async () => {
      const user = await createTestUser();

      await request(app.callback()).post(`/users/delete/${user.id}`).expect(200);

      // 验证数据库记录已删除
      const deletedUser = await User.findByPk(user.id);
      expect(deletedUser).toBeNull();
    });

    it('应返回404当删除不存在的用户时', async () => {
      const res = await request(app.callback()).post('/users/delete/9999').expect(404);

      expect(res.body.error).toBe('User not found');
    });
  });

  afterAll(async () => {
    await sequelize.close(); // 关闭数据库连接
  });
});
