import { compare } from 'bcrypt';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { UserPayload } from '../@types/fastifyJwt';
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

      const accessToken = await rep.jwtSign(
        { ...tokenPayload, type: 'access' },
        {
          expiresIn: '900s',
        },
      );

      const refreshToken = await rep.jwtSign(
        { ...tokenPayload, type: 'refresh' },
        {
          expiresIn: '1800s',
        },
      );

      const { id: userId } = user;

      await conn('tokens').delete().where({ userId });

      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + 1800); // Adds 30 minutes

      await conn('tokens').insert({
        token: refreshToken,
        expiry: expiryDate.toISOString(),
        userId,
      });

      if (env.NODE_ENV === 'production') {
        rep.setCookie('@daily-diet:accessToken', accessToken, {
          domain: '*',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 900, // 15 minutes
        });

        rep.setCookie('@daily-diet:refreshToken', refreshToken, {
          domain: '*',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 1800, // 30 minutes
        });
      } else {
        rep.setCookie('@daily-diet:accessToken', accessToken, {
          path: '/',
          httpOnly: true,
          maxAge: 900, // 15 minutes
        });

        rep.setCookie('@daily-diet:refreshToken', refreshToken, {
          path: '/',
          httpOnly: true,
          maxAge: 1800, // 30 minutes
        });
      }

      return rep.status(201).send();
    },
  );

  app.post('/refresh', async (req: FastifyRequest, rep: FastifyReply) => {
    const refreshToken = req.cookies['@daily-diet:refreshToken'];

    let tokenPayload;

    try {
      req.headers.authorization = `Bearer ${refreshToken}`;
      tokenPayload = await req.jwtVerify();
    } catch (err) {
      return rep.status(401).send({ error: 'Invalid refresh token.' });
    }

    const registeredRefreshToken = await conn('tokens')
      .where({
        token: refreshToken,
      })
      .first();

    if (!registeredRefreshToken) {
      return rep.status(401).send({ error: 'Invalid Refresh Token' });
    }

    const accessToken = await rep.jwtSign(
      { ...(tokenPayload as object), type: 'access' },
      {
        expiresIn: '900s',
      },
    );

    const refreshedToken = await rep.jwtSign(
      { ...(tokenPayload as object), type: 'refresh' },
      {
        expiresIn: '1800s',
      },
    );

    await conn('tokens')
      .update({
        token: refreshedToken,
        expiry: registeredRefreshToken.expiry,
        userId: registeredRefreshToken.userId,
      })
      .where({ id: registeredRefreshToken.id });

    if (env.NODE_ENV === 'production') {
      rep.setCookie('@daily-diet:accessToken', accessToken, {
        domain: '*',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 900, // 15 minutes
      });

      rep.setCookie('@daily-diet:refreshToken', refreshedToken, {
        domain: '*',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1800, // 30 minutes
      });
    } else {
      rep.setCookie('@daily-diet:accessToken', accessToken, {
        path: '/',
        httpOnly: true,
        maxAge: 900, // 15 minutes
      });

      rep.setCookie('@daily-diet:refreshToken', refreshedToken, {
        path: '/',
        httpOnly: true,
        maxAge: 1800, // 30 minutes
      });
    }

    return rep.status(201).send();
  });

  app.post(
    '/logout',
    { preHandler: [verifyJWT] },
    async (req: FastifyRequest, rep: FastifyReply) => {
      if (env.NODE_ENV === 'production') {
        rep.clearCookie('@daily-diet:accessToken', {
          domain: '*',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        });

        rep.clearCookie('@daily-diet:refreshToken', {
          domain: '*',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        });
      } else {
        rep.clearCookie('@daily-diet:accessToken', {
          path: '/',
          httpOnly: true,
        });

        rep.clearCookie('@daily-diet:refreshToken', {
          path: '/',
          httpOnly: true,
        });
      }

      const userInfo = req.user as UserPayload;

      await conn('tokens').delete().where({ userId: userInfo.id });

      rep.status(204).send();
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
