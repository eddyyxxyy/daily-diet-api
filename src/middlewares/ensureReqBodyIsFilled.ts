import { FastifyReply, FastifyRequest } from 'fastify';

export async function ensureReqBodyIsFilled(
  req: FastifyRequest,
  rep: FastifyReply,
): Promise<void> {
  if (req.body === undefined) {
    return rep.status(400).send({ error: 'Request body is empty' });
  }
}
