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

  it("should be able to get user's summary", async () => {
    const userToBeCreated = {
      name: 'Edson Pimenta',
      email: 'test@email.com',
      password: '123@Test',
    };

    await request(app.server)
      .post('/users')
      .send({ ...userToBeCreated });

    const loginResponse = await request(app.server).post('/sessions').send({
      email: userToBeCreated.email,
      password: userToBeCreated.password,
    });

    let token = '';

    loginResponse.get('Set-Cookie').forEach((cookie) => {
      if (cookie.startsWith('@daily-diet:accessToken')) {
        const notSanitizedToken = cookie.split(';')[0];
        token = notSanitizedToken.split('=')[1];
      }
    });

    for (let i = 1; i < 4; i++) {
      await request(app.server)
        .post('/meals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Testing summary ${i}`,
          description: 'Um monte de folha muito foda',
          date: `2023-11-0${i}`,
          hour: '20:00',
          isOnTheDiet: true,
        });
    }

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Testing summary 4',
        description: 'Um monte de folha muito foda',
        date: '2023-11-04',
        hour: '20:00',
        isOnTheDiet: false,
      });

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Testing summary 5',
        description: 'Um monte de folha muito foda',
        date: '2023-11-05',
        hour: '20:00',
        isOnTheDiet: true,
      });

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Testing summary 6',
        description: 'Um monte de folha muito foda',
        date: '2023-11-06',
        hour: '20:00',
        isOnTheDiet: false,
      });

    for (let i = 7; i < 13; i++) {
      await request(app.server)
        .post('/meals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Testing summary ${i}`,
          description: 'Um monte de folha muito foda',
          date: `2023-11-0${i}`,
          hour: '20:00',
          isOnTheDiet: true,
        });
    }

    const summaryResponse = await request(app.server)
      .get('/users/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(summaryResponse.body).toEqual({
      summary: {
        totalOfMeals: 12,
        totalOfMealsOnDiet: 10,
        totalOfMealsOutOfDiet: 2,
        bestSequenceOfMealsOnDiet: 6,
      },
    });
  });
});
