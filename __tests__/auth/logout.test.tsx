// __tests__/auth/logout.test.tsx
// 로그아웃 기능 테스트 파일
// 로그아웃 확인 대화상자와 로그아웃 로직을 테스트합니다
// 이 파일은 로그아웃 기능의 안정성을 보장하기 위해 존재합니다
// 관련 파일: components/auth/LogoutDialog.tsx, components/layout/Header.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Next.js router 모킹
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// useAuth 훅 모킹
const mockSignOut = jest.fn()
jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
  }),
}))

import LogoutDialog from '@/components/auth/LogoutDialog'

describe('LogoutDialog', () => {
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('로그아웃 확인 대화상자가 렌더링된다', () => {
    render(
      <LogoutDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )
    
    expect(screen.getByRole('heading', { name: '로그아웃' })).toBeInTheDocument()
    expect(screen.getByText('정말로 로그아웃하시겠습니까? 로그아웃하면 현재 세션이 종료됩니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument()
  })

  it('취소 버튼이 작동한다', () => {
    render(
      <LogoutDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )
    
    const cancelButton = screen.getByRole('button', { name: '취소' })
    fireEvent.click(cancelButton)
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('로그아웃 버튼이 작동한다', async () => {
    // 성공적인 로그아웃 모킹
    mockSignOut.mockResolvedValue(undefined)

    render(
      <LogoutDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )
    
    const logoutButton = screen.getByRole('button', { name: '로그아웃' })
    fireEvent.click(logoutButton)
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })

    // 메인 페이지로 리다이렉트 확인
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    // 대화상자 닫기 확인
    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('로그아웃 중 로딩 상태가 표시된다', async () => {
    // 지연된 로그아웃 모킹
    mockSignOut.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <LogoutDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )
    
    const logoutButton = screen.getByRole('button', { name: '로그아웃' })
    fireEvent.click(logoutButton)
    
    // 로딩 상태 확인
    expect(screen.getByText('로그아웃 중...')).toBeInTheDocument()
    expect(logoutButton).toBeDisabled()
  })

  it('로그아웃 실패 시에도 대화상자가 닫힌다', async () => {
    // 로그아웃 실패 모킹
    mockSignOut.mockRejectedValue(new Error('Logout failed'))

    render(
      <LogoutDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )
    
    const logoutButton = screen.getByRole('button', { name: '로그아웃' })
    fireEvent.click(logoutButton)
    
    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
