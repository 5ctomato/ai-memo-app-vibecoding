// jest.config.js
// Jest 테스트 설정 파일
// React 컴포넌트와 유틸리티 함수 테스트를 위한 설정을 제공합니다
// 이 파일은 테스트 환경을 구성하기 위해 존재합니다
// 관련 파일: __tests__/auth/signup.test.tsx, __tests__/utils/validation.test.ts

// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱의 경로를 제공
  dir: './',
})

// Jest에 전달할 사용자 정의 설정
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testEnvironment: 'jsdom',
}

// createJestConfig는 next/jest가 비동기적으로 Next.js 설정을 로드할 수 있도록 하는 함수입니다
module.exports = createJestConfig(customJestConfig)
