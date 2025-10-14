// test-db.js
// 데이터베이스 연결 테스트용 스크립트

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL이 설정되지 않았습니다.');
    }

    const client = postgres(connectionString, { prepare: false });
    const db = drizzle(client);

    // 간단한 쿼리 테스트
    const result = await client`SELECT 1 as test`;
    console.log('데이터베이스 연결 성공:', result);

    await client.end();
    console.log('연결 종료 완료');
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
  }
}

testConnection();
