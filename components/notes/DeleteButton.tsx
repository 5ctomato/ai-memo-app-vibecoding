// components/notes/DeleteButton.tsx
// 노트 삭제 버튼 컴포넌트
// 노트를 아카이브(소프트 삭제)하거나 영구 삭제할 수 있는 버튼을 제공합니다
// 이 컴포넌트는 사용자가 노트를 안전하게 삭제할 수 있게 하기 위해 존재합니다
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
import { archiveNote, deleteNotePermanently } from '@/lib/actions/notes'
import { Trash2, Archive } from 'lucide-react'

interface DeleteButtonProps {
  noteId: string
  noteTitle: string
  isArchived?: boolean
  variant?: 'archive' | 'permanent'
  onSuccess?: () => void
}

export function DeleteButton({ 
  noteId, 
  noteTitle, 
  isArchived = false,
  variant = 'archive',
  onSuccess 
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      let result
      
      if (variant === 'archive') {
        result = await archiveNote(noteId)
      } else {
        result = await deleteNotePermanently(noteId)
      }
      
      if (result.success) {
        setIsOpen(false)
        onSuccess?.()
        
        if (variant === 'permanent') {
          router.push('/notes/archive')
        } else {
          router.push('/notes')
        }
      } else {
        alert(result.error || '삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const getButtonText = () => {
    if (variant === 'archive') {
      return isArchived ? '아카이브됨' : '아카이브'
    }
    return '영구 삭제'
  }

  const getDialogTitle = () => {
    if (variant === 'archive') {
      return '노트를 아카이브하시겠습니까?'
    }
    return '노트를 영구 삭제하시겠습니까?'
  }

  const getDialogDescription = () => {
    if (variant === 'archive') {
      return `"${noteTitle}" 노트를 아카이브합니다. 아카이브된 노트는 복구할 수 있습니다.`
    }
    return `"${noteTitle}" 노트를 영구 삭제합니다. 이 작업은 되돌릴 수 없습니다.`
  }

  const getActionText = () => {
    if (variant === 'archive') {
      return '아카이브'
    }
    return '영구 삭제'
  }

  const getIcon = () => {
    if (variant === 'archive') {
      return <Archive className="h-4 w-4" />
    }
    return <Trash2 className="h-4 w-4" />
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant={isArchived ? "secondary" : "destructive"} 
          size="sm"
          disabled={isArchived}
          className="gap-2"
        >
          {getIcon()}
          {getButtonText()}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getDialogTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDialogDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className={variant === 'permanent' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {isDeleting ? '처리 중...' : getActionText()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}



