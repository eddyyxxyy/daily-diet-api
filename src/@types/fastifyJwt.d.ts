import { VerifyPayloadType } from '@fastify/jwt';

export type MyTokenPayload = VerifyPayloadType & {
  type?: 'refresh' | 'access';
};
