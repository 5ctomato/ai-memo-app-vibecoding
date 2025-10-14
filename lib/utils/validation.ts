// lib/utils/validation.ts
// 회원가입 폼 유효성 검사 유틸리티 함수들
// 이메일 형식 검증과 비밀번호 강도 검증을 제공합니다
// 이 파일은 사용자 입력 데이터의 유효성을 검사하기 위해 존재합니다
// 관련 파일: components/auth/SignupForm.tsx, __tests__/auth/signup.test.tsx

/**
 * 이메일 형식 유효성 검사 (RFC 5322 표준)
 * @param email 검증할 이메일 주소
 * @returns 유효한 이메일이면 true, 아니면 false
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email)
}

/**
 * 비밀번호 강도 검증
 * 최소 8자, 영문+숫자+특수문자 포함
 * @param password 검증할 비밀번호
 * @returns 유효한 비밀번호이면 true, 아니면 false
 */
export function isValidPassword(password: string): boolean {
  // 최소 8자 이상
  if (password.length < 8) return false
  
  // 영문자 포함
  if (!/[a-zA-Z]/.test(password)) return false
  
  // 숫자 포함
  if (!/\d/.test(password)) return false
  
  // 특수문자 포함
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false
  
  return true
}

/**
 * 비밀번호 확인 검증
 * @param password 원본 비밀번호
 * @param confirmPassword 확인 비밀번호
 * @returns 일치하면 true, 아니면 false
 */
export function isPasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword
}

/**
 * 이메일 유효성 검사 에러 메시지
 * @param email 검증할 이메일
 * @returns 에러 메시지 또는 null
 */
export function getEmailError(email: string): string | null {
  if (!email) return '이메일을 입력해주세요'
  if (!isValidEmail(email)) return '올바른 이메일 형식을 입력해주세요'
  return null
}

/**
 * 비밀번호 유효성 검사 에러 메시지
 * @param password 검증할 비밀번호
 * @returns 에러 메시지 또는 null
 */
export function getPasswordError(password: string): string | null {
  if (!password) return '비밀번호를 입력해주세요'
  if (password.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다'
  if (!/[a-zA-Z]/.test(password)) return '비밀번호에 영문자를 포함해주세요'
  if (!/\d/.test(password)) return '비밀번호에 숫자를 포함해주세요'
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return '비밀번호에 특수문자를 포함해주세요'
  return null
}

/**
 * 비밀번호 확인 에러 메시지
 * @param password 원본 비밀번호
 * @param confirmPassword 확인 비밀번호
 * @returns 에러 메시지 또는 null
 */
export function getPasswordConfirmError(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) return '비밀번호 확인을 입력해주세요'
  if (!isPasswordMatch(password, confirmPassword)) return '비밀번호가 일치하지 않습니다'
  return null
}
