// src/interfaces/providers/postgres.provider.ts
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

    // pool.on('connect', () => {
    //   console.log('[PostgresPoolProvider] Client CONNECTED');
    // });

    // // Run a simple test query immediately
    // try {
    //   const res = await pool.query('SELECT 1 AS ok');
    //   console.log('[PostgresPoolProvider] Test query result:', res.rows[0]);
    // } catch (err) {
    //   console.error('[PostgresPoolProvider] Test query failed:', err);
    //   throw err; // fail fast if DB connection fails
    // }

    return pool;
  },
};
