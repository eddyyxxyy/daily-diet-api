import { execSync } from 'node:child_process';
import { platform } from 'node:os';

import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';

describe('meals routes', async () => {
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

  it('should be able to create a meal', async () => {
    const userToBeCreated = {
      name: 'Edson Pimenta',
      email: 'test@email.com',
      password: '123@Test',
    };

    await request(app.server)
      .post('/users')
      .send({ ...userToBeCreated });

    const {
      body: { token },
    } = await request(app.server).post('/sessions').send({
      email: userToBeCreated.email,
      password: userToBeCreated.password,
    });

    const mealTobeCreated = {
      name: 'Quarteirão',
      description:
        'Um hambúrguer feito com pura carne bovina, envolvida por duas fatias de queijo cheddar, cebola, picles e molhos ketchup e mostarda.',
      date: '2023-10-19',
      hour: '18:00:00',
      isOnTheDiet: false,
    };

    const response = await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send(mealTobeCreated);

    expect(response.statusCode).toEqual(201);
  });
});
