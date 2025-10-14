// __tests__/auth/login.test.tsx
// 로그인 기능 테스트 파일
// 로그인 폼의 유효성 검사와 API 호출을 테스트합니다
// 이 파일은 로그인 기능의 안정성을 보장하기 위해 존재합니다
// 관련 파일: components/auth/LoginForm.tsx, lib/utils/validation.ts

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Next.js router 모킹
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => null,
  }),
}))

// Supabase 클라이언트 모킹
const mockSignInWithPassword = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
    },
  },
}))

import LoginForm from '@/components/auth/LoginForm'

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('로그인 폼이 렌더링된다', () => {
    render(<LoginForm />)
    
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
    expect(screen.getByText('회원가입')).toBeInTheDocument()
  })

  it('이메일 유효성 검사가 작동한다', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    
    // 잘못된 이메일 형식 입력
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)
    
    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요')).toBeInTheDocument()
    })
  })

  it('비밀번호 필수 검사가 작동한다', async () => {
    render(<LoginForm />)
    
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })
    
    // 빈 비밀번호로 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호를 입력해주세요')).toBeInTheDocument()
    })
  })

  it('유효한 데이터로 로그인이 성공한다', async () => {
    // 성공적인 로그인 모킹
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    })

    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })
    
    // 유효한 데이터 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('잘못된 로그인 정보 에러를 처리한다', async () => {
    // 잘못된 로그인 정보 에러 모킹
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    })

    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })
    
    // 유효한 데이터 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument()
    })
  })

  it('이메일 미인증 에러를 처리한다', async () => {
    // 이메일 미인증 에러 모킹
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Email not confirmed' },
    })

    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })
    
    // 유효한 데이터 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('이메일 인증이 필요합니다. 이메일을 확인해주세요.')).toBeInTheDocument()
    })
  })

  it('네트워크 에러를 처리한다', async () => {
    // 네트워크 에러 모킹
    mockSignInWithPassword.mockRejectedValue(new Error('Network error'))

    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const submitButton = screen.getByRole('button', { name: '로그인' })
    
    // 유효한 데이터 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('네트워크 오류가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument()
    })
  })
})
