// jest.setup.js
// Jest 테스트 설정 파일
// 테스트 환경에서 필요한 전역 설정을 제공합니다
// 이 파일은 테스트 실행 전에 필요한 설정을 적용하기 위해 존재합니다
// 관련 파일: jest.config.js, __tests__/auth/signup.test.tsx

import '@testing-library/jest-dom'

// 테스트용 환경 변수 설정
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
