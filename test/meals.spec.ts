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

  it('should be able to get all meals', async () => {
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

    const firstMealTobeCreated = {
      name: 'Quarteirão',
      description:
        'Um hambúrguer feito com pura carne bovina, envolvida por duas fatias de queijo cheddar, cebola, picles e molhos ketchup e mostarda.',
      date: '2023-10-19',
      hour: '18:00:00',
      isOnTheDiet: false,
    };

    const secondMealTobeCreated = {
      name: 'Quarteirão Duplo',
      description:
        'Dois hamburgueres feitos com pura carne bovina, envolvida por quatro fatias de queijo cheddar, cebola, picles e molhos ketchup e mostarda.',
      date: '2023-10-26',
      hour: '20:00:00',
      isOnTheDiet: false,
    };

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send(firstMealTobeCreated);

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send(secondMealTobeCreated);

    const allMealsResponse = await request(app.server)
      .get('/meals/all')
      .set('Authorization', `Bearer ${token}`);

    const allMealsResponseBody = allMealsResponse.body;

    expect(allMealsResponse.status).toEqual(200);
    expect(allMealsResponseBody).toMatchObject({
      meals: [
        {
          id: expect.any(String),
          name: 'Quarteirão',
          description:
            'Um hambúrguer feito com pura carne bovina, envolvida por duas fatias de queijo cheddar, cebola, picles e molhos ketchup e mostarda.',
          date: '2023-10-19',
          hour: '18:00:00',
          isOnTheDiet: 0,
          created_at: expect.any(String),
          modified_at: null,
          userId: expect.any(String),
        },
        {
          id: expect.any(String),
          name: 'Quarteirão Duplo',
          description:
            'Dois hamburgueres feitos com pura carne bovina, envolvida por quatro fatias de queijo cheddar, cebola, picles e molhos ketchup e mostarda.',
          date: '2023-10-26',
          hour: '20:00:00',
          isOnTheDiet: 0,
          created_at: expect.any(String),
          modified_at: null,
          userId: expect.any(String),
        },
      ],
    });
  });

  it('should be able to get a single meal', async () => {
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

    const mealTobeCreated = {
      name: 'Quarteirão',
      description:
        'Um hambúrguer feito com pura carne bovina, envolvida por duas fatias de queijo cheddar, cebola, picles e molhos ketchup e mostarda.',
      date: '2023-10-19',
      hour: '18:00:00',
      isOnTheDiet: false,
    };

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send(mealTobeCreated);

    const allMealsResponse = await request(app.server)
      .get('/meals/all')
      .set('Authorization', `Bearer ${token}`);

    const mealFromGetAllMealsResponse = allMealsResponse.body.meals[0];

    const getSingleMealResponse = await request(app.server)
      .get(`/meals/${mealFromGetAllMealsResponse.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getSingleMealResponse.status).toEqual(200);
    expect(getSingleMealResponse.body).toMatchObject({
      meal: {
        id: expect.any(String),
        name: 'Quarteirão',
        description:
          'Um hambúrguer feito com pura carne bovina, envolvida por duas fatias de queijo cheddar, cebola, picles e molhos ketchup e mostarda.',
        date: '2023-10-19',
        hour: '18:00:00',
        isOnTheDiet: 0,
        created_at: expect.any(String),
        modified_at: null,
        userId: expect.any(String),
      },
    });
  });

  it('should be able to delete a meal', async () => {
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

    const mealTobeCreated = {
      name: 'Quarteirão',
      description:
        'Um hambúrguer feito com pura carne bovina, envolvida por duas fatias de queijo cheddar, cebola, picles e molhos ketchup e mostarda.',
      date: '2023-10-19',
      hour: '18:00:00',
      isOnTheDiet: false,
    };

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send(mealTobeCreated);

    const allMealsResponse = await request(app.server)
      .get('/meals/all')
      .set('Authorization', `Bearer ${token}`);

    const mealFromGetAllMealsResponse = allMealsResponse.body.meals[0];

    const getSingleMealResponse = await request(app.server)
      .delete(`/meals/${mealFromGetAllMealsResponse.id}`)
      .set('Authorization', `Bearer ${token}`);

    const getDeletedMealReponse = await request(app.server)
      .get(`/meals/${mealFromGetAllMealsResponse.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getSingleMealResponse.status).toEqual(204);
    expect(getSingleMealResponse.body).toEqual(expect.objectContaining({}));
    expect(getDeletedMealReponse.statusCode).toEqual(400);
    expect(getDeletedMealReponse.body).toEqual({
      error: 'Meal not found.',
    });
  });
});
