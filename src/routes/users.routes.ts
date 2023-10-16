import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { hash, genSalt } from 'bcrypt';

import { ensureReqBodyIsFilled } from '../middlewares/ensureReqBodyIsFilled';
import { createUserBodySchema } from '../schemas';
import { conn } from '../database';

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/',
    { preHandler: [ensureReqBodyIsFilled] },
    async (req: FastifyRequest, rep: FastifyReply): Promise<void> => {
      console.log(req.body);

      const userInfo = createUserBodySchema.safeParse(req.body);

      if (!userInfo.success) {
        const errors = userInfo.error.issues.map((issue) => ({
          field: issue.path,
          message: issue.message,
        }));

        return rep.status(400).send({ errors });
      }

      const { name, email, password } = userInfo.data;

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
