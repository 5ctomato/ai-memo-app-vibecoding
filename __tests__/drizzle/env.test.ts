// __tests__/drizzle/env.test.ts
// 환경 변수 검증 테스트
// 필요한 환경 변수들이 올바르게 설정되었는지 확인

import { validateEnv } from '../../lib/env';

describe('Environment Variables', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should validate all required environment variables', () => {
    // 필요한 환경 변수 설정
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

    // 검증 함수가 에러를 던지지 않아야 함
    expect(() => validateEnv()).not.toThrow();
  });

  test('should throw error when environment variables are missing', () => {
    // 환경 변수 제거
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.DATABASE_URL;

    // 검증 함수가 에러를 던져야 함
    expect(() => validateEnv()).toThrow('Missing required environment variables');
  });
});








