import Router from 'koa-router';
import UserController from '@/controllers/user'; // 等价于 ./controllers/user.ts

const router = new Router({ prefix: '/users' });

// 路由挂载
router.get('/all', UserController.getUserList); // GET /users/all
router.get('/:id', UserController.getUserById); // GET /users/:id
router.post('/create', UserController.createUser); // POST /users/create
router.post('/update/:id', UserController.updateUser); // POST /users/update/:id
router.post('/delete/:id', UserController.deleteUser); // POST /users/delete/:id

export default router;
