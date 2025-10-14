// jest.setup.js
// Jest 테스트 설정 파일
// 테스트 환경에서 필요한 전역 설정을 제공합니다
// 이 파일은 테스트 실행 전에 필요한 설정을 적용하기 위해 존재합니다
// 관련 파일: jest.config.js, __tests__/auth/signup.test.tsx

import '@testing-library/jest-dom'

// TextEncoder/TextDecoder polyfill for Node.js environment
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Web API polyfills for Node.js environment
// Mock fetch and related APIs for testing
global.fetch = jest.fn()
global.Request = class Request {
  constructor(input, init) {
    this.url = input
    this.method = init?.method || 'GET'
    this.headers = new Map(Object.entries(init?.headers || {}))
  }
}
global.Response = class Response {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Map(Object.entries(init?.headers || {}))
  }
  async json() {
    return JSON.parse(this.body)
  }
  async text() {
    return this.body
  }
}
global.Headers = class Headers {
  constructor(init) {
    this.map = new Map(Object.entries(init || {}))
  }
  get(name) {
    return this.map.get(name.toLowerCase())
  }
  set(name, value) {
    this.map.set(name.toLowerCase(), value)
  }
  has(name) {
    return this.map.has(name.toLowerCase())
  }
}

// 테스트용 환경 변수 설정
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.GEMINI_API_KEY = 'test-gemini-key'
