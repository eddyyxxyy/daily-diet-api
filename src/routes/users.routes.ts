import { genSalt, hash } from 'bcrypt';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { conn } from '../database';
import { ensureReqBodyIsFilled } from '../middlewares/ensureReqBodyIsFilled';
import { createUserBodySchema } from '../schemas';
import { handleRequestBodySchema } from '../utils/handleRequestBodySchema';

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/',
    { preHandler: [ensureReqBodyIsFilled] },
    async (req: FastifyRequest, rep: FastifyReply): Promise<void> => {
      const newUserInfo = handleRequestBodySchema(createUserBodySchema)(
        req,
        rep,
      );

      if (newUserInfo === null) {
        return;
      }

      const { name, email, password } = newUserInfo;

      const userExists = await conn('users').where({ email }).first();

      if (userExists) {
        return rep.status(400).send({ error: 'E-mail already in use.' });
      }

      const hashedPassword = await hash(password, await genSalt(10));

      await conn('users').insert({ name, email, password: hashedPassword });

      return rep.status(201).send();
    },
  );
}
