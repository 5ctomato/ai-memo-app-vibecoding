// lib/supabase/client.ts
// Supabase 클라이언트 초기화 파일
// 클라이언트 사이드에서 사용할 Supabase 클라이언트를 생성합니다
// 이 파일은 브라우저 환경에서 Supabase Auth와 상호작용하기 위해 존재합니다
// 관련 파일: lib/supabase/server.ts, app/auth/signup/page.tsx, components/auth/SignupForm.tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
