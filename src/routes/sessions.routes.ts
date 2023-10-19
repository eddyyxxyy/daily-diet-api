import { compare } from 'bcrypt';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { conn } from '../database';
import { env } from '../env';
import { verifyJWT } from '../middlewares/ensureAuthenticated';
import { ensureReqBodyIsFilled } from '../middlewares/ensureReqBodyIsFilled';
import { createSessionBodySchema } from '../schemas';
import { handleRequestBodySchema } from '../utils/handleRequestBodySchema';

export async function sessionsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [ensureReqBodyIsFilled] },
    async (req: FastifyRequest, rep: FastifyReply) => {
      const userInfo = handleRequestBodySchema(createSessionBodySchema)(
        req,
        rep,
      );

      if (userInfo === null) {
        return;
      }

      const { email, password } = userInfo;

      const user = await conn('users').where({ email }).first();

      if (user === undefined) {
        return rep.status(400).send({ error: 'Incorrect e-mail or password.' });
      }

      const validatePassword = await compare(password, user.password);

      if (!validatePassword) {
        return rep.status(401).send({ error: 'Incorrect e-mail or password.' });
      }

      const tokenPayload = { id: user.id, name: user.name, email: user.email };
      const token = await rep.jwtSign(tokenPayload);

      if (env.NODE_ENV === 'production') {
        rep.setCookie('@daily-diet:', token, {
          domain: '*',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 1000 * 60 * 60 * 24, // 1 day
        });
      } else {
        rep.setCookie('@daily-diet:', token, {
          path: '/',
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24, // 1 day
        });
      }

      return rep.status(201).send({ token });
    },
  );

  app.get(
    '/',
    { preHandler: verifyJWT },
    (req: FastifyRequest, rep: FastifyReply) => {
      return rep.status(200).send({ user: req.user });
    },
  );
}
