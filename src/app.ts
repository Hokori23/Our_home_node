import dotenv from 'dotenv'
import Koa from 'koa'
import userRoutes from './routes/user'
import { isDev } from '@/consts'

dotenv.config()

console.log('current environment: ', process.env.NODE_ENV)
const app = new Koa()

// 使用路由
app.use(userRoutes.routes()).use(userRoutes.allowedMethods())

// 错误处理中间件
app.use((ctx, next) => {
  return next().catch((err) => {
    ctx.status = err.statusCode || 500
    ctx.body = {
      error: err.message,
    }
  })
})

export default app
