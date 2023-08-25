import axios from 'axios';
// import app from '../../src/http/app';
import { describe, expect } from '@jest/globals';
import httpStatus from 'http-status';
import prisma from '../../src/database/model.module';
import HelperClass from '../../src/utils/helper';
import bcrypt from 'bcrypt';
// import { server } from '../../server';
import config from '../../config/default';

describe('Api Endpoints', () => {
  let createdUser: any;
  let authToken: string;
  let post: any;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    // process.env.PORT = '3000';
    createdUser = await prisma.user.create({
      data: {
        first_name: 'John',
        last_name: 'Doe',
        email: `${HelperClass.generateRandomChar(4)}@doe.com`,
        password: bcrypt.hashSync('Test@1234', 10),
        phoneNumber: HelperClass.generateRandomChar(11, 'num'),
        gender: 'male',
        verification: 'verified',
      },
    });
    post = await prisma.post.create({
      data: {
        body: 'New Post',
        post_type: 'text',
        user_id: createdUser.id,
      },
    });

    const loginResponse = await axios.post(
      `${config.appUrl}/api/v1/auth/login`,
      {
        email: createdUser.email,
        password: 'Test@1234',
      },
    );
    console.log('Response', loginResponse);
    const data = loginResponse.data;
    authToken = data.token.accessToken;
  });
  afterAll(() => {
    // Stop the server after testing
    process.env.NODE_ENV = 'production';
  });

  // Test creating a new post for a user
  it('should create a new post for a user', async () => {
    const user_id = createdUser.id;
    const response = await axios.post(
      `/api/v1/users/${user_id}/posts`,
      {
        body: 'New Post',
        post_type: 'text',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const data = response.data;
    expect(response.status).toBe(httpStatus.CREATED);
    expect(data.post).toHaveProperty('id');
  });

  // ... Other test cases (user creation, retrieval, etc.)

  // Test retrieving all posts of a user
  it('should retrieve all posts of a user', async () => {
    const response = await axios.get(`/api/v1/users/${createdUser.id}/posts`);
    expect(response.status).toBe(httpStatus.OK);
    expect(Array.isArray(response.data.posts)).toBe(true);
  });

  // Test adding a comment to a post
  it('should add a comment to a post', async () => {
    const response = await axios.post(
      `/api/v1/posts/${post.id}/comments`,
      {
        body: 'New Comment',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
    expect(response.status).toBe(httpStatus.CREATED);
    expect(response.data.comment).toHaveProperty('id');
  });

  // Test fetching the top 3 users with most posts and latest comments
  it('should fetch top 3 users with most posts and latest comments', async () => {
    const response = await axios.get(`/api/v1/posts/top-users-posts`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(response.status).toBe(httpStatus.OK);
    expect(Array.isArray(response.data.posts)).toBe(true);
  });

  it('should create a new user', async () => {
    const response = await axios.post('/api/v1/auth/users', {
      first_name: 'John',
      last_name: 'Doe',
      email: `${HelperClass.generateRandomChar(4)}@doe.com`,
      password: bcrypt.hashSync('Test@1234', 10),
      confirmPassword: 'Test@1234',
      gender: 'male',
      phoneNumber: '08157585191',
    });
    const data = response.data;
    expect(response.status).toBe(httpStatus.CREATED);
    expect(data.user).toHaveProperty('id');
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
  });

  // Test retrieving a list of users
  it('should retrieve a list of users', async () => {
    const response = await axios.get('/api/v1/auth/users');
    const data = response.data;
    expect(response.status).toBe(200);
    expect(Array.isArray(data.users.results)).toBe(true);
  });
});
