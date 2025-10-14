// __tests__/notes/note-detail.test.tsx
// 노트 상세 조회 관련 컴포넌트 테스트
// NoteDetail, EditNoteForm 컴포넌트의 렌더링과 상호작용을 테스트합니다
// 이 테스트는 노트 상세 조회 기능이 정상적으로 작동하는지 확인하기 위해 존재합니다
// 관련 파일: components/notes/NoteDetail.tsx, components/notes/EditNoteForm.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NoteDetail } from '@/components/notes/NoteDetail'
import { EditNoteForm } from '@/components/notes/EditNoteForm'
import { useRouter } from 'next/navigation'

// Next.js router 모킹
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Server Actions 모킹
jest.mock('@/lib/actions/notes', () => ({
  updateNote: jest.fn(),
  autoSaveNote: jest.fn(),
}))

const mockNote = {
  id: 'test-note-id',
  title: '테스트 노트',
  content: '이것은 테스트용 노트입니다.',
  isArchived: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
}

const mockUpdatedNote = {
  id: 'test-note-id',
  title: '수정된 테스트 노트',
  content: '이것은 수정된 테스트용 노트입니다.',
  isArchived: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
}

describe('NoteDetail', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      back: jest.fn(),
    })
  })

  it('노트 상세 정보가 정상적으로 렌더링된다', () => {
    render(<NoteDetail note={mockNote} />)
    
    expect(screen.getByText('테스트 노트')).toBeInTheDocument()
    expect(screen.getByText('이것은 테스트용 노트입니다.')).toBeInTheDocument()
    expect(screen.getByText('목록으로 돌아가기')).toBeInTheDocument()
    expect(screen.getByText('편집')).toBeInTheDocument()
  })

  it('보관된 노트는 보관됨 배지가 표시된다', () => {
    const archivedNote = { ...mockNote, isArchived: true }
    render(<NoteDetail note={archivedNote} />)
    
    expect(screen.getByText('보관됨')).toBeInTheDocument()
  })

  it('내용이 없는 노트는 기본 메시지가 표시된다', () => {
    const emptyNote = { ...mockNote, content: '' }
    render(<NoteDetail note={emptyNote} />)
    
    expect(screen.getByText('내용이 없습니다.')).toBeInTheDocument()
  })

  it('편집 버튼을 클릭하면 편집 페이지로 이동한다', () => {
    render(<NoteDetail note={mockNote} />)
    
    const editButton = screen.getByText('편집')
    expect(editButton.closest('a')).toHaveAttribute('href', '/notes/test-note-id/edit')
  })

  it('목록으로 돌아가기 버튼을 클릭하면 목록 페이지로 이동한다', () => {
    render(<NoteDetail note={mockNote} />)
    
    const backButton = screen.getByText('목록으로 돌아가기')
    expect(backButton.closest('a')).toHaveAttribute('href', '/notes')
  })
})

describe('EditNoteForm', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  }

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter)
    jest.clearAllMocks()
  })

  it('노트 수정 폼이 정상적으로 렌더링된다', () => {
    render(<EditNoteForm note={mockNote} />)
    
    expect(screen.getByDisplayValue('테스트 노트')).toBeInTheDocument()
    expect(screen.getByDisplayValue('이것은 테스트용 노트입니다.')).toBeInTheDocument()
    expect(screen.getByText('노트 편집')).toBeInTheDocument()
  })

  it('제목을 수정할 수 있다', () => {
    render(<EditNoteForm note={mockNote} />)
    
    const titleInput = screen.getByDisplayValue('테스트 노트')
    fireEvent.change(titleInput, { target: { value: '수정된 제목' } })
    
    expect(titleInput).toHaveValue('수정된 제목')
  })

  it('본문을 수정할 수 있다', () => {
    render(<EditNoteForm note={mockNote} />)
    
    const contentTextarea = screen.getByDisplayValue('이것은 테스트용 노트입니다.')
    fireEvent.change(contentTextarea, { target: { value: '수정된 내용' } })
    
    expect(contentTextarea).toHaveValue('수정된 내용')
  })

  it('제목이 비어있으면 에러 메시지가 표시된다', async () => {
    render(<EditNoteForm note={mockNote} />)
    
    const titleInput = screen.getByDisplayValue('테스트 노트')
    fireEvent.change(titleInput, { target: { value: '' } })
    
    await waitFor(() => {
      expect(screen.getByText('제목은 필수입니다.')).toBeInTheDocument()
    })
  })

  it('제목이 200자를 초과하면 에러 메시지가 표시된다', async () => {
    render(<EditNoteForm note={mockNote} />)
    
    const titleInput = screen.getByDisplayValue('테스트 노트')
    const longTitle = 'a'.repeat(201)
    fireEvent.change(titleInput, { target: { value: longTitle } })
    
    await waitFor(() => {
      expect(screen.getByText('제목은 200자 이내로 입력해주세요.')).toBeInTheDocument()
    })
  })

  it('본문이 10000자를 초과하면 에러 메시지가 표시된다', async () => {
    render(<EditNoteForm note={mockNote} />)
    
    const contentTextarea = screen.getByDisplayValue('이것은 테스트용 노트입니다.')
    const longContent = 'a'.repeat(10001)
    fireEvent.change(contentTextarea, { target: { value: longContent } })
    
    await waitFor(() => {
      expect(screen.getByText('본문은 10,000자 이내로 입력해주세요.')).toBeInTheDocument()
    })
  })

  it('뒤로 버튼을 클릭하면 이전 페이지로 이동한다', () => {
    render(<EditNoteForm note={mockNote} />)
    
    const backButton = screen.getByText('뒤로')
    fireEvent.click(backButton)
    
    expect(mockRouter.back).toHaveBeenCalled()
  })

  it('취소 버튼을 클릭하면 이전 페이지로 이동한다', () => {
    render(<EditNoteForm note={mockNote} />)
    
    const cancelButton = screen.getByText('취소')
    fireEvent.click(cancelButton)
    
    expect(mockRouter.back).toHaveBeenCalled()
  })
})


