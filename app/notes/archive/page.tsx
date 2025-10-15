// app/notes/archive/page.tsx
// 아카이브된 노트 목록 페이지
// 사용자가 아카이브(삭제)한 노트들을 조회하고 복구할 수 있는 페이지를 제공합니다
// 이 페이지는 사용자가 실수로 삭제한 노트를 복구할 수 있게 하기 위해 존재합니다
// 관련 파일: lib/actions/notes.ts, components/notes/ArchivedNotesList.tsx

import { getArchivedNotes } from '@/lib/actions/notes'
import { ArchivedNotesList } from '@/components/notes/ArchivedNotesList'
import { Suspense } from 'react'

// 아카이브된 노트 타입 정의
type ArchivedNote = {
  id: string
  title: string
  content: string
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

type Pagination = {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type Sort = {
  sortBy: 'createdAt' | 'updatedAt' | 'title'
  sortOrder: 'asc' | 'desc'
}

// API 응답 타입 정의
type GetArchivedNotesResult = 
  | { success: true; data: { notes: ArchivedNote[]; pagination: Pagination; sort: Sort } }
  | { success: false; error: string }

interface ArchivePageProps {
  searchParams: {
    page?: string
    limit?: string
    sortBy?: 'createdAt' | 'updatedAt' | 'title'
    sortOrder?: 'asc' | 'desc'
  }
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  // URL 파라미터 파싱
  const page = parseInt(searchParams?.page || '1', 10)
  const limit = parseInt(searchParams?.limit || '10', 10)
  const sortBy = (searchParams?.sortBy as 'createdAt' | 'updatedAt' | 'title') || 'updatedAt'
  const sortOrder = (searchParams?.sortOrder as 'asc' | 'desc') || 'desc'

  // 아카이브된 노트 목록 조회
  const result = await getArchivedNotes({
    page,
    limit,
    sortBy,
    sortOrder,
  }) as GetArchivedNotesResult

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

  // result.success가 true이므로 result.data는 존재함을 보장
  const data = result.data

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>로딩 중...</div>}>
        <ArchivedNotesList
          notes={data.notes}
          pagination={data.pagination}
          sort={data.sort}
        />
      </Suspense>
    </div>
  )
}
