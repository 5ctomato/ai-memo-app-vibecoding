// lib/db/index.ts
// DrizzleORM 데이터베이스 연결 설정
// Supabase Postgres와의 연결을 관리하고 쿼리 클라이언트 제공

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../env';

// PostgreSQL 연결 생성
const connectionString = env.DATABASE_URL;
const client = postgres(connectionString, { prepare: false });

// DrizzleORM 인스턴스 생성
export const db = drizzle(client);

// 연결 해제 함수 (개발/테스트 환경에서 사용)
export async function closeConnection() {
  await client.end();
}






