import { Context } from 'koa';
import User, { UserSchema } from '@/models/user';
import { validate } from '@/utils/sequelizeToZod';

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true, updatedAt: true });

export default {
  // 获取用户列表
  async getUserList(ctx: Context) {
    const users = await User.findAll();
    ctx.body = users;
  },

  // 获取单个用户
  async getUserById(ctx: Context) {
    const { id } = ctx.params;
    const user = await User.findByPk(id);
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }
    ctx.body = user;
  },

  // 创建用户
  async createUser(ctx: Context) {
    try {
      validate(ctx.request.body, CreateUserSchema);
      const { account, password, nickName, associatedUid, avatar } = ctx.request.body as any;
      const user = await User.create({
        account,
        password,
        nickName,
        associatedUid,
        avatar,
      });
      ctx.status = 200;
      ctx.body = user;
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: String(error) };
    }
  },

  // 更新用户
  async updateUser(ctx: Context) {
    const { id } = ctx.params;
    const { account, password, nickName, associatedUid, avatar } = ctx.request.body as any;
    try {
      const [affectedCount] = await User.update(
        { account, password, nickName, associatedUid, avatar },
        { where: { id } },
      );
      if (affectedCount === 0) {
        ctx.status = 404;
        ctx.body = { error: 'User not found' };
        return;
      }
      const user = await User.findByPk(id);
      ctx.body = user;
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: String(error) };
    }
  },

  // 删除用户
  async deleteUser(ctx: Context) {
    const { id } = ctx.params;
    const affectedCount = await User.destroy({ where: { id } });
    if (affectedCount === 0) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }
    ctx.status = 200;
  },
};
