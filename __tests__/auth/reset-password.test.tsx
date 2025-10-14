// __tests__/auth/reset-password.test.tsx
// 비밀번호 재설정 기능 테스트 파일
// 비밀번호 재설정 폼의 유효성 검사와 API 호출을 테스트합니다
// 이 파일은 비밀번호 재설정 기능의 안정성을 보장하기 위해 존재합니다
// 관련 파일: components/auth/ResetPasswordForm.tsx, lib/utils/validation.ts

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Next.js router 모킹
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'token') return 'valid-token'
      if (key === 'type') return 'recovery'
      return null
    },
  }),
}))

// window.location 모킹
delete (window as any).location
window.location = {
  hash: '#access_token=valid-access-token&refresh_token=valid-refresh-token&type=recovery',
  search: '',
} as any

// Supabase 클라이언트 모킹
const mockGetUser = jest.fn()
const mockUpdateUser = jest.fn()
const mockSetSession = jest.fn()
const mockVerifyOtp = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
      setSession: (...args: unknown[]) => mockSetSession(...args),
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    },
  },
}))

import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock setTimeout to execute immediately
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('비밀번호 재설정 폼이 렌더링된다', async () => {
    // 유효한 OTP 검증 모킹
    mockVerifyOtp.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })

    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '새 비밀번호 설정' })).toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '비밀번호 재설정' })).toBeInTheDocument()
  })

  it('비밀번호 유효성 검사가 작동한다', async () => {
    // 유효한 세션 모킹
    mockSetSession.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })

    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    
    // 너무 짧은 비밀번호 입력
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.blur(passwordInput)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호는 최소 8자 이상이어야 합니다')).toBeInTheDocument()
    })
  })

  it('비밀번호 확인 검사가 작동한다', async () => {
    // 유효한 세션 모킹
    mockSetSession.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })

    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    // 비밀번호 입력
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    
    // 다른 비밀번호 확인 입력
    fireEvent.change(confirmPasswordInput, { target: { value: 'Different123!' } })
    fireEvent.blur(confirmPasswordInput)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다')).toBeInTheDocument()
    })
  })

  it('유효한 데이터로 비밀번호 재설정이 성공한다', async () => {
    // 유효한 세션 모킹
    mockSetSession.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })
    
    // 성공적인 비밀번호 업데이트 모킹
    mockUpdateUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })

    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' })
    
    // 유효한 데이터 입력
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'Password123!',
      })
    })

    // setTimeout 실행
    jest.runAllTimers()
    
    // 로그인 페이지로 리다이렉트 확인
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login?message=password-reset-success')
    })
  })

  it('유효하지 않은 토큰을 처리한다', async () => {
    // 유효하지 않은 OTP 검증 모킹
    mockVerifyOtp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    })

    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByText('유효하지 않은 링크')).toBeInTheDocument()
    })
  })

  it('비밀번호가 너무 약한 에러를 처리한다', async () => {
    // 유효한 OTP 검증 모킹
    mockVerifyOtp.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })
    
    // 비밀번호 강도 에러 모킹
    mockUpdateUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Password is too weak' },
    })

    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' })
    
    // 유효한 데이터 입력
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호가 너무 약합니다. 영문, 숫자, 특수문자를 포함해주세요.')).toBeInTheDocument()
    })
  })

  it('네트워크 에러를 처리한다', async () => {
    // 유효한 OTP 검증 모킹
    mockVerifyOtp.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })
    
    // 네트워크 에러 모킹
    mockUpdateUser.mockRejectedValue(new Error('Network error'))

    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' })
    
    // 유효한 데이터 입력
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('네트워크 오류가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument()
    })
  })
})
