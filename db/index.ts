import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// 데이터베이스 연결 풀 생성
const pool = new Pool({
  connectionString: 'postgresql://postgres:Alsrjsdl0450!@seuttskwyxmznloukxog.supabase.co:5432/postgres',
});

// Drizzle ORM 인스턴스 생성
export const db = drizzle(pool, { schema });
