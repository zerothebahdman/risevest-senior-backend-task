import { Router } from 'express';
import authRoute from './auth.route';
import usersRoute from './user.route';
import postRoute from './post.route';

const router = Router();

const defaultRoutes = [
  { path: '/auth', route: authRoute },
  { path: '/users', route: usersRoute },
  { path: '/posts', route: postRoute },
];

defaultRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;
