import { Pool } from 'pg';
import { Provider } from '@nestjs/common';

export const POSTGRES_POOL = 'POSTGRES_POOL';

export const PostgresPoolProvider: Provider = {
  provide: POSTGRES_POOL,
  useFactory: async () => {
    const pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });

    return pool;
  },
};
