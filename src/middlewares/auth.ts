import jwt from 'jsonwebtoken';
import { Context, Next } from 'koa';
import User from '@/models/user';

export default function auth() {
  return async (ctx: Context, next: Next) => {
    const token = ctx.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      ctx.status = 401;
      ctx.body = { error: 'No token provided' };
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { id: number };
      const user = await User.findByPk(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      // 挂载用户信息到上下文
      ctx.state.user = {
        id: user.id,
        account: user.account,
      };

      await next();
    } catch (error) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid token' };
    }
  };
}
