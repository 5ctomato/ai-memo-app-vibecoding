// app/notes/[id]/page.tsx
// 노트 상세 조회 페이지
// 특정 노트의 상세 내용을 표시하고 네비게이션을 제공합니다
// 이 페이지는 사용자가 노트의 전체 내용을 읽고 편집할 수 있게 하기 위해 존재합니다
// 관련 파일: lib/actions/notes.ts, components/notes/NoteDetail.tsx

import { getNoteById } from '@/lib/actions/notes'
import { NoteDetail } from '@/components/notes/NoteDetail'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface NoteDetailPageProps {
  params: {
    id: string
  }
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
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
        <NoteDetail note={result.data} />
      </Suspense>
    </div>
  )
}

