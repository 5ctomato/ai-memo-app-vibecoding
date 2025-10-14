// __tests__/notes/create-note.test.tsx
// 노트 생성 기능 테스트 파일
// CreateNoteForm 컴포넌트와 saveNote Server Action의 동작을 검증합니다
// 이 파일은 노트 생성 기능의 안정성을 보장하기 위해 존재합니다
// 관련 파일: components/notes/CreateNoteForm.tsx, lib/actions/notes.ts

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateNoteForm } from '@/components/notes/CreateNoteForm'
import { saveNote } from '@/lib/actions/notes'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}))

// Mock Server Action
jest.mock('@/lib/actions/notes', () => ({
  createNoteAndRedirect: jest.fn(),
  saveNote: jest.fn(),
}))

const mockCreateNoteAndRedirect = require('@/lib/actions/notes').createNoteAndRedirect

describe('CreateNoteForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('폼이 올바르게 렌더링된다', () => {
    render(<CreateNoteForm />)
    
    expect(screen.getByLabelText(/제목/)).toBeInTheDocument()
    expect(screen.getByLabelText(/본문/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /노트 생성/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /취소/ })).toBeInTheDocument()
  })

  it('제목 입력 시 실시간 유효성 검증이 작동한다', async () => {
    render(<CreateNoteForm />)
    
    const titleInput = screen.getByLabelText(/제목/)
    
    // 200자 초과 입력
    fireEvent.change(titleInput, { 
      target: { value: 'a'.repeat(201) } 
    })
    
    await waitFor(() => {
      expect(screen.getByText('제목은 200자를 초과할 수 없습니다.')).toBeInTheDocument()
    })
  })

  it('본문 입력 시 실시간 유효성 검증이 작동한다', async () => {
    render(<CreateNoteForm />)
    
    const contentInput = screen.getByLabelText(/본문/)
    
    // 10000자 초과 입력
    fireEvent.change(contentInput, { 
      target: { value: 'a'.repeat(10001) } 
    })
    
    await waitFor(() => {
      expect(screen.getByText('본문은 10,000자를 초과할 수 없습니다.')).toBeInTheDocument()
    })
  })

  it('폼 제출 시 Server Action이 호출된다', async () => {
    mockCreateNoteAndRedirect.mockResolvedValue({ success: true })
    
    render(<CreateNoteForm />)
    
    const titleInput = screen.getByLabelText(/제목/)
    const contentInput = screen.getByLabelText(/본문/)
    const submitButton = screen.getByRole('button', { name: /노트 생성/ })
    
    fireEvent.change(titleInput, { target: { value: '테스트 제목' } })
    fireEvent.change(contentInput, { target: { value: '테스트 본문' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockCreateNoteAndRedirect).toHaveBeenCalledWith(
        expect.any(FormData)
      )
    })
  })

  it('제출 버튼이 올바르게 렌더링된다', () => {
    render(<CreateNoteForm />)
    
    const submitButton = screen.getByRole('button', { name: /노트 생성/ })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('에러 발생 시 에러 메시지가 표시된다', async () => {
    mockCreateNoteAndRedirect.mockResolvedValue({ 
      success: false, 
      error: '테스트 에러' 
    })
    
    render(<CreateNoteForm />)
    
    const titleInput = screen.getByLabelText(/제목/)
    const submitButton = screen.getByRole('button', { name: /노트 생성/ })
    
    fireEvent.change(titleInput, { target: { value: '테스트 제목' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('테스트 에러')).toBeInTheDocument()
    })
  })
})

// Server Action 테스트는 통합 테스트에서 수행
// 여기서는 컴포넌트 테스트에 집중
