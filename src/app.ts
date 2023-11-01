import cookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import helmet from '@fastify/helmet';
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
if (process.env.NODE_ENV === 'development') {
  app.register(helmet, {
    contentSecurityPolicy: false,
  });
} else {
  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 15552000, // 180 days
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    frameguard: {
      action: 'deny',
    },
    referrerPolicy: {
      policy: 'same-origin',
    },
  });
}
app.register(fastifyCors, {
  origin: [`http://localhost:${env.PORT}`, env.FRONT_END_URL],
  credentials: true,
});
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
