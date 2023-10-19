import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { IAuthenticatedUser } from '../@types/user';
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
        userId: (req.user as IAuthenticatedUser).id,
      });

      return rep.status(201).send();
    },
  );
}
