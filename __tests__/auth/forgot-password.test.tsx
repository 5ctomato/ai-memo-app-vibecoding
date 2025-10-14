// __tests__/auth/forgot-password.test.tsx
// 비밀번호 재설정 요청 기능 테스트 파일
// 비밀번호 재설정 요청 폼의 유효성 검사와 API 호출을 테스트합니다
// 이 파일은 비밀번호 재설정 요청 기능의 안정성을 보장하기 위해 존재합니다
// 관련 파일: components/auth/ForgotPasswordForm.tsx, lib/utils/validation.ts

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Supabase 클라이언트 모킹
const mockResetPasswordForEmail = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
    },
  },
}))

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('비밀번호 재설정 요청 폼이 렌더링된다', () => {
    render(<ForgotPasswordForm />)
    
    expect(screen.getByRole('heading', { name: '비밀번호 재설정' })).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '재설정 링크 전송' })).toBeInTheDocument()
  })

  it('이메일 유효성 검사가 작동한다', async () => {
    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    
    // 잘못된 이메일 형식 입력
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)
    
    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요')).toBeInTheDocument()
    })
  })

  it('유효한 이메일로 재설정 요청이 성공한다', async () => {
    // 성공적인 재설정 요청 모킹
    mockResetPasswordForEmail.mockResolvedValue({
      data: {},
      error: null,
    })

    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '재설정 링크 전송' })
    
    // 유효한 이메일 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/auth/reset-password')
      })
    })

    // 성공 메시지 표시 확인
    await waitFor(() => {
      expect(screen.getByText('이메일을 확인해주세요')).toBeInTheDocument()
    })
  })

  it('등록되지 않은 이메일 에러를 처리한다', async () => {
    // 등록되지 않은 이메일 에러 모킹
    mockResetPasswordForEmail.mockResolvedValue({
      data: {},
      error: { message: 'User not found' },
    })

    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '재설정 링크 전송' })
    
    // 유효한 이메일 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('등록되지 않은 이메일 주소입니다.')).toBeInTheDocument()
    })
  })

  it('너무 많은 요청 에러를 처리한다', async () => {
    // Rate limit 에러 모킹
    mockResetPasswordForEmail.mockResolvedValue({
      data: {},
      error: { message: 'Too many requests' },
    })

    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '재설정 링크 전송' })
    
    // 유효한 이메일 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.')).toBeInTheDocument()
    })
  })

  it('네트워크 에러를 처리한다', async () => {
    // 네트워크 에러 모킹
    mockResetPasswordForEmail.mockRejectedValue(new Error('Network error'))

    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '재설정 링크 전송' })
    
    // 유효한 이메일 입력
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    // 폼 제출
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('네트워크 오류가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument()
    })
  })

  it('보안 제한 에러를 처리한다', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      data: {},
      error: { message: 'For security purposes, you can only request this after 31 seconds.' },
    })

    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '재설정 링크 전송' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('보안을 위해 31초 후에 다시 요청해주세요.')).toBeInTheDocument()
    })
  })

  it('보안 제한 에러 (분 단위)를 처리한다', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      data: {},
      error: { message: 'For security purposes, you can only request this after 2 minutes.' },
    })

    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const submitButton = screen.getByRole('button', { name: '재설정 링크 전송' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('보안을 위해 2분 후에 다시 요청해주세요.')).toBeInTheDocument()
    })
  })
})
