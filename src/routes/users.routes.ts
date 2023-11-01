import { genSalt, hash } from 'bcrypt';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { UserPayload } from '../@types/fastifyJwt';
import { conn } from '../database';
import { verifyJWT } from '../middlewares/ensureAuthenticated';
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

  app.get(
    '/summary',
    { preHandler: [verifyJWT] },
    async (req: FastifyRequest, rep: FastifyReply): Promise<void> => {
      const userInfo = req.user as UserPayload;

      const allMeals = await conn('meals').where({ userId: userInfo.id });

      const totalOfMeals = allMeals.length;

      const totalOfMealsOnDiet = allMeals.filter(
        (meal) => meal.isOnTheDiet,
      ).length;

      const totalOfMealsOutOfDiet = allMeals.filter(
        (meal) => !meal.isOnTheDiet,
      ).length;

      const sortedMeals = allMeals.sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime() ||
          a.hour.localeCompare(b.hour),
      );

      let maxSequence = 0;
      let currentSequence = 0;

      for (let i = 0; i < sortedMeals.length; i++) {
        if (sortedMeals[i].isOnTheDiet) {
          currentSequence++;
          if (currentSequence > maxSequence) {
            maxSequence = currentSequence;
          }
        } else {
          currentSequence = 0;
        }
      }

      rep.status(200).send({
        summary: {
          totalOfMeals,
          totalOfMealsOnDiet,
          totalOfMealsOutOfDiet,
          bestSequenceOfMealsOnDiet: maxSequence,
        },
      });
    },
  );
}
