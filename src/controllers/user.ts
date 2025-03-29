import { Context } from 'koa';
import User, { UserSchema } from '@/models/user';
import { validate } from '@/utils/sequelizeToZod';
import { comparePassword, generateToken } from '@/utils/jwt';
import { CodeDictionary, Restful } from '@/utils/restful';

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true, updatedAt: true });

export default {
  // 用户注册
  async register(ctx: Context) {
    try {
      validate(ctx.request.body, CreateUserSchema);
      const { account, password, nickName, associatedUid, avatar } = ctx.request.body as any;

      // 检查账号是否已存在
      const exists = await User.findOne({ where: { account } });
      if (exists) {
        ctx.body = Restful.error(CodeDictionary.ACCOUNT_EXISTS, '账号已存在');
        return;
      }

      const user = await User.create({ account, password, nickName, associatedUid, avatar });
      const token = generateToken(user.id, user.account);

      ctx.body = Restful.success({
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: String(error) };
    }
  },
  // 用户登录
  async login(ctx: Context) {
    try {
      const { account, password } = ctx.request.body as any;

      if (!account || !password) {
        ctx.body = Restful.error(CodeDictionary.PARAMS_ERROR, '账号和密码不能为空');
        return;
      }

      const user = await User.findOne({ where: { account } });
      if (!user) {
        ctx.body = Restful.error(CodeDictionary.ACCOUNT_NOT_FOUND, '账号不存在');
        return;
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        ctx.body = Restful.error(CodeDictionary.PASSWORD_ERROR, '密码错误');
        return;
      }

      const token = generateToken(user.id, user.account);
      ctx.body = Restful.success({
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: String(error) };
    }
  },
  // 获取用户列表
  async getUserList(ctx: Context) {
    try {
      const users = await User.findAll();
      ctx.body = Restful.success(users.map((u) => u.toJSON()));
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: String(error) };
    }
  },

  // 获取单个用户
  async getUserById(ctx: Context) {
    try {
      const { id } = ctx.params;
      const user = await User.findByPk(id);
      if (!user) {
        ctx.body = Restful.error(CodeDictionary.ACCOUNT_NOT_FOUND, '用户不存在');
        return;
      }
      ctx.body = Restful.success(user.toJSON());
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
      if (Number(id) !== ctx.state.user.id) {
        ctx.body = Restful.error(CodeDictionary.PERMISSION_DENIED, '不能更改他人账号信息');
        return;
      }
      const [affectedCount] = await User.update(
        { account, password, nickName, associatedUid, avatar },
        { where: { id } },
      );
      if (affectedCount === 0) {
        ctx.body = Restful.error(CodeDictionary.ACCOUNT_NOT_FOUND, '用户不存在');
        return;
      }
      const user = await User.findByPk(id);
      ctx.body = Restful.success(user?.toJSON());
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: String(error) };
    }
  },

  // 删除用户
  async deleteUser(ctx: Context) {
    const { id } = ctx.params;
    const affectedCount = await User.destroy({ where: { id } });
    if (Number(id) !== ctx.state.user.id) {
      ctx.body = Restful.error(CodeDictionary.PERMISSION_DENIED, '不能删除他人账号');
      return;
    }
    if (affectedCount === 0) {
      ctx.body = Restful.error(CodeDictionary.ACCOUNT_NOT_FOUND, '用户不存在');
      return;
    }
    ctx.body = Restful.success(null, '删除用户成功');
  },
};
