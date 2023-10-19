import { FastifyRequest, FastifyReply, DoneFuncWithErrOrRes } from 'fastify';

export async function verifyJWT(
  req: FastifyRequest,
  rep: FastifyReply,
  done: DoneFuncWithErrOrRes,
) {
  try {
    await req.jwtVerify();
    done();
  } catch (err) {
    return rep.status(401).send({ error: 'Unauthorized' });
  }
}
