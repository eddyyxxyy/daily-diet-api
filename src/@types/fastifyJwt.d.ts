import { VerifyPayloadType } from '@fastify/jwt';

export type MyTokenPayload = VerifyPayloadType & {
  type?: 'refresh' | 'access';
};

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  type: string;
  iat: number;
  exp: number;
}
