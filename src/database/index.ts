import knex, { Knex } from 'knex';

import { development, production } from './config';
import { env } from '../env';

const connConfig = env.NODE_ENV === 'production' ? production : development;

const conn: Knex = knex(connConfig);

export { conn, connConfig };
