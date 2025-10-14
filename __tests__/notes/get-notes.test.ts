// __tests__/notes/get-notes.test.ts
// getNotes Server Action 단위 테스트
// 노트 목록 조회 기능의 다양한 시나리오를 테스트합니다
// 이 테스트는 Server Action이 정상적으로 작동하는지 검증하기 위해 존재합니다
// 관련 파일: lib/actions/notes.ts

import { getNotes } from '@/lib/actions/notes'

// Mock DrizzleORM
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              offset: jest.fn(() => Promise.resolve([
                {
                  id: '1',
                  title: '테스트 노트 1',
                  content: '내용 1',
                  isArchived: false,
                  createdAt: new Date('2024-01-01'),
                  updatedAt: new Date('2024-01-01'),
                },
                {
                  id: '2',
                  title: '테스트 노트 2',
                  content: '내용 2',
                  isArchived: false,
                  createdAt: new Date('2024-01-02'),
                  updatedAt: new Date('2024-01-02'),
                },
              ]))
            }))
          }))
        }))
      }))
    }))
  }
}))

// Mock count query
jest.mock('drizzle-orm', () => ({
  ...jest.requireActual('drizzle-orm'),
  count: jest.fn(() => 'count'),
  desc: jest.fn(() => 'desc'),
  asc: jest.fn(() => 'asc'),
  eq: jest.fn(() => 'eq'),
}))

describe('getNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('기본 파라미터로 노트 목록을 조회한다', async () => {
    const result = await getNotes({})

    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('notes')
    expect(result.data).toHaveProperty('pagination')
    expect(result.data).toHaveProperty('sort')
    expect(result.data.notes).toHaveLength(2)
  })

  it('페이지네이션 파라미터를 처리한다', async () => {
    const result = await getNotes({
      page: 2,
      limit: 5,
    })

    expect(result.success).toBe(true)
    expect(result.data.pagination.currentPage).toBe(2)
    expect(result.data.pagination.limit).toBe(5)
  })

  it('정렬 파라미터를 처리한다', async () => {
    const result = await getNotes({
      sortBy: 'title',
      sortOrder: 'asc',
    })

    expect(result.success).toBe(true)
    expect(result.data.sort.sortBy).toBe('title')
    expect(result.data.sort.sortOrder).toBe('asc')
  })

  it('잘못된 파라미터에 대해 에러를 반환한다', async () => {
    const result = await getNotes({
      page: -1,
      limit: 0,
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('데이터베이스 오류 시 에러를 반환한다', async () => {
    // Mock database error
    const mockDb = require('@/lib/db').db
    mockDb.select.mockImplementation(() => {
      throw new Error('Database connection failed')
    })

    const result = await getNotes({})

    expect(result.success).toBe(false)
    expect(result.error).toContain('Database connection failed')
  })
})



