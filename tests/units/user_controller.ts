import request from 'supertest';
import app from '../../src/http/app';
import { describe, expect } from '@jest/globals';
import httpStatus from 'http-status';
import prisma from '../../src/index.prisma';

describe('Users Controller', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new user', async () => {
    const response = await request(app).post('/api/v1/auth/users').send({
      first_name: 'John',
      last_name: 'Doe',
      email: 'test@doe.com',
      password: 'Test@1234',
      confirmPassword: 'Test@1234',
      gender: 'male',
      phoneNumber: '08157585191',
    });
    const data = JSON.parse(response.text); // Assign the response to the data variable

    expect(response.statusCode).toBe(httpStatus.CREATED);
    expect(data.user).toHaveProperty('id');
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
  });

  // Test retrieving a list of users
  it('should retrieve a list of users', async () => {
    const response = await request(app).get('/api/v1/auth/users');
    const data = JSON.parse(response.text);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(data.users.results)).toBe(true);
  });
});
