/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextFunction, Request, Response } from 'express';
import RedisClient from '../../utils/redis';
import config from '../../../config/default';
import httpStatus from 'http-status';
const redis = new RedisClient(config.redisUrl);

//@ts-ignore
const CachePosts = async (_req: Request, res: Response, next: NextFunction) => {
  const result = await redis.get('posts');
  if (result) {
    return res
      .status(httpStatus.OK)
      .json({ staus: 'success', posts: JSON.parse(result) });
  }
  next();
};
export default CachePosts;
