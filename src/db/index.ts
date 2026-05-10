import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// This is required to make the Neon connection work in edge environments and modern Next.js
neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL || 'postgresql://mock:mock@mock.neon.tech/neondb?sslmode=require');
export const db = drizzle(sql, { schema });
