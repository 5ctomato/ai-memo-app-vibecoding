// components/notes/SortOptions.tsx
// 노트 목록 정렬 옵션 컴포넌트
// 최신순, 제목순, 생성일시순 등의 정렬 옵션을 제공하여 노트 목록을 다양한 기준으로 정렬할 수 있게 합니다
// 이 컴포넌트는 사용자가 노트를 원하는 방식으로 정렬하여 탐색할 수 있도록 하기 위해 존재합니다
// 관련 파일: components/notes/NotesList.tsx, app/notes/page.tsx

'use client'

import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { ArrowUpDown, ArrowUp, ArrowDown, Calendar, FileText, Clock } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

type SortBy = 'createdAt' | 'updatedAt' | 'title'
type SortOrder = 'asc' | 'desc'

interface SortOptionsProps {
  sortBy: SortBy
  sortOrder: SortOrder
}

export function SortOptions({ sortBy, sortOrder }: SortOptionsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (newSortBy: SortBy, newSortOrder: SortOrder) => {
    const params = new URLSearchParams(searchParams)
    params.set('sortBy', newSortBy)
    params.set('sortOrder', newSortOrder)
    params.set('page', '1') // 정렬 변경 시 첫 페이지로 이동
    router.push(`/notes?${params.toString()}`)
  }

  const getSortLabel = (sortBy: SortBy) => {
    switch (sortBy) {
      case 'createdAt':
        return '생성일시'
      case 'updatedAt':
        return '수정일시'
      case 'title':
        return '제목'
      default:
        return '정렬'
    }
  }

  const getSortIcon = (sortBy: SortBy) => {
    switch (sortBy) {
      case 'createdAt':
        return <Calendar className="h-4 w-4" />
      case 'updatedAt':
        return <Clock className="h-4 w-4" />
      case 'title':
        return <FileText className="h-4 w-4" />
      default:
        return <ArrowUpDown className="h-4 w-4" />
    }
  }

  const getOrderIcon = (order: SortOrder) => {
    return order === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {getSortIcon(sortBy)}
          {getSortLabel(sortBy)}
          {getOrderIcon(sortOrder)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleSortChange('updatedAt', 'desc')}
          className={sortBy === 'updatedAt' && sortOrder === 'desc' ? 'bg-accent' : ''}
        >
          <Clock className="h-4 w-4 mr-2" />
          수정일시 최신순
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleSortChange('updatedAt', 'asc')}
          className={sortBy === 'updatedAt' && sortOrder === 'asc' ? 'bg-accent' : ''}
        >
          <Clock className="h-4 w-4 mr-2" />
          수정일시 오래된순
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleSortChange('createdAt', 'desc')}
          className={sortBy === 'createdAt' && sortOrder === 'desc' ? 'bg-accent' : ''}
        >
          <Calendar className="h-4 w-4 mr-2" />
          생성일시 최신순
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleSortChange('createdAt', 'asc')}
          className={sortBy === 'createdAt' && sortOrder === 'asc' ? 'bg-accent' : ''}
        >
          <Calendar className="h-4 w-4 mr-2" />
          생성일시 오래된순
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleSortChange('title', 'asc')}
          className={sortBy === 'title' && sortOrder === 'asc' ? 'bg-accent' : ''}
        >
          <FileText className="h-4 w-4 mr-2" />
          제목 오름차순
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleSortChange('title', 'desc')}
          className={sortBy === 'title' && sortOrder === 'desc' ? 'bg-accent' : ''}
        >
          <FileText className="h-4 w-4 mr-2" />
          제목 내림차순
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


