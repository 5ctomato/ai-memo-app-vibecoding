// __tests__/utils/validation.test.ts
// 유효성 검사 유틸리티 함수 테스트 파일
// 이메일과 비밀번호 유효성 검사 함수들을 테스트합니다
// 이 파일은 유효성 검사 로직의 정확성을 보장하기 위해 존재합니다
// 관련 파일: lib/utils/validation.ts

import {
  isValidEmail,
  isValidPassword,
  isPasswordMatch,
  getEmailError,
  getPasswordError,
  getPasswordConfirmError,
} from '@/lib/utils/validation'

describe('Email Validation', () => {
  describe('isValidEmail', () => {
    it('유효한 이메일 주소를 인식한다', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.kr')).toBe(true)
      expect(isValidEmail('test+tag@example.org')).toBe(true)
    })

    it('유효하지 않은 이메일 주소를 거부한다', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('getEmailError', () => {
    it('빈 이메일에 대한 에러 메시지를 반환한다', () => {
      expect(getEmailError('')).toBe('이메일을 입력해주세요')
    })

    it('유효하지 않은 이메일 형식에 대한 에러 메시지를 반환한다', () => {
      expect(getEmailError('invalid-email')).toBe('올바른 이메일 형식을 입력해주세요')
    })

    it('유효한 이메일에 대해 null을 반환한다', () => {
      expect(getEmailError('test@example.com')).toBe(null)
    })
  })
})

describe('Password Validation', () => {
  describe('isValidPassword', () => {
    it('유효한 비밀번호를 인식한다', () => {
      expect(isValidPassword('Password123!')).toBe(true)
      expect(isValidPassword('MyPass123@')).toBe(true)
      expect(isValidPassword('Secure#456')).toBe(true)
    })

    it('너무 짧은 비밀번호를 거부한다', () => {
      expect(isValidPassword('Pass1!')).toBe(false)
      expect(isValidPassword('1234567')).toBe(false)
    })

    it('영문자가 없는 비밀번호를 거부한다', () => {
      expect(isValidPassword('12345678!')).toBe(false)
    })

    it('숫자가 없는 비밀번호를 거부한다', () => {
      expect(isValidPassword('Password!')).toBe(false)
    })

    it('특수문자가 없는 비밀번호를 거부한다', () => {
      expect(isValidPassword('Password123')).toBe(false)
    })
  })

  describe('getPasswordError', () => {
    it('빈 비밀번호에 대한 에러 메시지를 반환한다', () => {
      expect(getPasswordError('')).toBe('비밀번호를 입력해주세요')
    })

    it('너무 짧은 비밀번호에 대한 에러 메시지를 반환한다', () => {
      expect(getPasswordError('Pass1!')).toBe('비밀번호는 최소 8자 이상이어야 합니다')
    })

    it('영문자가 없는 비밀번호에 대한 에러 메시지를 반환한다', () => {
      expect(getPasswordError('12345678!')).toBe('비밀번호에 영문자를 포함해주세요')
    })

    it('숫자가 없는 비밀번호에 대한 에러 메시지를 반환한다', () => {
      expect(getPasswordError('Password!')).toBe('비밀번호에 숫자를 포함해주세요')
    })

    it('특수문자가 없는 비밀번호에 대한 에러 메시지를 반환한다', () => {
      expect(getPasswordError('Password123')).toBe('비밀번호에 특수문자를 포함해주세요')
    })

    it('유효한 비밀번호에 대해 null을 반환한다', () => {
      expect(getPasswordError('Password123!')).toBe(null)
    })
  })
})

describe('Password Confirmation', () => {
  describe('isPasswordMatch', () => {
    it('일치하는 비밀번호를 인식한다', () => {
      expect(isPasswordMatch('Password123!', 'Password123!')).toBe(true)
    })

    it('일치하지 않는 비밀번호를 거부한다', () => {
      expect(isPasswordMatch('Password123!', 'Different123!')).toBe(false)
    })
  })

  describe('getPasswordConfirmError', () => {
    it('빈 확인 비밀번호에 대한 에러 메시지를 반환한다', () => {
      expect(getPasswordConfirmError('Password123!', '')).toBe('비밀번호 확인을 입력해주세요')
    })

    it('일치하지 않는 비밀번호에 대한 에러 메시지를 반환한다', () => {
      expect(getPasswordConfirmError('Password123!', 'Different123!')).toBe('비밀번호가 일치하지 않습니다')
    })

    it('일치하는 비밀번호에 대해 null을 반환한다', () => {
      expect(getPasswordConfirmError('Password123!', 'Password123!')).toBe(null)
    })
  })
})
