import cookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import fastify from 'fastify';
import { FastifyInstance } from 'fastify/types/instance';

import { conn } from './database';
import { env } from './env';
import { mealsRoutes } from './routes/meals.routes';
import { sessionsRoutes } from './routes/sessions.routes';
import { usersRoutes } from './routes/users.routes';

export const app: FastifyInstance = fastify();

// Middlewares
app.register(cookie);
app.register(fastifyJwt, { secret: env.JWT_SECRET });

// Routes
app.register(usersRoutes, {
  prefix: 'users',
});
app.register(sessionsRoutes, {
  prefix: 'sessions',
});
app.register(mealsRoutes, {
  prefix: 'meals',
});

async function deleteExpiredTokens() {
  const now = new Date();
  await conn('tokens').delete().where('expiry', '<', now.toISOString());
}

setInterval(deleteExpiredTokens, 60 * 60 * 1000);
