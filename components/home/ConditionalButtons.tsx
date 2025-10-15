// components/home/ConditionalButtons.tsx
// 인증 상태에 따른 조건부 버튼 컴포넌트
// 사용자 로그인 상태에 따라 다른 버튼을 표시하는 컴포넌트를 제공합니다
// 이 파일은 인증되지 않은 사용자와 인증된 사용자에게 다른 액션을 제공하기 위해 존재합니다
// 관련 파일: app/page.tsx, lib/hooks/useAuth.ts, components/auth/LoginForm.tsx

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'

export function ConditionalButtons() {
  const { user, loading } = useAuth()

  // 로딩 중일 때 스켈레톤 표시
  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <div className="w-32 h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-32 h-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  // 로그인하지 않은 사용자에게는 로그인/회원가입 버튼 표시
  if (!user) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/auth/signup">
          <Button size="lg" className="text-lg px-8 py-6">
            무료로 시작하기
          </Button>
        </Link>
        <Link href="/auth/login">
          <Button variant="outline" size="lg" className="text-lg px-8 py-6">
            로그인
          </Button>
        </Link>
      </div>
    )
  }

  // 로그인한 사용자에게는 노트 관련 버튼 표시
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/notes">
        <Button variant="outline" size="lg" className="text-lg px-8 py-6">
          내 노트 보기
        </Button>
      </Link>
      <Link href="/notes/create">
        <Button variant="outline" size="lg" className="text-lg px-8 py-6">
          노트 작성하기
        </Button>
      </Link>
    </div>
  )
}
