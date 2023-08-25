import { Router, Request, Response, NextFunction } from 'express';
import { postController } from '../../controllers/controllers.module';
import { isUserAuthenticated } from '../../middlewares/auth.middleware';
import validate from '../../middlewares/validate';
import {
  CreateCommentValidator,
  getCommentValidator,
} from '../../../validators/SocialPost.validator';

const route = Router();

route
  .route('/:post_id/comments')
  .post(
    isUserAuthenticated,
    validate(CreateCommentValidator),
    (req: Request, res: Response, next: NextFunction) => {
      postController.createComment(req, res, next);
    },
  )
  .get(
    isUserAuthenticated,
    validate(getCommentValidator),
    (req: Request, res: Response, next: NextFunction) => {
      postController.getPostComment(req, res, next);
    },
  );

route
  .route('/top-users-posts')
  .get(
    isUserAuthenticated,
    (req: Request, res: Response, next: NextFunction) => {
      postController.getTopUserPost(req, res, next);
    },
  );

export default route;
