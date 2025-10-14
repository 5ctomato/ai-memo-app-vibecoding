// __tests__/auth/signup.test.tsx
// 회원가입 기능 테스트 파일
// 회원가입 폼의 유효성 검사와 API 호출을 테스트합니다
// 이 파일은 회원가입 기능의 안정성을 보장하기 위해 존재합니다
// 관련 파일: components/auth/SignupForm.tsx, lib/utils/validation.ts

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Next.js router 모킹
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Supabase 클라이언트 모킹
const mockSignUp = jest.fn()
const mockSignInWithPassword = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
    },
  },
}))

import SignupForm from '@/components/auth/SignupForm'

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('회원가입 폼이 렌더링된다', () => {
    render(<SignupForm />)
    
    expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument()
  })

  it('이메일 유효성 검사가 작동한다', async () => {
    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    
    // 잘못된 이메일 형식 입력
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)
    
    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요')).toBeInTheDocument()
    })
  })

  it('비밀번호 유효성 검사가 작동한다', async () => {
    render(<SignupForm />)
    
    const passwordInput = screen.getByLabelText('비밀번호')
    
    // 너무 짧은 비밀번호 입력
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.blur(passwordInput)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호는 최소 8자 이상이어야 합니다')).toBeInTheDocument()
    })
  })

  it('비밀번호 확인 검사가 작동한다', async () => {
    render(<SignupForm />)
    
    const passwordInput = screen.getByLabelText('비밀번호')
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

  it('유효한 데이터로 회원가입이 성공한다', async () => {
    // 성공적인 회원가입 모킹
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })
    
    // 성공적인 로그인 모킹
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })

    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    
    // 유효한 데이터 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      })
    })
  })

  it('중복 이메일 에러를 처리한다', async () => {
    // 중복 이메일 에러 모킹
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    })

    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    
    // 유효한 데이터 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('이미 가입된 이메일 주소입니다.')).toBeInTheDocument()
    })
  })

  it('비밀번호가 너무 짧은 에러를 처리한다', async () => {
    // 비밀번호 길이 에러 모킹
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Password should be at least 6 characters' },
    })

    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    
    // 유효한 데이터 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호는 최소 6자 이상이어야 합니다.')).toBeInTheDocument()
    })
  })

  it('비밀번호가 너무 약한 에러를 처리한다', async () => {
    // 비밀번호 강도 에러 모킹
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Password is too weak' },
    })

    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    
    // 유효한 데이터 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호가 너무 약합니다. 영문, 숫자, 특수문자를 포함해주세요.')).toBeInTheDocument()
    })
  })

  it('잘못된 이메일 형식 에러를 처리한다', async () => {
    // 이메일 형식 에러 모킹
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid email' },
    })

    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    
    // 유효한 데이터 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요.')).toBeInTheDocument()
    })
  })

  it('너무 많은 요청 에러를 처리한다', async () => {
    // Rate limit 에러 모킹
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Too many requests' },
    })

    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    
    // 유효한 데이터 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.')).toBeInTheDocument()
    })
  })

  it('네트워크 에러를 처리한다', async () => {
    // 네트워크 에러 모킹
    mockSignUp.mockRejectedValue(new Error('Network error'))

    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    
    // 유효한 데이터 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('네트워크 오류가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument()
    })
  })
})
