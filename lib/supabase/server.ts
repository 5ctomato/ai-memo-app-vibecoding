// lib/supabase/server.ts
// Supabase 서버 사이드 클라이언트 초기화 파일
// 서버 액션과 API 라우트에서 사용할 Supabase 클라이언트를 생성합니다
// 이 파일은 서버 환경에서 Supabase와 상호작용하기 위해 존재합니다
// 관련 파일: lib/supabase/client.ts, app/auth/signup/actions.ts

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 서버 컴포넌트용 클라이언트 (쿠키 기반)
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: Record<string, unknown>) {
        cookieStore.set({ name, value: '', ...options })
      },
    },
  })
}

// 서버 액션용 클라이언트 (서비스 롤 키 사용)
export const createServiceClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// 기존 함수명과의 호환성을 위한 별칭
export { createServerSupabaseClient as createServerClient }
