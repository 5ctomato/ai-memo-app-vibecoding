// app/notes/page.tsx
// 노트 목록 페이지
// 사용자의 모든 노트를 목록 형태로 표시하고 페이지네이션 및 정렬 기능을 제공합니다
// 이 페이지는 노트 관리의 핵심 인터페이스로서 사용자가 노트를 탐색하고 관리할 수 있게 합니다
// 관련 파일: components/notes/NotesList.tsx, lib/actions/notes.ts

import { NotesList } from '@/components/notes/NotesList'
import { getNotes } from '@/lib/actions/notes'
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
type GetNotesResult = 
  | { success: true; data: { notes: Note[]; pagination: Pagination; sort: Sort } }
  | { success: false; error: string }

interface NotesPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    sortBy?: 'createdAt' | 'updatedAt' | 'title'
    sortOrder?: 'asc' | 'desc'
  }>
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  // URL 파라미터 파싱 (Next.js 15에서는 searchParams를 await해야 함)
  const resolvedSearchParams = await searchParams
  const page = parseInt(resolvedSearchParams?.page || '1', 10)
  const limit = parseInt(resolvedSearchParams?.limit || '10', 10)
  const sortBy = (resolvedSearchParams?.sortBy as 'createdAt' | 'updatedAt' | 'title') || 'updatedAt'
  const sortOrder = (resolvedSearchParams?.sortOrder as 'asc' | 'desc') || 'desc'

  // 노트 목록 조회
  const result = await getNotes({
    page,
    limit,
    sortBy,
    sortOrder,
  }) as GetNotesResult

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
        <NotesList
          notes={data.notes}
          pagination={data.pagination}
          sort={data.sort}
        />
      </Suspense>
    </div>
  )
}
