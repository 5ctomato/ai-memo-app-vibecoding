// components/layout/Header.tsx
// 메인 페이지 헤더 컴포넌트
// 로그인 상태에 따라 다른 UI를 보여주는 헤더를 제공합니다
// 이 파일은 사용자 인증 상태에 따른 네비게이션을 구현하기 위해 존재합니다
// 관련 파일: app/page.tsx, components/providers/AuthProvider.tsx, components/auth/LoginForm.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import LogoutDialog from '@/components/auth/LogoutDialog'

export default function Header() {
  const { user, isLoading } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  return (
    <header className="container mx-auto px-4 py-6">
      <nav className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <span className="text-xl font-bold text-gray-900">메모장</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                안녕하세요, {user.email}님
              </span>
              <Button 
                variant="outline" 
                onClick={() => setShowLogoutDialog(true)}
              >
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/signup">
                <Button variant="outline">회원가입</Button>
              </Link>
              <Link href="/auth/login">
                <Button>로그인</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
      
      {/* 로그아웃 확인 대화상자 */}
      <LogoutDialog 
        open={showLogoutDialog} 
        onOpenChange={setShowLogoutDialog} 
      />
    </header>
  )
}
