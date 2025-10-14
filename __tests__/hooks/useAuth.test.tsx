// __tests__/hooks/useAuth.test.tsx
// useAuth 훅 테스트 파일
// 인증 상태 관리 훅의 기능을 테스트합니다
// 이 파일은 세션 관리 로직의 정확성을 보장하기 위해 존재합니다
// 관련 파일: lib/hooks/useAuth.ts, lib/supabase/client.ts

import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/lib/hooks/useAuth'

// Supabase 클라이언트 모킹
const mockGetSession = jest.fn()
const mockOnAuthStateChange = jest.fn()
const mockSignOut = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
  },
}))

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('초기 로딩 상태가 true이다', () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } })

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.session).toBe(null)
  })

  it('세션이 없을 때 로딩이 false가 된다', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toBe(null)
    expect(result.current.session).toBe(null)
  })

  it('세션이 있을 때 사용자 정보를 반환한다', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' }
    const mockSession = { user: mockUser, access_token: 'token' }
    
    mockGetSession.mockResolvedValue({ data: { session: mockSession } })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.session).toEqual(mockSession)
  })

  it('signOut 함수가 호출된다', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } })
    mockSignOut.mockResolvedValue({})

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.signOut()
    })

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('인증 상태 변화를 감지한다', async () => {
    let authStateChangeCallback: ((event: string, session: any) => void) | null = null
    
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // 인증 상태 변화 시뮬레이션
    const mockUser = { id: 'test-user-id', email: 'test@example.com' }
    const mockSession = { user: mockUser, access_token: 'token' }

    await act(async () => {
      if (authStateChangeCallback) {
        authStateChangeCallback('SIGNED_IN', mockSession)
      }
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.session).toEqual(mockSession)
    expect(result.current.loading).toBe(false)
  })
})
