import { execSync } from 'node:child_process';
import { platform } from 'node:os';

import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';

describe('users routes', () => {
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

  it('should be able to create a new user', async () => {
    const requestBodyMock = {
      name: 'Edson Pimenta',
      email: 'edson.tibo@gmail.com',
      password: '123@Test',
    };

    const response = await request(app.server)
      .post('/users')
      .send(requestBodyMock);

    expect(response.statusCode).toEqual(201);
  });

  it("shouldn't be able to create an user with an already registered e-mail", async () => {
    const requestBodyMock = {
      name: 'Edson Pimenta',
      email: 'edson.tibo@gmail.com',
      password: '123@Test',
    };

    await request(app.server).post('/users').send(requestBodyMock);

    const response = await request(app.server)
      .post('/users')
      .send(requestBodyMock);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'E-mail already in use.',
      }),
    );
  });
});
