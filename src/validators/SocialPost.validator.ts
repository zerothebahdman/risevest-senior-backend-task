import Joi from 'joi';
import { objectId } from './Custom.validator';
import { PostType } from '../../config/constants';

export const CreatePostValidator = {
  params: Joi.object().keys({
    user_id: Joi.custom(objectId).required(),
  }),
  body: Joi.object().keys({
    body: Joi.string().lowercase().required(),
    post_type: Joi.string().valid(...Object.values(PostType)),
    location: Joi.string().min(3).lowercase().max(20),
    images: Joi.array().items(Joi.string()).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),
};

export const getPostValidator = {
  params: Joi.object().keys({
    user_id: Joi.custom(objectId).required(),
  }),
};

export const CreateCommentValidator = {
  params: Joi.object().keys({
    post_id: Joi.custom(objectId).required(),
  }),
  body: Joi.object().keys({
    body: Joi.string()
      .lowercase()
      .max(150)
      .messages({
        'string.max': 'You have exceeded more than 150 characters',
      })
      .required(),
  }),
};

export const getCommentValidator = {
  params: Joi.object().keys({
    post_id: Joi.custom(objectId).required(),
  }),
};
