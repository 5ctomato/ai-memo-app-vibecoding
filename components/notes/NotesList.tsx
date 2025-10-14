// components/notes/NotesList.tsx
// 노트 목록 컨테이너 컴포넌트
// 노트 카드들을 그리드 형태로 배치하고, 정렬 옵션과 페이지네이션을 포함한 완전한 노트 목록 UI를 제공합니다
// 이 컴포넌트는 노트 목록을 시각적으로 구성하고 사용자 상호작용을 처리하기 위해 존재합니다
// 관련 파일: components/notes/NoteCard.tsx, components/notes/Pagination.tsx, components/notes/SortOptions.tsx

'use client'

import Link from 'next/link'
import { NoteCard } from './NoteCard'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { Pagination } from './Pagination'
import { SortOptions } from './SortOptions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

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

interface NotesListProps {
  notes: Note[]
  pagination: PaginationInfo
  sort: SortInfo
  isLoading?: boolean
}

export function NotesList({ notes, pagination, sort, isLoading = false }: NotesListProps) {
  if (isLoading) {
    return <LoadingState />
  }

  if (notes.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 정렬 옵션 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">내 노트</h1>
            <p className="text-muted-foreground">
              총 {pagination.totalCount}개의 노트
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              홈
            </Button>
          </Link>
        </div>
        <SortOptions sortBy={sort.sortBy} sortOrder={sort.sortOrder} />
      </div>

      {/* 노트 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <NoteCard
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
