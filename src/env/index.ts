import dotenv from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_CLIENT: z.enum(['sqlite3', 'pg']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number(),
  JWT_SECRET: z.string(),
  FRONT_END_URL: z.string().url().startsWith('http'),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables!', _env.error.format());

  throw new Error('Invalid environment variables.');
}

export const env = _env.data;
