import dotenv from 'dotenv';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import userRoutes from './routes/user';
import { isDev } from '@/consts';

dotenv.config();

console.log('current environment: ', process.env.NODE_ENV);
// 确保ACCESS_TOKEN_SECRET存在
if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is not defined in environment variables');
}
const app = new Koa();

// 使用路由
app.use(bodyParser());
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());

// 错误处理中间件
app.use((ctx, next) => {
  return next().catch((err) => {
    ctx.status = err.statusCode || 500;
    ctx.body = {
      error: err.message,
    };
  });
});

export default app;
