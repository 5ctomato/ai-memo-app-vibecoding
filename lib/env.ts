// lib/env.ts
// 환경 변수 타입 정의 및 검증
// 애플리케이션에서 사용하는 환경 변수들의 타입 안전성 보장

import 'dotenv/config';

export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  DATABASE_URL: process.env.DATABASE_URL!,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
} as const;

// 환경 변수 검증 함수
export function validateEnv() {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'DATABASE_URL',
    'GEMINI_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}
