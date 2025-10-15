// components/notes/EditNoteForm.tsx
// 노트 수정 폼 컴포넌트
// 기존 노트 내용을 수정하고 실시간 저장 기능을 제공합니다
// 이 컴포넌트는 사용자가 노트를 편집하고 자동 저장을 통해 데이터 손실을 방지하기 위해 존재합니다
// 관련 파일: app/notes/[id]/edit/page.tsx, lib/actions/notes.ts

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateNote, autoSaveNote } from '@/lib/actions/notes'
import { z } from 'zod'
import { ArrowLeft, Save, Check, AlertCircle, Home } from 'lucide-react'

const noteSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').max(200, '제목은 200자 이내로 입력해주세요.'),
  content: z.string().max(10000, '본문은 10,000자 이내로 입력해주세요.').optional(),
})

type NoteFormState = {
  title: string
  content: string
  titleError: string | null
  contentError: string | null
  formError: string | null
  isTemporarySaved: boolean
  temporarySaveTime: Date | null
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface EditNoteFormProps {
  note: {
    id: string
    title: string
    content: string
    isArchived: boolean
    createdAt: Date
    updatedAt: Date
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      <Save className="h-4 w-4" />
      {pending ? '저장 중...' : '저장'}
    </Button>
  )
}

export function EditNoteForm({ note }: EditNoteFormProps) {
  const router = useRouter()
  const [formState, setFormState] = useState<NoteFormState>({
    title: note.title,
    content: note.content,
    titleError: null,
    contentError: null,
    formError: null,
    isTemporarySaved: false,
    temporarySaveTime: null,
  })
  
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 임시 저장 관련 함수들
  const TEMP_SAVE_KEY = `temp-note-${note.id}`
  
  const saveToLocalStorage = useCallback((title: string, content: string) => {
    try {
      const tempData = {
        title,
        content,
        timestamp: new Date().toISOString(),
        noteId: note.id
      }
      localStorage.setItem(TEMP_SAVE_KEY, JSON.stringify(tempData))
      setFormState(prev => ({
        ...prev,
        isTemporarySaved: true,
        temporarySaveTime: new Date()
      }))
    } catch (error) {
      console.error('로컬 스토리지 저장 실패:', error)
    }
  }, [TEMP_SAVE_KEY, note.id])

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(TEMP_SAVE_KEY)
      if (saved) {
        const tempData = JSON.parse(saved)
        if (tempData.noteId === note.id) {
          return {
            title: tempData.title,
            content: tempData.content,
            timestamp: new Date(tempData.timestamp)
          }
        }
      }
    } catch (error) {
      console.error('로컬 스토리지 로드 실패:', error)
    }
    return null
  }, [TEMP_SAVE_KEY, note.id])

  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(TEMP_SAVE_KEY)
      setFormState(prev => ({
        ...prev,
        isTemporarySaved: false,
        temporarySaveTime: null
      }))
    } catch (error) {
      console.error('로컬 스토리지 삭제 실패:', error)
    }
  }, [TEMP_SAVE_KEY])

  // 실시간 저장을 위한 디바운스 훅
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }, [value, delay])

    return debouncedValue
  }


  // 컴포넌트 마운트 시 임시 저장된 데이터 로드
  useEffect(() => {
    const tempData = loadFromLocalStorage()
    if (tempData) {
      setFormState(prev => ({
        ...prev,
        title: tempData.title,
        content: tempData.content,
        isTemporarySaved: true,
        temporarySaveTime: tempData.timestamp
      }))
    }
  }, [loadFromLocalStorage])

  const handleAutoSave = useCallback(async (data: { title: string, content: string }) => {
    setSaveStatus('saving')
    try {
      const result = await autoSaveNote(note.id, data)
      if (result.success) {
        setSaveStatus('saved')
        setHasUnsavedChanges(false)
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [note.id])

  // 실시간 저장
  useEffect(() => {
    if (formState.title !== note.title || formState.content !== note.content) {
      if (formState.title.trim() && formState.title !== note.title) {
        handleAutoSave(formState)
      }
    }
  }, [formState.title, formState.content, note.title, note.content, handleAutoSave])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value, [`${name}Error`]: null, formError: null }))
    setHasUnsavedChanges(true)

    // 임시 저장 (즉시)
    const newTitle = name === 'title' ? value : formState.title
    const newContent = name === 'content' ? value : formState.content
    saveToLocalStorage(newTitle, newContent)

    // Real-time validation
    if (name === 'title') {
      const result = z.string().min(1, '제목은 필수입니다.').max(200, '제목은 200자 이내로 입력해주세요.').safeParse(value)
      setFormState(prev => ({ 
        ...prev, 
        titleError: result.success ? null : result.error.issues[0].message
      }))
    } else if (name === 'content') {
      const result = z.string().max(10000, '본문은 10,000자 이내로 입력해주세요.').safeParse(value)
      setFormState(prev => ({ 
        ...prev, 
        contentError: result.success ? null : result.error.issues[0].message
      }))
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setFormState(prev => ({ ...prev, formError: null }))
    setSaveStatus('saving')

    const result = await updateNote(note.id, formData)

    if (result.success) {
      setSaveStatus('saved')
      setHasUnsavedChanges(false)
      clearLocalStorage() // 임시 저장 클리어
      router.push(`/notes/${note.id}`)
    } else {
      setFormState(prev => ({ ...prev, formError: result.error || null }))
      setSaveStatus('error')
    }
  }

  // 페이지 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = '저장되지 않은 변경사항이 있습니다. 정말 나가시겠습니까?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'saved':
        return <Check className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return '저장 중...'
      case 'saved':
        return '저장됨'
      case 'error':
        return '저장 실패'
      default:
        if (formState.isTemporarySaved) {
          return `임시 저장됨 (${formState.temporarySaveTime?.toLocaleTimeString()})`
        }
        return hasUnsavedChanges ? '저장되지 않음' : ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              뒤로
            </Button>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                홈
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold">노트 편집</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getSaveStatusIcon()}
              <span>{getSaveStatusText()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 편집 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>노트 수정</CardTitle>
          <CardDescription>제목과 본문을 수정하세요. 변경사항은 자동으로 저장됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                제목 <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="노트 제목을 입력하세요"
                maxLength={200}
                value={formState.title}
                onChange={handleInputChange}
                required
              />
              {formState.titleError && <p className="text-sm text-red-500">{formState.titleError}</p>}
              <p className="text-sm text-muted-foreground">최대 200자까지 입력 가능합니다.</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                본문
              </label>
              <Textarea
                id="content"
                name="content"
                placeholder="노트 내용을 입력하세요"
                rows={12}
                maxLength={10000}
                value={formState.content}
                onChange={handleInputChange}
              />
              {formState.contentError && <p className="text-sm text-red-500">{formState.contentError}</p>}
              <p className="text-sm text-muted-foreground">최대 10,000자까지 입력 가능합니다.</p>
            </div>
            
            {formState.formError && <p className="text-sm text-red-500 text-center">{formState.formError}</p>}
            
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
