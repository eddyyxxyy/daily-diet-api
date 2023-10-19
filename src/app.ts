import fastify from 'fastify';
import cookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify/types/instance';

import { usersRoutes } from './routes/users.routes';
import { sessionsRoutes } from './routes/sessions.routes';
import { env } from './env';

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
