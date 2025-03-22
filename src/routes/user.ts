import Router from 'koa-router'
import UserController from '@/controllers/user' // 等价于 ./controllers/user.ts

const router = new Router({ prefix: '/users' })

// 路由挂载
router.get('/', UserController.getUserList) // GET /users
router.get('/:id', UserController.getUserById) // GET /users/:id
router.post('/', UserController.createUser) // POST /users
router.put('/:id', UserController.updateUser) // PUT /users/:id
router.delete('/:id', UserController.deleteUser) // DELETE /users/:id

export default router
