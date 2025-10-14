// components/notes/ArchivedNotesList.tsx
// 아카이브된 노트 목록 컨테이너 컴포넌트
// 아카이브된 노트들을 그리드 형태로 배치하고, 복구 및 영구 삭제 기능을 제공합니다
// 이 컴포넌트는 사용자가 삭제된 노트를 관리할 수 있게 하기 위해 존재합니다
// 관련 파일: components/notes/ArchivedNoteCard.tsx, components/notes/Pagination.tsx

'use client'

import { ArchivedNoteCard } from './ArchivedNoteCard'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { Pagination } from './Pagination'
import { SortOptions } from './SortOptions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Archive } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  isArchived: boolean
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface SortInfo {
  sortBy: 'createdAt' | 'updatedAt' | 'title'
  sortOrder: 'asc' | 'desc'
}

interface ArchivedNotesListProps {
  notes: Note[]
  pagination: PaginationInfo
  sort: SortInfo
  isLoading?: boolean
}

export function ArchivedNotesList({ notes, pagination, sort, isLoading = false }: ArchivedNotesListProps) {
  if (isLoading) {
    return <LoadingState />
  }

  if (notes.length === 0) {
    return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">아카이브된 노트</h1>
            <p className="text-muted-foreground">
              아카이브된 노트가 없습니다
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notes">
              <Button variant="outline" className="gap-2">
                <Archive className="h-4 w-4" />
                노트 목록
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                홈
              </Button>
            </Link>
          </div>
        </div>

        {/* 빈 상태 */}
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 정렬 옵션 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">아카이브된 노트</h1>
            <p className="text-muted-foreground">
              총 {pagination.totalCount}개의 아카이브된 노트
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notes">
              <Button variant="outline" size="sm" className="gap-2">
                <Archive className="h-4 w-4" />
                노트 목록
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                홈
              </Button>
            </Link>
          </div>
        </div>
        <SortOptions sortBy={sort.sortBy} sortOrder={sort.sortOrder} />
      </div>

      {/* 아카이브된 노트 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <ArchivedNoteCard
            key={note.id}
            id={note.id}
            title={note.title}
            content={note.content}
            createdAt={new Date(note.createdAt)}
            updatedAt={new Date(note.updatedAt)}
            isArchived={note.isArchived}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        hasNextPage={pagination.hasNextPage}
        hasPrevPage={pagination.hasPrevPage}
      />
    </div>
  )
}



