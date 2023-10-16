import { Knex } from 'knex';

import { env } from './src/env';

const development: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: {
    filename: env.DATABASE_URL,
  },
  pool: {
    min: 1,
    max: 10,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    afterCreate: (conn: any, cb: (error: Error | null) => void) =>
      conn.run('PRAGMA foreign_keys = ON', cb),
  },
  migrations: {
    tableName: 'knex_migrations',
    extension: 'ts',
    directory: './src/database/migrations/',
  },
  useNullAsDefault: true,
};

const production: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: env.DATABASE_URL,
  pool: {
    min: 2,
    max: 100,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
  },
  migrations: {
    tableName: 'knex_migrations',
    extension: 'ts',
    directory: './src/database/migrations/',
  },
  acquireConnectionTimeout: 10000,
};

export { development, production };
