import Router from 'koa-router';
import UserController from '@/controllers/user';
import auth from '@/middlewares/auth';

const router = new Router({ prefix: '/users' });

// 公开路由
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/all', UserController.getUserList);

// 需要认证的路由
router.get('/:id', auth(), UserController.getUserById);
router.post('/update/:id', auth(), UserController.updateUser);
router.post('/delete/:id', auth(), UserController.deleteUser);

export default router;
