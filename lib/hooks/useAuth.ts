// lib/hooks/useAuth.ts
// 인증 상태 관리 훅
// 사용자의 로그인 상태와 세션 관리를 위한 커스텀 훅을 제공합니다
// 이 파일은 애플리케이션 전반에서 인증 상태를 관리하기 위해 존재합니다
// 관련 파일: lib/supabase/client.ts, components/auth/LoginForm.tsx, app/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })

  useEffect(() => {
    // 현재 세션 가져오기
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false
      })
    }

    getInitialSession()

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 로그아웃 함수
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    ...authState,
    signOut
  }
}
