import { Router, Request, Response, NextFunction } from 'express';
import { postController } from '../../controllers/controllers.module';
import { isUserAuthenticated } from '../../middlewares/auth.middleware';
import validate from '../../middlewares/validate';
import {
  CreatePostValidator,
  getPostValidator,
} from '../../../validators/SocialPost.validator';

const route = Router();

route
  .route('/:user_id/posts')
  .post(
    isUserAuthenticated,
    validate(CreatePostValidator),
    (req: Request, res: Response, next: NextFunction) => {
      postController.createPost(req, res, next);
    },
  )
  .get(
    isUserAuthenticated,
    validate(getPostValidator),
    (req: Request, res: Response, next: NextFunction) => {
      postController.getPost(req, res, next);
    },
  );

export default route;
