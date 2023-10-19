import knex, { Knex } from 'knex';

import { env } from '../env';
import { development, production } from './config';

const connConfig = env.NODE_ENV === 'production' ? production : development;

const conn: Knex = knex(connConfig);

export { conn, connConfig };
