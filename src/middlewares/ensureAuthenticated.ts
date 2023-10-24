import { FastifyReply, FastifyRequest } from 'fastify';

import { MyTokenPayload } from '../@types/fastifyJwt';

export async function verifyJWT(req: FastifyRequest, rep: FastifyReply) {
  let decodedToken;

  try {
    decodedToken = (await req.jwtVerify()) as MyTokenPayload;
  } catch (err) {
    return rep.status(401).send({ error: 'Unauthorized' });
  }

  if (decodedToken.type === 'refresh') {
    return rep
      .status(401)
      .send({ error: 'Refresh token cannot be used here.' });
  }
}
