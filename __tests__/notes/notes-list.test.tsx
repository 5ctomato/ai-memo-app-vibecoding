// __tests__/notes/notes-list.test.tsx
// 노트 목록 컴포넌트 단위 테스트
// NotesList, NoteCard, Pagination, SortOptions 컴포넌트의 렌더링과 상호작용을 테스트합니다
// 이 테스트는 노트 목록 기능이 정상적으로 작동하는지 검증하기 위해 존재합니다
// 관련 파일: components/notes/NotesList.tsx, components/notes/NoteCard.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotesList } from '@/components/notes/NotesList'
import { NoteCard } from '@/components/notes/NoteCard'
import { Pagination } from '@/components/notes/Pagination'
import { SortOptions } from '@/components/notes/SortOptions'
import { EmptyState } from '@/components/notes/EmptyState'
import { LoadingState } from '@/components/notes/LoadingState'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2시간 전'),
}))

describe('NotesList', () => {
  const mockNotes = [
    {
      id: '1',
      title: '테스트 노트 1',
      content: '이것은 테스트 노트입니다.',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      isArchived: false,
    },
    {
      id: '2',
      title: '테스트 노트 2',
      content: '또 다른 테스트 노트입니다.',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      isArchived: false,
    },
  ]

  const mockPagination = {
    currentPage: 1,
    totalPages: 1,
    totalCount: 2,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  }

  const mockSort = {
    sortBy: 'updatedAt' as const,
    sortOrder: 'desc' as const,
  }

  it('노트 목록이 정상적으로 렌더링된다', () => {
    render(
      <NotesList
        notes={mockNotes}
        pagination={mockPagination}
        sort={mockSort}
      />
    )

    expect(screen.getByText('내 노트')).toBeInTheDocument()
    expect(screen.getByText('총 2개의 노트')).toBeInTheDocument()
    expect(screen.getByText('테스트 노트 1')).toBeInTheDocument()
    expect(screen.getByText('테스트 노트 2')).toBeInTheDocument()
  })

  it('로딩 상태가 정상적으로 표시된다', () => {
    render(
      <NotesList
        notes={[]}
        pagination={mockPagination}
        sort={mockSort}
        isLoading={true}
      />
    )

    // LoadingState 컴포넌트가 렌더링되는지 확인
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('빈 상태가 정상적으로 표시된다', () => {
    render(
      <NotesList
        notes={[]}
        pagination={{ ...mockPagination, totalCount: 0 }}
        sort={mockSort}
      />
    )

    expect(screen.getByText('아직 노트가 없습니다')).toBeInTheDocument()
    expect(screen.getByText('새 노트 작성하기')).toBeInTheDocument()
  })
})

describe('NoteCard', () => {
  const mockNote = {
    id: '1',
    title: '테스트 노트',
    content: '이것은 테스트 노트입니다. 내용이 길어서 미리보기로 표시되어야 합니다.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isArchived: false,
  }

  it('노트 카드가 정상적으로 렌더링된다', () => {
    render(<NoteCard {...mockNote} />)

    expect(screen.getByText('테스트 노트')).toBeInTheDocument()
    expect(screen.getByText(/이것은 테스트 노트입니다/)).toBeInTheDocument()
  })

  it('보관된 노트에 보관됨 배지가 표시된다', () => {
    render(<NoteCard {...mockNote} isArchived={true} />)

    expect(screen.getByText('보관됨')).toBeInTheDocument()
  })

  it('긴 내용이 미리보기로 잘린다', () => {
    const longContent = 'a'.repeat(200)
    render(<NoteCard {...mockNote} content={longContent} />)

    const contentElement = screen.getByText(/...$/)
    expect(contentElement).toBeInTheDocument()
  })
})

describe('Pagination', () => {
  const mockProps = {
    currentPage: 2,
    totalPages: 5,
    hasNextPage: true,
    hasPrevPage: true,
  }

  it('페이지네이션이 정상적으로 렌더링된다', () => {
    render(<Pagination {...mockProps} />)

    expect(screen.getByText('이전')).toBeInTheDocument()
    expect(screen.getByText('다음')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // 현재 페이지
  })

  it('첫 페이지에서 이전 버튼이 비활성화된다', () => {
    render(<Pagination {...mockProps} currentPage={1} hasPrevPage={false} />)

    expect(screen.getByText('이전')).toBeDisabled()
  })

  it('마지막 페이지에서 다음 버튼이 비활성화된다', () => {
    render(<Pagination {...mockProps} currentPage={5} hasNextPage={false} />)

    expect(screen.getByText('다음')).toBeDisabled()
  })
})

describe('SortOptions', () => {
  it('정렬 옵션이 정상적으로 렌더링된다', () => {
    render(<SortOptions sortBy="updatedAt" sortOrder="desc" />)

    expect(screen.getByText('수정일시')).toBeInTheDocument()
  })

  it('정렬 옵션 드롭다운이 열린다', async () => {
    render(<SortOptions sortBy="updatedAt" sortOrder="desc" />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    // 드롭다운이 열릴 때까지 기다림
    await waitFor(() => {
      expect(screen.getByText('수정일시 최신순')).toBeInTheDocument()
    })

    expect(screen.getByText('수정일시 오래된순')).toBeInTheDocument()
    expect(screen.getByText('생성일시 최신순')).toBeInTheDocument()
    expect(screen.getByText('제목 오름차순')).toBeInTheDocument()
  })
})

describe('EmptyState', () => {
  it('빈 상태가 정상적으로 렌더링된다', () => {
    render(<EmptyState />)

    expect(screen.getByText('아직 노트가 없습니다')).toBeInTheDocument()
    expect(screen.getByText('새 노트 작성하기')).toBeInTheDocument()
  })
})

describe('LoadingState', () => {
  it('로딩 상태가 정상적으로 렌더링된다', () => {
    render(<LoadingState />)

    // Skeleton 컴포넌트들이 렌더링되는지 확인
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
