// components/notes/SearchResultsList.tsx
// 검색 결과 목록 컨테이너 컴포넌트
// 검색된 노트들을 그리드 형태로 배치하고, 페이지네이션 및 정렬 기능을 제공합니다
// 이 컴포넌트는 사용자가 검색 결과를 탐색할 수 있게 하기 위해 존재합니다
// 관련 파일: components/notes/NoteCard.tsx, components/notes/Pagination.tsx

'use client'

import { NoteCard } from './NoteCard'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { Pagination } from './Pagination'
import { SortOptions } from './SortOptions'
import { SearchBar } from './SearchBar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

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

interface SearchInfo {
  query: string
  resultCount: number
}

interface SearchResultsListProps {
  notes: Note[]
  pagination: PaginationInfo
  sort: SortInfo
  search: SearchInfo
  isLoading?: boolean
}

export function SearchResultsList({ 
  notes, 
  pagination, 
  sort, 
  search, 
  isLoading = false 
}: SearchResultsListProps) {
  if (isLoading) {
    return <LoadingState />
  }

  if (notes.length === 0) {
    return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">검색 결과</h1>
            <p className="text-muted-foreground">
              &ldquo;{search.query}&rdquo;에 대한 검색 결과가 없습니다
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notes">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
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

        {/* 검색 바 */}
        <SearchBar />

        {/* 빈 상태 */}
        <EmptyState showOnboarding={false} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 검색 바 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">검색 결과</h1>
            <p className="text-muted-foreground">
              &ldquo;{search.query}&rdquo;에 대한 {search.resultCount}개의 결과
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notes">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
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
        
        {/* 검색 바 */}
        <SearchBar />
      </div>

      {/* 정렬 옵션 */}
      <div className="flex justify-end">
        <SortOptions sortBy={sort.sortBy} sortOrder={sort.sortOrder} />
      </div>

      {/* 검색 결과 그리드 */}
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



