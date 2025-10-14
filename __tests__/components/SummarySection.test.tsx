// __tests__/components/SummarySection.test.tsx
// SummarySection 컴포넌트 테스트 파일
// 컴포넌트의 렌더링, 상호작용, 상태 관리를 검증
// 관련 파일: components/notes/SummarySection.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SummarySection from '@/components/notes/SummarySection'
import { generateSummary, getNoteSummary } from '@/lib/actions/notes'

// 서버 액션 모킹
jest.mock('@/lib/actions/notes', () => ({
  generateSummary: jest.fn(),
  getNoteSummary: jest.fn(),
}))

const mockGenerateSummary = generateSummary as jest.MockedFunction<typeof generateSummary>
const mockGetNoteSummary = getNoteSummary as jest.MockedFunction<typeof getNoteSummary>

describe('SummarySection 컴포넌트', () => {
  const defaultProps = {
    noteId: '123e4567-e89b-12d3-a456-426614174000',
    noteContent: '이것은 테스트 노트의 내용입니다. 요약을 생성할 수 있는 충분한 내용을 포함하고 있습니다.',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('요약이 없는 경우 요약 생성 버튼을 표시해야 함', async () => {
    mockGetNoteSummary.mockResolvedValue({
      success: true,
      data: null,
    })

    render(<SummarySection {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('이 노트의 AI 요약이 아직 생성되지 않았습니다.')).toBeInTheDocument()
      expect(screen.getByText('AI 요약 생성')).toBeInTheDocument()
    })
  })

  it('요약이 있는 경우 요약 내용을 표시해야 함', async () => {
    const mockSummary = {
      id: 'summary-123',
      model: 'gemini-2.0-flash-001',
      content: '• 테스트 노트의 핵심 내용\n• 중요한 포인트들\n• 요약된 정보',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    }

    mockGetNoteSummary.mockResolvedValue({
      success: true,
      data: mockSummary,
    })

    render(<SummarySection {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('gemini-2.0-flash-001')).toBeInTheDocument()
      expect(screen.getByText(/• 테스트 노트의 핵심 내용/)).toBeInTheDocument()
      expect(screen.getByText(/• 중요한 포인트들/)).toBeInTheDocument()
      expect(screen.getByText(/• 요약된 정보/)).toBeInTheDocument()
      expect(screen.getByText('재생성')).toBeInTheDocument()
    })
  })

  it('요약 생성 버튼 클릭 시 요약을 생성해야 함', async () => {
    mockGetNoteSummary.mockResolvedValue({
      success: true,
      data: null,
    })

    const mockNewSummary = {
      id: 'summary-123',
      model: 'gemini-2.0-flash-001',
      content: '• 새로 생성된 요약',
      createdAt: new Date(),
    }

    mockGenerateSummary.mockResolvedValue({
      success: true,
      data: {
        summary: mockNewSummary,
        usage: { promptTokens: 10, responseTokens: 20, totalTokens: 30 },
        model: 'gemini-2.0-flash-001',
      },
    })

    render(<SummarySection {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('AI 요약 생성')).toBeInTheDocument()
    })

    const generateButton = screen.getByText('AI 요약 생성')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(mockGenerateSummary).toHaveBeenCalledWith(defaultProps.noteId)
    })

    await waitFor(() => {
      expect(screen.getByText('• 새로 생성된 요약')).toBeInTheDocument()
    })
  })

  it('재생성 버튼 클릭 시 요약을 재생성해야 함', async () => {
    const mockSummary = {
      id: 'summary-123',
      model: 'gemini-2.0-flash-001',
      content: '• 기존 요약 내용',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    }

    mockGetNoteSummary.mockResolvedValue({
      success: true,
      data: mockSummary,
    })

    const mockNewSummary = {
      id: 'summary-456',
      model: 'gemini-2.0-flash-001',
      content: '• 재생성된 요약 내용',
      createdAt: new Date(),
    }

    mockGenerateSummary.mockResolvedValue({
      success: true,
      data: {
        summary: mockNewSummary,
        usage: { promptTokens: 10, responseTokens: 20, totalTokens: 30 },
        model: 'gemini-2.0-flash-001',
      },
    })

    render(<SummarySection {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('재생성')).toBeInTheDocument()
    })

    const regenerateButton = screen.getByText('재생성')
    fireEvent.click(regenerateButton)

    await waitFor(() => {
      expect(mockGenerateSummary).toHaveBeenCalledWith(defaultProps.noteId)
    })

    await waitFor(() => {
      expect(screen.getByText('• 재생성된 요약 내용')).toBeInTheDocument()
    })
  })

  it('요약 생성 중 로딩 상태를 표시해야 함', async () => {
    mockGetNoteSummary.mockResolvedValue({
      success: true,
      data: null,
    })

    // 요약 생성을 지연시켜 로딩 상태 확인
    mockGenerateSummary.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        data: {
          summary: {
            id: 'summary-123',
            model: 'gemini-2.0-flash-001',
            content: '• 새 요약',
            createdAt: new Date(),
          },
          usage: { promptTokens: 10, responseTokens: 20, totalTokens: 30 },
          model: 'gemini-2.0-flash-001',
        },
      }), 100))
    )

    render(<SummarySection {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('AI 요약 생성')).toBeInTheDocument()
    })

    const generateButton = screen.getByText('AI 요약 생성')
    fireEvent.click(generateButton)

    // 로딩 상태 확인
    expect(screen.getByText('요약 생성 중...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('요약 생성 실패 시 에러 메시지를 표시해야 함', async () => {
    mockGetNoteSummary.mockResolvedValue({
      success: true,
      data: null,
    })

    mockGenerateSummary.mockResolvedValue({
      success: false,
      error: '요약 생성에 실패했습니다.',
    })

    render(<SummarySection {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('AI 요약 생성')).toBeInTheDocument()
    })

    const generateButton = screen.getByText('AI 요약 생성')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('요약 생성에 실패했습니다.')).toBeInTheDocument()
    })
  })

  it('빈 노트 내용의 경우 요약 생성 버튼을 비활성화해야 함', async () => {
    mockGetNoteSummary.mockResolvedValue({
      success: true,
      data: null,
    })

    render(<SummarySection noteId={defaultProps.noteId} noteContent="" />)

    await waitFor(() => {
      const generateButton = screen.getByText('AI 요약 생성')
      expect(generateButton).toBeDisabled()
      expect(screen.getByText('노트에 내용을 작성한 후 요약을 생성할 수 있습니다.')).toBeInTheDocument()
    })
  })

  it('요약 조회 실패 시 에러를 처리해야 함', async () => {
    mockGetNoteSummary.mockResolvedValue({
      success: false,
      error: '요약 조회에 실패했습니다.',
    })

    render(<SummarySection {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/요약을 불러오는 중 오류가 발생했습니다/)).toBeInTheDocument()
    })
  })
})
