import { Post, PostComment } from '@prisma/client';
import paginate from '../utils/paginate';
import RedisClient from '../utils/redis';
import config from '../../config/default';
import prisma from '../index.prisma';
const redis = new RedisClient(config.redisUrl);
export default class PostService {
  async getAllPost(
    filter: Partial<Post>,
    options: {
      orderBy?: string;
      page?: string;
      limit?: string;
      populate?: string;
    } = {},
    ignorePagination = false,
  ): Promise<
    | Post[]
    | {
        results: Post[];
        page: number;
        limit: number;
        totalPages: number;
        total: number;
      }
  > {
    const data = ignorePagination
      ? await prisma.post.findMany({ where: { user_id: filter.user_id } })
      : await paginate<Post, typeof prisma.post>(filter, options, prisma.post);
    redis.set('posts', JSON.stringify(data));
    return data;
  }

  async queryPostDetailsById(id: string) {
    const data = await prisma.post.findUnique({
      where: { id },
    });
    return data;
  }

  async createPost(createBody: Post): Promise<Post> {
    const post: Post = await prisma.post.create({
      data: { ...createBody },
    });
    return post;
  }
  async updateUserPostById(id: string, updateBody: Post): Promise<Post> {
    const post = await prisma.post.update({
      where: { id },
      data: { ...updateBody },
    });
    return post;
  }

  async deleteUserPostById(id: string): Promise<Post> {
    const post = await prisma.post.delete({
      where: { id },
    });

    return post;
  }

  async createComment(createBody: PostComment) {
    const comment = await prisma.postComment.create({
      data: createBody,
    });
    return comment;
  }

  async getPostComments(
    filter: Partial<PostComment>,
    options: {
      orderBy?: string;
      page?: string;
      limit?: string;
      populate?: string;
    } = {},
    ignorePagination = false,
  ) {
    if (typeof filter === 'object' && filter !== null) {
      Object.assign(filter, { deleted_at: null });
    }
    options.populate = 'user';
    const data = ignorePagination
      ? await prisma.postComment.findMany({
          where: {
            ...filter,
          },
          include: {
            user: true,
          },
        })
      : await paginate<PostComment, typeof prisma.postComment>(
          filter,
          options,
          prisma.postComment,
        );
    return data;
  }

  async getCommentById(id: string) {
    const data = await prisma.postComment.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    return data;
  }

  async getPostCommentsCount(filter: Partial<PostComment>) {
    const data = await prisma.postComment.count({
      where: { ...filter },
    });
    return data;
  }

  async getTopUserPost() {
    return await prisma.user.findMany({
      take: 3,
      orderBy: {
        Post: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phoneNumber: true,
        gender: true,
        verification: true,
        created_at: true,
        PostComment: {
          select: {
            body: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
        },
      },
    });
    /**
     * =============== SQL Query ===============
     WITH TopUsers AS (SELECT u.id AS user_id, u.first_name, u.last_name, ROW_NUMBER() OVER (ORDER BY COUNT(p.id) DESC) AS row_num FROM users u JOIN posts p ON u.id = p.user_id GROUP BY u.id ORDER BY COUNT(p.id) DESC LIMIT 3) SELECT tu.user_id, tu.first_name, tu.last_name,pc.body AS latest_comment_body, pc.created_at AS latest_comment_created_at FROM TopUsers tu LEFT JOIN post_comments pc ON tu.user_id = pc.user_id WHERE pc.created_at = (SELECT MAX(created_at) FROM post_comments WHERE user_id = tu.user_id) ORDER BY tu.row_num;
     * ========================================= end of SQL Query =========================================
     */
  }
}
