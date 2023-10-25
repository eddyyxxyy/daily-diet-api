import { execSync } from 'child_process';
import { platform } from 'os';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';

describe('sessions routes', async () => {
  beforeAll(async () => await app.ready());

  afterAll(async () => await app.close());

  beforeEach(() => {
    if (platform() === 'win32') {
      execSync('npm run knexWin -- migrate:rollback --all');
      execSync('npm run knexWin -- migrate:latest');
    } else {
      execSync('npm run knex -- migrate:rollback --all');
      execSync('npm run knex -- migrate:latest');
    }
  });

  it('should be able to create a session', async () => {
    const userToBeCreated = {
      name: 'Edson Pimenta',
      email: 'test@email.com',
      password: '123@Test',
    };

    await request(app.server)
      .post('/users')
      .send({ ...userToBeCreated });

    const response = await request(app.server).post('/sessions').send({
      email: userToBeCreated.email,
      password: userToBeCreated.password,
    });

    expect(response.statusCode).toEqual(201);
  });

  it('should be able to get user info with session token', async () => {
    const userToBeCreated = {
      name: 'Edson Pimenta',
      email: 'test@email.com',
      password: '123@Test',
    };

    await request(app.server)
      .post('/users')
      .send({ ...userToBeCreated });

    const requestResponse = await request(app.server).post('/sessions').send({
      email: userToBeCreated.email,
      password: userToBeCreated.password,
    });

    let token = '';
    requestResponse.get('Set-Cookie').forEach((cookie) => {
      if (cookie.startsWith('@daily-diet:accessToken')) {
        const notSanitizedToken = cookie.split(';')[0];
        token = notSanitizedToken.split('=')[1];
      }
    });

    const getUserInfoResponse = await request(app.server)
      .get('/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(getUserInfoResponse.statusCode).toEqual(200);
    expect(getUserInfoResponse.body.user).toHaveProperty('id');
    expect(getUserInfoResponse.body.user).toHaveProperty('name');
    expect(getUserInfoResponse.body.user).toHaveProperty('email');
    expect(getUserInfoResponse.body.user.name).toEqual(userToBeCreated.name);
    expect(getUserInfoResponse.body.user.email).toEqual(userToBeCreated.email);
  });
});
