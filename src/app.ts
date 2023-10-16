import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { FastifyInstance } from 'fastify/types/instance';
import { usersRoutes } from './routes/users.routes';

export const app: FastifyInstance = fastify();

app.register(cookie);

app.register(usersRoutes, {
  prefix: 'users',
});
