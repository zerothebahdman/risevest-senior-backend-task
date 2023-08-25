/**
 * Use this module file to create instances of all controllers and simplify imports in to your routers
 */

import PostService from '../../services/Social.service';
import UserService from '../../services/User.service';
import PostController from './post.controllers';
import UserController from './users.controller';

export const userController = new UserController(new UserService());
export const postController = new PostController(new PostService());
