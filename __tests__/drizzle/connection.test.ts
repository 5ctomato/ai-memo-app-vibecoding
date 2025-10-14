// __tests__/drizzle/connection.test.ts
// DrizzleORM 데이터베이스 연결 테스트
// 데이터베이스 연결 및 기본 쿼리 동작 검증

import { db } from '../../lib/db';
import { sql } from 'drizzle-orm';

// 환경 변수가 설정되지 않은 경우 테스트 스킵
const skipIfNoEnv = () => {
  if (!process.env.DATABASE_URL) {
    return true;
  }
  return false;
};

describe('DrizzleORM Database Connection', () => {
  test('should connect to database successfully', async () => {
    if (skipIfNoEnv()) {
      console.log('Skipping database connection test - DATABASE_URL not set');
      return;
    }

    // 간단한 쿼리로 연결 테스트
    const result = await db.execute(sql`SELECT 1 as test`);
    expect(result).toBeDefined();
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toEqual({ test: 1 });
  });

  test('should execute basic SQL query', async () => {
    if (skipIfNoEnv()) {
      console.log('Skipping database query test - DATABASE_URL not set');
      return;
    }

    // 현재 시간 조회 테스트
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    expect(result).toBeDefined();
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].current_time).toBeInstanceOf(Date);
  });
});
