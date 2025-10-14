// components/notes/RestoreButton.tsx
// 노트 복구 버튼 컴포넌트
// 아카이브된 노트를 복구할 수 있는 버튼을 제공합니다
// 이 컴포넌트는 사용자가 실수로 삭제한 노트를 복구할 수 있게 하기 위해 존재합니다
// 관련 파일: lib/actions/notes.ts, components/ui/alert-dialog.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { restoreNote } from '@/lib/actions/notes'
import { RotateCcw } from 'lucide-react'

interface RestoreButtonProps {
  noteId: string
  noteTitle: string
  onSuccess?: () => void
}

export function RestoreButton({ 
  noteId, 
  noteTitle, 
  onSuccess 
}: RestoreButtonProps) {
  const [isRestoring, setIsRestoring] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleRestore = async () => {
    setIsRestoring(true)
    
    try {
      const result = await restoreNote(noteId)
      
      if (result.success) {
        setIsOpen(false)
        onSuccess?.()
        router.push('/notes')
      } else {
        alert(result.error || '복구 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('복구 오류:', error)
      alert('복구 중 오류가 발생했습니다.')
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          복구
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>노트를 복구하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            "{noteTitle}" 노트를 복구하여 일반 노트 목록으로 이동시킵니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRestoring}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRestore}
            disabled={isRestoring}
          >
            {isRestoring ? '복구 중...' : '복구'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}



