// components/auth/LogoutDialog.tsx
// 로그아웃 확인 대화상자 컴포넌트
// 사용자가 로그아웃을 확인할 수 있는 대화상자를 제공합니다
// 이 파일은 안전한 로그아웃 프로세스를 구현하기 위해 존재합니다
// 관련 파일: components/layout/Header.tsx, lib/hooks/useAuth.ts

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const { signOut } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut()
      // 로그아웃 성공 시 메인 페이지로 리다이렉트
      router.push('/')
      onOpenChange(false)
    } catch (error) {
      console.error('Logout error:', error)
      // 에러가 발생해도 대화상자는 닫기
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>로그아웃</DialogTitle>
          <DialogDescription>
            정말로 로그아웃하시겠습니까? 로그아웃하면 현재 세션이 종료됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            onClick={handleLogout}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? '로그아웃 중...' : '로그아웃'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
