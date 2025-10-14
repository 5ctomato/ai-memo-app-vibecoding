// app/notes/search/page.tsx
// 노트 검색 결과 페이지
// 사용자가 검색한 노트들을 목록 형태로 표시하고 페이지네이션 및 정렬 기능을 제공합니다
// 이 페이지는 사용자가 원하는 노트를 찾을 수 있게 하기 위해 존재합니다
// 관련 파일: lib/actions/notes.ts, components/notes/SearchResultsList.tsx

import { searchNotes } from '@/lib/actions/notes'
import { SearchResultsList } from '@/components/notes/SearchResultsList'
import { Suspense } from 'react'

interface SearchPageProps {
  searchParams: {
    q?: string
    page?: string
    limit?: string
    sortBy?: 'createdAt' | 'updatedAt' | 'title'
    sortOrder?: 'asc' | 'desc'
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams?.q || ''
  
  // 검색어가 없으면 노트 목록으로 리다이렉트
  if (!query.trim()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">검색어를 입력해주세요</h1>
          <p className="text-muted-foreground">
            노트 제목이나 내용으로 검색할 수 있습니다.
          </p>
        </div>
      </div>
    )
  }

  // URL 파라미터 파싱
  const page = parseInt(searchParams?.page || '1', 10)
  const limit = parseInt(searchParams?.limit || '10', 10)
  const sortBy = (searchParams?.sortBy as 'createdAt' | 'updatedAt' | 'title') || 'updatedAt'
  const sortOrder = (searchParams?.sortOrder as 'asc' | 'desc') || 'desc'

  // 노트 검색
  const result = await searchNotes({
    query: query.trim(),
    page,
    limit,
    sortBy,
    sortOrder,
  })

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">검색 중 오류가 발생했습니다</h1>
          <p className="text-muted-foreground">{result.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>검색 중...</div>}>
        <SearchResultsList
          notes={result.data.notes}
          pagination={result.data.pagination}
          sort={result.data.sort}
          search={result.data.search}
        />
      </Suspense>
    </div>
  )
}
