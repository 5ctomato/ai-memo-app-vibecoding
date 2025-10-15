// app/notes/[id]/edit/page.tsx
// 노트 수정 페이지
// 기존 노트의 내용을 수정하고 실시간 저장 기능을 제공합니다
// 이 페이지는 사용자가 노트를 편집하고 자동 저장을 통해 데이터 손실을 방지하기 위해 존재합니다
// 관련 파일: lib/actions/notes.ts, components/notes/EditNoteForm.tsx

import { getNoteById } from '@/lib/actions/notes'
import { AdvancedEditNoteForm } from '@/components/notes/AdvancedEditNoteForm'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface EditNotePageProps {
  params: {
    id: string
  }
}

export default async function EditNotePage({ params }: EditNotePageProps) {
  const { id } = await params

  // 노트 상세 조회
  const result = await getNoteById(id)

  if (!result.success) {
    if (result.error === '노트를 찾을 수 없습니다.') {
      notFound()
    }
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
          <p className="text-muted-foreground">{result.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>로딩 중...</div>}>
        {result.data && <AdvancedEditNoteForm note={result.data} />}
      </Suspense>
    </div>
  )
}

