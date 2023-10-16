import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { FastifyInstance } from 'fastify/types/instance';

export const app: FastifyInstance = fastify();

app.register(cookie);
