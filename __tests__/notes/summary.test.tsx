// __tests__/notes/summary.test.tsx
// 노트 요약 기능 테스트 파일
// generateSummary 서버 액션과 SummarySection 컴포넌트의 기능을 검증
// 관련 파일: lib/actions/notes.ts, components/notes/SummarySection.tsx

import { generateSummary, getNoteSummary } from '@/lib/actions/notes'
import { getGeminiClient } from '@/lib/ai/gemini'
import { db } from '@/lib/db'
import { notes, summaries } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

// GeminiClient 모킹
jest.mock('@/lib/ai/gemini', () => ({
  getGeminiClient: jest.fn(),
}))

// 데이터베이스 모킹
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
  },
}))

// Next.js 캐시 모킹
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockGeminiClient = {
  generateSummary: jest.fn(),
}

const mockDb = db as jest.Mocked<typeof db>

describe('노트 요약 기능', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getGeminiClient as jest.Mock).mockReturnValue(mockGeminiClient)
  })

  describe('generateSummary', () => {
    it('유효한 노트 ID로 요약을 생성해야 함', async () => {
      const noteId = '123e4567-e89b-12d3-a456-426614174000'
      const mockNote = {
        id: noteId,
        title: '테스트 노트',
        content: '이것은 테스트 노트의 내용입니다.',
        userId: '00000000-0000-0000-0000-000000000000',
      }
      const mockSummary = {
        data: '• 테스트 노트의 핵심 내용\n• 중요한 포인트들\n• 요약된 정보',
        model: 'gemini-2.0-flash-001',
        usage: { promptTokens: 10, responseTokens: 20, totalTokens: 30 },
      }
      const mockSavedSummary = {
        id: 'summary-123',
        noteId: noteId,
        model: 'gemini-2.0-flash-001',
        content: '• 테스트 노트의 핵심 내용\n• 중요한 포인트들\n• 요약된 정보',
        createdAt: new Date(),
      }

      // 데이터베이스 모킹 설정
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockNote]),
          }),
        }),
      })
      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockSavedSummary]),
        }),
      })
      const mockDelete = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      })

      mockDb.select.mockImplementation(mockSelect)
      mockDb.insert.mockImplementation(mockInsert)
      mockDb.delete.mockImplementation(mockDelete)

      // GeminiClient 모킹
      mockGeminiClient.generateSummary.mockResolvedValue(mockSummary)

      const result = await generateSummary(noteId)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        summary: mockSavedSummary,
        usage: mockSummary.usage,
        model: mockSummary.model,
      })
      expect(mockGeminiClient.generateSummary).toHaveBeenCalledWith(mockNote.content)
    })

    it('유효하지 않은 노트 ID로 에러를 반환해야 함', async () => {
      const invalidNoteId = 'invalid-id'

      const result = await generateSummary(invalidNoteId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('유효하지 않은 노트 ID입니다.')
    })

    it('존재하지 않는 노트로 에러를 반환해야 함', async () => {
      const noteId = '123e4567-e89b-12d3-a456-426614174000'

      // 데이터베이스에서 노트를 찾지 못하는 경우
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      mockDb.select.mockImplementation(mockSelect)

      const result = await generateSummary(noteId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('노트를 찾을 수 없습니다.')
    })

    it('빈 내용의 노트로 에러를 반환해야 함', async () => {
      const noteId = '123e4567-e89b-12d3-a456-426614174000'
      const mockNote = {
        id: noteId,
        title: '빈 노트',
        content: '',
        userId: '00000000-0000-0000-0000-000000000000',
      }

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockNote]),
          }),
        }),
      })

      mockDb.select.mockImplementation(mockSelect)

      const result = await generateSummary(noteId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('요약할 내용이 없습니다. 노트에 내용을 작성해주세요.')
    })

    it('Gemini API 에러를 적절히 처리해야 함', async () => {
      const noteId = '123e4567-e89b-12d3-a456-426614174000'
      const mockNote = {
        id: noteId,
        title: '테스트 노트',
        content: '이것은 테스트 노트의 내용입니다.',
        userId: '00000000-0000-0000-0000-000000000000',
      }

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockNote]),
          }),
        }),
      })

      mockDb.select.mockImplementation(mockSelect)

      // Gemini API 에러 모킹
      mockGeminiClient.generateSummary.mockRejectedValue(
        new Error('API connection failed')
      )

      const result = await generateSummary(noteId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    })

    it('토큰 제한 초과 에러를 적절히 처리해야 함', async () => {
      const noteId = '123e4567-e89b-12d3-a456-426614174000'
      const mockNote = {
        id: noteId,
        title: '테스트 노트',
        content: '이것은 테스트 노트의 내용입니다.',
        userId: '00000000-0000-0000-0000-000000000000',
      }

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockNote]),
          }),
        }),
      })

      mockDb.select.mockImplementation(mockSelect)

      // 토큰 제한 에러 모킹
      mockGeminiClient.generateSummary.mockRejectedValue(
        new Error('Text exceeds token limit')
      )

      const result = await generateSummary(noteId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('노트 내용이 너무 깁니다. 더 짧은 내용으로 요약을 시도해주세요.')
    })
  })

  describe('getNoteSummary', () => {
    it('존재하는 요약을 반환해야 함', async () => {
      const noteId = '123e4567-e89b-12d3-a456-426614174000'
      const mockNote = {
        id: noteId,
        userId: '00000000-0000-0000-0000-000000000000',
      }
      const mockSummary = {
        id: 'summary-123',
        model: 'gemini-2.0-flash-001',
        content: '• 테스트 요약 내용',
        createdAt: new Date(),
      }

      // 노트 존재 확인 모킹
      const mockNoteSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockNote]),
          }),
        }),
      })

      // 요약 조회 모킹
      const mockSummarySelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([mockSummary]),
            }),
          }),
        }),
      })

      mockDb.select
        .mockImplementationOnce(mockNoteSelect)
        .mockImplementationOnce(mockSummarySelect)

      const result = await getNoteSummary(noteId)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSummary)
    })

    it('요약이 없는 경우 null을 반환해야 함', async () => {
      const noteId = '123e4567-e89b-12d3-a456-426614174000'
      const mockNote = {
        id: noteId,
        userId: '00000000-0000-0000-0000-000000000000',
      }

      // 노트 존재 확인 모킹
      const mockNoteSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockNote]),
          }),
        }),
      })

      // 요약 조회 모킹 (빈 결과)
      const mockSummarySelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      })

      mockDb.select
        .mockImplementationOnce(mockNoteSelect)
        .mockImplementationOnce(mockSummarySelect)

      const result = await getNoteSummary(noteId)

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it('존재하지 않는 노트로 에러를 반환해야 함', async () => {
      const noteId = '123e4567-e89b-12d3-a456-426614174000'

      // 노트가 존재하지 않는 경우
      const mockNoteSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      mockDb.select.mockImplementation(mockNoteSelect)

      const result = await getNoteSummary(noteId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('노트를 찾을 수 없습니다.')
    })
  })
})
