import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { UserPayload } from '../@types/fastifyJwt';
import { conn } from '../database';
import { verifyJWT } from '../middlewares/ensureAuthenticated';
import { ensureReqBodyIsFilled } from '../middlewares/ensureReqBodyIsFilled';
import { createMealBodySchema } from '../schemas';
import { handleRequestBodySchema } from '../utils/handleRequestBodySchema';

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [ensureReqBodyIsFilled, verifyJWT] },
    async (req: FastifyRequest, rep: FastifyReply) => {
      const userInfo = req.user as UserPayload;

      const user = await conn('users').where({ id: userInfo.id }).first();

      if (!user) {
        return rep.status(400).send({ error: 'Invalid user.' });
      }

      const meal = handleRequestBodySchema(createMealBodySchema)(req, rep);

      if (meal === null) {
        return;
      }

      const { name, description, date, hour, isOnTheDiet } = meal;

      const mealExists = await conn('meals')
        .where({ name, date, hour })
        .first();

      if (mealExists) {
        return rep.status(400).send({
          error:
            "You can't have meals with the same name in the same date and hour",
        });
      }

      await conn('meals').insert({
        name,
        description,
        date,
        hour,
        isOnTheDiet,
        userId: user.id,
      });

      return rep.status(201).send();
    },
  );

  app.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: verifyJWT },
    async (
      req: FastifyRequest<{ Params: { id: string } }>,
      rep: FastifyReply,
    ) => {
      const { id: mealId } = req.params;

      const meal = await conn('meals').where({ id: mealId }).first();

      if (!meal) {
        return rep.status(400).send({ error: 'Meal not found.' });
      }

      return rep.status(200).send({ meal });
    },
  );

  app.get(
    '/all',
    { preHandler: verifyJWT },
    async (req: FastifyRequest, rep: FastifyReply) => {
      const user = req.user as UserPayload;

      const meals = await conn('meals').where({ userId: user.id });

      if (!meals) {
        return rep.status(400).send({ error: 'User has no registered meals.' });
      }

      return rep.status(200).send({ meals });
    },
  );

  app.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [verifyJWT] },
    async (
      req: FastifyRequest<{ Params: { id: string } }>,
      rep: FastifyReply,
    ) => {
      const { id: mealId } = req.params;

      const meal = await conn('meals').where({ id: mealId }).first();

      if (!meal) {
        return rep.status(400).send({ error: 'Meal not found.' });
      }

      await conn('meals').delete().where({ id: mealId });

      return rep.status(204).send();
    },
  );
}
