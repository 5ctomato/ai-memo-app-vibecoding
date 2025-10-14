// app/notes/page.tsx
// 노트 목록 페이지
// 사용자의 모든 노트를 목록 형태로 표시하고 페이지네이션 및 정렬 기능을 제공합니다
// 이 페이지는 노트 관리의 핵심 인터페이스로서 사용자가 노트를 탐색하고 관리할 수 있게 합니다
// 관련 파일: components/notes/NotesList.tsx, lib/actions/notes.ts

import { NotesList } from '@/components/notes/NotesList'
import { getNotes } from '@/lib/actions/notes'
import { Suspense } from 'react'

interface NotesPageProps {
  searchParams: {
    page?: string
    limit?: string
    sortBy?: 'createdAt' | 'updatedAt' | 'title'
    sortOrder?: 'asc' | 'desc'
  }
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  // URL 파라미터 파싱
  const page = parseInt(searchParams?.page || '1', 10)
  const limit = parseInt(searchParams?.limit || '10', 10)
  const sortBy = (searchParams?.sortBy as 'createdAt' | 'updatedAt' | 'title') || 'updatedAt'
  const sortOrder = (searchParams?.sortOrder as 'asc' | 'desc') || 'desc'

  // 노트 목록 조회
  const result = await getNotes({
    page,
    limit,
    sortBy,
    sortOrder,
  })

  if (!result.success) {
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
        <NotesList
          notes={result.data.notes}
          pagination={result.data.pagination}
          sort={result.data.sort}
        />
      </Suspense>
    </div>
  )
}
