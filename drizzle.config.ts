// drizzle.config.ts
// Drizzle Kit 설정 파일
// Supabase Postgres 데이터베이스 연결 및 마이그레이션 설정

import dotenv from 'dotenv' 
dotenv.config({path: '.env.local'})

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});








