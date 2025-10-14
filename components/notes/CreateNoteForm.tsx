// components/notes/CreateNoteForm.tsx
// 노트 생성 폼 컴포넌트
// 사용자가 새 노트를 생성할 수 있는 폼 UI를 제공합니다
// 이 파일은 노트 생성 기능의 사용자 인터페이스를 담당하기 위해 존재합니다
// 관련 파일: lib/actions/notes.ts, app/notes/create/page.tsx, components/ui/button.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createNoteAndRedirect } from '@/lib/actions/notes'
import { Home } from 'lucide-react'

interface CreateNoteFormProps {
  className?: string
}

export function CreateNoteForm({ className }: CreateNoteFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 폼 제출 처리
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createNoteAndRedirect(formData)
      
      if (!result.success) {
        setError(result.error || '노트 생성에 실패했습니다.')
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 클라이언트 사이드 유효성 검증
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // 실시간 유효성 검증
    if (name === 'title' && value.length > 200) {
      setError('제목은 200자를 초과할 수 없습니다.')
    } else if (name === 'content' && value.length > 10000) {
      setError('본문은 10,000자를 초과할 수 없습니다.')
    } else {
      setError(null)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>새 노트 작성</CardTitle>
        <CardDescription>
          제목과 본문을 입력하여 새 노트를 생성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {/* 제목 입력 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="노트 제목을 입력하세요"
              maxLength={200}
              required
              onChange={handleInputChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              최대 200자까지 입력 가능합니다.
            </p>
          </div>

          {/* 본문 입력 */}
          <div className="space-y-2">
            <Label htmlFor="content">본문</Label>
            <textarea
              id="content"
              name="content"
              placeholder="노트 내용을 입력하세요"
              maxLength={10000}
              rows={8}
              onChange={handleInputChange}
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-sm text-muted-foreground">
              최대 10,000자까지 입력 가능합니다.
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 버튼 그룹 */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? '저장 중...' : '노트 생성'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
