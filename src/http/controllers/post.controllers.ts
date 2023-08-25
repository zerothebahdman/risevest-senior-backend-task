/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Response } from 'express';
import { RequestType } from '../middlewares/auth.middleware';
import AppException from '../../exceptions/AppException';
import PostService from '../../services/Post.service';
import httpStatus from 'http-status';
import pick from '../../utils/pick';

export default class PostController {
  constructor(private readonly postService: PostService) {}
  async createPost(req: RequestType, res: Response, next: NextFunction) {
    try {
      req.body.user_id = req.params.user_id;
      const post = await this.postService.createPost(req.body);
      return res.status(httpStatus.CREATED).json({
        status: 'success',
        message: `Post has been created`,
        post,
      });
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async getPost(req: RequestType, res: Response, next: NextFunction) {
    try {
      const options = pick(req.query, ['limit', 'page', 'orderBy', 'populate']);
      const posts = await this.postService.getAllPost(
        {
          user_id: req.params.user_id,
        },
        options,
      );
      return res.status(httpStatus.OK).json({
        status: 'success',
        posts,
      });
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async createComment(req: RequestType, res: Response, next: NextFunction) {
    try {
      req.body.user_id = req.user.id;
      req.body.post_id = req.params.post_id;
      const comment = await this.postService.createComment(req.body);
      return res.status(httpStatus.CREATED).json({
        status: 'success',
        comment,
      });
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async getPostComment(req: RequestType, res: Response, next: NextFunction) {
    try {
      const comments: any = await this.postService.getPostComments({
        post_id: req.params.post_id,
      });

      return res.status(httpStatus.OK).json({
        status: 'success',
        comments,
      });
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async getTopUserPost(_req: RequestType, res: Response, next: NextFunction) {
    try {
      const posts = await this.postService.getTopUserPost();
      return res.status(httpStatus.OK).json({
        status: 'success',
        posts,
      });
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }
}
