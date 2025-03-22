import '@/types/koa'
declare module 'koa' {
  interface Request {
    body?: any
  }
}
