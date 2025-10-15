// app/notes/[id]/page.tsx
// 노트 상세 조회 페이지
// 특정 노트의 상세 내용을 표시하고 네비게이션을 제공합니다
// 이 페이지는 사용자가 노트의 전체 내용을 읽고 편집할 수 있게 하기 위해 존재합니다
// 관련 파일: lib/actions/notes.ts, components/notes/NoteDetail.tsx

import { getNoteById } from '@/lib/actions/notes'
import { NoteDetail } from '@/components/notes/NoteDetail'
import SummarySection from '@/components/notes/SummarySection'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

// 노트 타입 정의
type Note = {
  id: string
  title: string
  content: string
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

// API 응답 타입 정의
type GetNoteResult = 
  | { success: true; data: Note }
  | { success: false; error: string }

interface NoteDetailPageProps {
  params: {
    id: string
  }
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params

  // 노트 상세 조회
  const result = await getNoteById(id) as GetNoteResult

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

  // result.success가 true이므로 result.data는 존재함을 보장
  const note = result.data

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 노트 상세 내용 */}
        <div className="lg:col-span-2">
          <Suspense fallback={<div>로딩 중...</div>}>
            <NoteDetail note={note} />
          </Suspense>
        </div>
        
        {/* AI 요약 섹션 */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div>요약 로딩 중...</div>}>
            <SummarySection 
              noteId={note.id} 
              noteContent={note.content} 
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

