// components/providers/AuthProvider.tsx
// 인증 상태 제공자 컴포넌트
// 애플리케이션 전체에서 인증 상태를 공유하기 위한 Context Provider를 제공합니다
// 이 파일은 전역 인증 상태 관리를 위해 존재합니다
// 관련 파일: lib/hooks/useAuth.ts, app/page.tsx, components/auth/LoginForm.tsx

'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
