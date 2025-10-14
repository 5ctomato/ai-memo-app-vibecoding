// lib/actions/notes.ts
// 노트 관련 Server Actions 정의 파일
// 노트 생성, 조회, 수정, 삭제 등의 서버 사이드 로직을 처리합니다
// 이 파일은 Next.js Server Actions를 통해 클라이언트에서 노트 데이터를 안전하게 조작하기 위해 존재합니다
// 관련 파일: drizzle/schema.ts, lib/supabase/server.ts, components/notes/CreateNoteForm.tsx

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { notes, users, summaries } from '@/drizzle/schema'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { desc, asc, eq, count, or, like } from 'drizzle-orm'
import { getGeminiClient } from '@/lib/ai/gemini'

// 노트 생성 스키마 정의
const createNoteSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다').max(200, '제목은 200자를 초과할 수 없습니다'),
  content: z.string().max(10000, '본문은 10,000자를 초과할 수 없습니다').optional().default(''),
})

// 노트 목록 조회 스키마 정의
const getNotesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// 노트 수정 스키마 정의
const updateNoteSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다').max(200, '제목은 200자를 초과할 수 없습니다'),
  content: z.string().max(10000, '본문은 10,000자를 초과할 수 없습니다').optional().default(''),
})

// 노트 생성 Server Action
export async function saveNote(formData: FormData) {
  try {
    console.log('saveNote 함수 시작')
    
    // 임시로 인증 체크를 비활성화하여 테스트
    // TODO: 실제 배포 시에는 인증을 활성화해야 함
    // const supabase = createServerClient()
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // if (authError || !user) {
    //   return {
    //     success: false,
    //     error: '인증이 필요합니다. 로그인해주세요.'
    //   }
    // }

    // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    // UUID 형식으로 생성 - getNotes와 동일한 ID 사용
    const userId = '00000000-0000-0000-0000-000000000000'
    console.log('사용자 ID:', userId)

    // 폼 데이터 추출 및 검증
    const rawData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string || '',
    }
    console.log('폼 데이터:', rawData)

    const validatedData = createNoteSchema.parse(rawData)
    console.log('검증된 데이터:', validatedData)

    console.log('데이터베이스 연결 테스트 시작')
    
    // 먼저 테스트용 사용자 생성 (존재하지 않는 경우)
    try {
      await db
        .insert(users)
        .values({
          id: userId,
          email: `test-${userId}@example.com`,
        })
        .onConflictDoNothing()
    } catch (userError) {
      console.log('사용자 생성 중 오류 (무시):', userError)
    }
    
    // 노트 생성
    const [newNote] = await db
      .insert(notes)
      .values({
        userId: userId,
        title: validatedData.title,
        content: validatedData.content,
      })
      .returning()

    console.log('노트 생성 성공:', newNote)

    // 캐시 무효화
    revalidatePath('/notes')
    
    return {
      success: true,
      data: newNote
    }

  } catch (error) {
    console.error('노트 생성 오류:', error)
    console.error('오류 상세:', error instanceof Error ? error.message : error)
    console.error('오류 스택:', error instanceof Error ? error.stack : 'No stack trace')
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      }
    }

    return {
      success: false,
      error: `노트 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

// 노트 생성 후 리다이렉트를 위한 Server Action
export async function createNoteAndRedirect(formData: FormData) {
  const result = await saveNote(formData)
  
  if (result.success) {
    redirect('/notes')
  }
  
  return result
}

// 노트 목록 조회 Server Action
export async function getNotes(params: {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    console.log('getNotes 함수 시작, 파라미터:', params)
    
    // 파라미터 검증
    const validatedParams = getNotesSchema.parse(params)
    console.log('검증된 파라미터:', validatedParams)
    
    // 임시로 인증 체크를 비활성화하여 테스트
    // TODO: 실제 배포 시에는 인증을 활성화해야 함
    // const supabase = createServerClient()
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // if (authError || !user) {
    //   return {
    //     success: false,
    //     error: '인증이 필요합니다. 로그인해주세요.'
    //   }
    // }

    // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    // TODO: 실제로는 모든 사용자의 노트를 조회하거나 특정 사용자 ID를 받아야 함
    const userId = '00000000-0000-0000-0000-000000000000' // UUID 형식의 임시 ID
    
    // 정렬 옵션 설정
    const sortColumn = validatedParams.sortBy === 'title' 
      ? notes.title 
      : validatedParams.sortBy === 'createdAt' 
        ? notes.createdAt 
        : notes.updatedAt
    
    const sortFunction = validatedParams.sortOrder === 'asc' ? asc : desc
    
    // 총 노트 수 조회
    const [totalCountResult] = await db
      .select({ count: count() })
      .from(notes)
      .where(eq(notes.userId, userId))
    
    const totalCount = totalCountResult.count
    const totalPages = Math.ceil(totalCount / validatedParams.limit)
    const offset = (validatedParams.page - 1) * validatedParams.limit
    
    console.log(`총 노트 수: ${totalCount}, 총 페이지: ${totalPages}, 오프셋: ${offset}`)
    
    // 노트 목록 조회
    const notesList = await db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        isArchived: notes.isArchived,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(sortFunction(sortColumn))
      .limit(validatedParams.limit)
      .offset(offset)
    
    console.log(`조회된 노트 수: ${notesList.length}`)
    
    return {
      success: true,
      data: {
        notes: notesList,
        pagination: {
          currentPage: validatedParams.page,
          totalPages,
          totalCount,
          limit: validatedParams.limit,
          hasNextPage: validatedParams.page < totalPages,
          hasPrevPage: validatedParams.page > 1,
        },
        sort: {
          sortBy: validatedParams.sortBy,
          sortOrder: validatedParams.sortOrder,
        }
      }
    }
    
  } catch (error) {
    console.error('노트 목록 조회 오류:', error)
    console.error('오류 상세:', error instanceof Error ? error.message : error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      }
    }

    return {
      success: false,
      error: `노트 목록 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

// 노트 상세 조회 Server Action
export async function getNoteById(noteId: string) {
  try {
    console.log('getNoteById 함수 시작, 노트 ID:', noteId)
    
    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(noteId)) {
      return {
        success: false,
        error: '유효하지 않은 노트 ID입니다.'
      }
    }
    
    // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = '00000000-0000-0000-0000-000000000000'
    
    // 노트 조회
    const [note] = await db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        isArchived: notes.isArchived,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1)
    
    if (!note) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.'
      }
    }
    
    console.log('노트 조회 성공:', note)
    
    return {
      success: true,
      data: note
    }
    
  } catch (error) {
    console.error('노트 상세 조회 오류:', error)
    console.error('오류 상세:', error instanceof Error ? error.message : error)
    
    return {
      success: false,
      error: `노트 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

// 노트 수정 Server Action
export async function updateNote(noteId: string, formData: FormData) {
  try {
    console.log('updateNote 함수 시작, 노트 ID:', noteId)
    
    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(noteId)) {
      return {
        success: false,
        error: '유효하지 않은 노트 ID입니다.'
      }
    }
    
    // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = '00000000-0000-0000-0000-000000000000'
    
    // 폼 데이터 추출 및 검증
    const rawData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string || '',
    }
    console.log('수정할 데이터:', rawData)
    
    const validatedData = updateNoteSchema.parse(rawData)
    console.log('검증된 데이터:', validatedData)
    
    // 노트 존재 여부 및 권한 확인
    const [existingNote] = await db
      .select({ id: notes.id, userId: notes.userId })
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1)
    
    if (!existingNote) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.'
      }
    }
    
    // 노트 수정
    const [updatedNote] = await db
      .update(notes)
      .set({
        title: validatedData.title,
        content: validatedData.content,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, noteId))
      .returning()
    
    console.log('노트 수정 성공:', updatedNote)
    
    // 캐시 무효화
    revalidatePath('/notes')
    revalidatePath(`/notes/${noteId}`)
    
    return {
      success: true,
      data: updatedNote
    }
    
  } catch (error) {
    console.error('노트 수정 오류:', error)
    console.error('오류 상세:', error instanceof Error ? error.message : error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      }
    }
    
    return {
      success: false,
      error: `노트 수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

// 실시간 저장을 위한 Server Action
export async function autoSaveNote(noteId: string, data: { title: string, content: string }) {
  try {
    console.log('autoSaveNote 함수 시작, 노트 ID:', noteId)
    
    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(noteId)) {
      return {
        success: false,
        error: '유효하지 않은 노트 ID입니다.'
      }
    }
    
    // 데이터 검증
    const validatedData = updateNoteSchema.parse(data)
    
    // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = '00000000-0000-0000-0000-000000000000'
    
    // 노트 존재 여부 확인
    const [existingNote] = await db
      .select({ id: notes.id })
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1)
    
    if (!existingNote) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.'
      }
    }
    
    // 노트 자동 저장
    await db
      .update(notes)
      .set({
        title: validatedData.title,
        content: validatedData.content,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, noteId))
    
    console.log('노트 자동 저장 성공')
    
    // 캐시 무효화
    revalidatePath('/notes')
    revalidatePath(`/notes/${noteId}`)
    
    return {
      success: true
    }
    
  } catch (error) {
    console.error('노트 자동 저장 오류:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      }
    }
    
    return {
      success: false,
      error: `자동 저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

// 노트 아카이브 (소프트 삭제) Server Action
export async function archiveNote(noteId: string) {
  try {
    console.log('archiveNote 함수 시작, 노트 ID:', noteId)
    
    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(noteId)) {
      return {
        success: false,
        error: '유효하지 않은 노트 ID입니다.'
      }
    }
    
    // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = '00000000-0000-0000-0000-000000000000'
    
    // 노트 존재 여부 및 권한 확인
    const [existingNote] = await db
      .select({ id: notes.id, userId: notes.userId, isArchived: notes.isArchived })
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1)
    
    if (!existingNote) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.'
      }
    }
    
    if (existingNote.isArchived) {
      return {
        success: false,
        error: '이미 아카이브된 노트입니다.'
      }
    }
    
    // 노트 아카이브
    const [archivedNote] = await db
      .update(notes)
      .set({
        isArchived: true,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, noteId))
      .returning()
    
    console.log('노트 아카이브 성공:', archivedNote)
    
    // 캐시 무효화
    revalidatePath('/notes')
    revalidatePath(`/notes/${noteId}`)
    
    return {
      success: true,
      data: archivedNote
    }
    
  } catch (error) {
    console.error('노트 아카이브 오류:', error)
    console.error('오류 상세:', error instanceof Error ? error.message : error)
    
    return {
      success: false,
      error: `노트 아카이브 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

// 노트 복구 Server Action
export async function restoreNote(noteId: string) {
  try {
    console.log('restoreNote 함수 시작, 노트 ID:', noteId)
    
    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(noteId)) {
      return {
        success: false,
        error: '유효하지 않은 노트 ID입니다.'
      }
    }
    
    // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = '00000000-0000-0000-0000-000000000000'
    
    // 노트 존재 여부 및 권한 확인
    const [existingNote] = await db
      .select({ id: notes.id, userId: notes.userId, isArchived: notes.isArchived })
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1)
    
    if (!existingNote) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.'
      }
    }
    
    if (!existingNote.isArchived) {
      return {
        success: false,
        error: '아카이브되지 않은 노트입니다.'
      }
    }
    
    // 노트 복구
    const [restoredNote] = await db
      .update(notes)
      .set({
        isArchived: false,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, noteId))
      .returning()
    
    console.log('노트 복구 성공:', restoredNote)
    
    // 캐시 무효화
    revalidatePath('/notes')
    revalidatePath('/notes/archive')
    revalidatePath(`/notes/${noteId}`)
    
    return {
      success: true,
      data: restoredNote
    }
    
  } catch (error) {
    console.error('노트 복구 오류:', error)
    console.error('오류 상세:', error instanceof Error ? error.message : error)
    
    return {
      success: false,
      error: `노트 복구 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

// 노트 영구 삭제 Server Action
export async function deleteNotePermanently(noteId: string) {
  try {
    console.log('deleteNotePermanently 함수 시작, 노트 ID:', noteId)
    
    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(noteId)) {
      return {
        success: false,
        error: '유효하지 않은 노트 ID입니다.'
      }
    }
    
    // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = '00000000-0000-0000-0000-000000000000'
    
    // 노트 존재 여부 및 권한 확인
    const [existingNote] = await db
      .select({ id: notes.id, userId: notes.userId })
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1)
    
    if (!existingNote) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.'
      }
    }
    
    // 노트 영구 삭제
    await db
      .delete(notes)
      .where(eq(notes.id, noteId))
    
    console.log('노트 영구 삭제 성공')
    
    // 캐시 무효화
    revalidatePath('/notes')
    revalidatePath('/notes/archive')
    
    return {
      success: true
    }
    
  } catch (error) {
    console.error('노트 영구 삭제 오류:', error)
    console.error('오류 상세:', error instanceof Error ? error.message : error)
    
    return {
      success: false,
      error: `노트 영구 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

// 아카이브된 노트 목록 조회 Server Action
export async function getArchivedNotes(params: {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    console.log('getArchivedNotes 함수 시작, 파라미터:', params)
    
    // 파라미터 검증
    const validatedParams = getNotesSchema.parse(params)
    console.log('검증된 파라미터:', validatedParams)
    
    // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = '00000000-0000-0000-0000-000000000000'
    
    // 정렬 옵션 설정
    const sortColumn = validatedParams.sortBy === 'title' 
      ? notes.title 
      : validatedParams.sortBy === 'createdAt' 
        ? notes.createdAt 
        : notes.updatedAt
    
    const sortFunction = validatedParams.sortOrder === 'asc' ? asc : desc
    
    // 총 아카이브된 노트 수 조회
    const [totalCountResult] = await db
      .select({ count: count() })
      .from(notes)
      .where(eq(notes.userId, userId))
      .where(eq(notes.isArchived, true))
    
    const totalCount = totalCountResult.count
    const totalPages = Math.ceil(totalCount / validatedParams.limit)
    const offset = (validatedParams.page - 1) * validatedParams.limit
    
    console.log(`총 아카이브된 노트 수: ${totalCount}, 총 페이지: ${totalPages}, 오프셋: ${offset}`)
    
    // 아카이브된 노트 목록 조회
    const notesList = await db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        isArchived: notes.isArchived,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(eq(notes.userId, userId))
      .where(eq(notes.isArchived, true))
      .orderBy(sortFunction(sortColumn))
      .limit(validatedParams.limit)
      .offset(offset)
    
    console.log(`조회된 아카이브된 노트 수: ${notesList.length}`)
    
    return {
      success: true,
      data: {
        notes: notesList,
        pagination: {
          currentPage: validatedParams.page,
          totalPages,
          totalCount,
          limit: validatedParams.limit,
          hasNextPage: validatedParams.page < totalPages,
          hasPrevPage: validatedParams.page > 1,
        },
        sort: {
          sortBy: validatedParams.sortBy,
          sortOrder: validatedParams.sortOrder,
        }
      }
    }
    
  } catch (error) {
    console.error('아카이브된 노트 목록 조회 오류:', error)
    console.error('오류 상세:', error instanceof Error ? error.message : error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      }
    }

    return {
      success: false,
      error: `아카이브된 노트 목록 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

// 노트 검색 Server Action
export async function searchNotes(params: {
  query: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}) {
  try {
    console.log('searchNotes 함수 시작, 파라미터:', params)
    
    // 파라미터 검증
    const searchSchema = z.object({
      query: z.string().min(1, '검색어는 필수입니다.').max(100, '검색어는 100자 이내로 입력해주세요.'),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('updatedAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    })
    
    const validatedParams = searchSchema.parse(params)
    console.log('검증된 파라미터:', validatedParams)
    
    // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = '00000000-0000-0000-0000-000000000000'
    
    // 정렬 옵션 설정
    const sortColumn = validatedParams.sortBy === 'title' 
      ? notes.title 
      : validatedParams.sortBy === 'createdAt' 
        ? notes.createdAt 
        : notes.updatedAt
    
    const sortFunction = validatedParams.sortOrder === 'asc' ? asc : desc
    
    // 검색어로 필터링된 총 노트 수 조회
    const [totalCountResult] = await db
      .select({ count: count() })
      .from(notes)
      .where(eq(notes.userId, userId))
      .where(eq(notes.isArchived, false))
      .where(
        or(
          like(notes.title, `%${validatedParams.query}%`),
          like(notes.content, `%${validatedParams.query}%`)
        )
      )
    
    const totalCount = totalCountResult.count
    const totalPages = Math.ceil(totalCount / validatedParams.limit)
    const offset = (validatedParams.page - 1) * validatedParams.limit
    
    console.log(`검색 결과 총 노트 수: ${totalCount}, 총 페이지: ${totalPages}, 오프셋: ${offset}`)
    
    // 검색된 노트 목록 조회
    const notesList = await db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        isArchived: notes.isArchived,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(eq(notes.userId, userId))
      .where(eq(notes.isArchived, false))
      .where(
        or(
          like(notes.title, `%${validatedParams.query}%`),
          like(notes.content, `%${validatedParams.query}%`)
        )
      )
      .orderBy(sortFunction(sortColumn))
      .limit(validatedParams.limit)
      .offset(offset)
    
    console.log(`조회된 검색 결과 노트 수: ${notesList.length}`)
    
    return {
      success: true,
      data: {
        notes: notesList,
        pagination: {
          currentPage: validatedParams.page,
          totalPages,
          totalCount,
          limit: validatedParams.limit,
          hasNextPage: validatedParams.page < totalPages,
          hasPrevPage: validatedParams.page > 1,
        },
        sort: {
          sortBy: validatedParams.sortBy,
          sortOrder: validatedParams.sortOrder,
        },
        search: {
          query: validatedParams.query,
          resultCount: totalCount
        }
      }
    }
    
  } catch (error) {
    console.error('노트 검색 오류:', error)
    console.error('오류 상세:', error instanceof Error ? error.message : error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      }
    }

    return {
      success: false,
      error: `노트 검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

// AI 요약 생성 Server Action
export async function generateSummary(noteId: string) {
  try {
    console.log('generateSummary 함수 시작, 노트 ID:', noteId)
    
    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(noteId)) {
      return {
        success: false,
        error: '유효하지 않은 노트 ID입니다.'
      }
    }
    
    // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = '00000000-0000-0000-0000-000000000000'
    
    // 노트 존재 여부 및 권한 확인
    const [existingNote] = await db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        userId: notes.userId
      })
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1)
    
    if (!existingNote) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.'
      }
    }
    
    // 노트 내용이 비어있는지 확인
    if (!existingNote.content || existingNote.content.trim().length === 0) {
      return {
        success: false,
        error: '요약할 내용이 없습니다. 노트에 내용을 작성해주세요.'
      }
    }
    
    console.log('노트 내용 확인 완료, 요약 생성 시작')
    
    // GeminiClient를 사용하여 요약 생성
    const geminiClient = getGeminiClient()
    const summaryResult = await geminiClient.generateSummary(existingNote.content)
    
    console.log('요약 생성 성공:', summaryResult.data)
    
    // 기존 요약이 있는지 확인하고 삭제 (최신 요약만 유지)
    await db
      .delete(summaries)
      .where(eq(summaries.noteId, noteId))
    
    // 새로운 요약을 데이터베이스에 저장
    const [newSummary] = await db
      .insert(summaries)
      .values({
        noteId: noteId,
        model: summaryResult.model,
        content: summaryResult.data,
      })
      .returning()
    
    console.log('요약 저장 성공:', newSummary)
    
    // 캐시 무효화
    revalidatePath(`/notes/${noteId}`)
    
    return {
      success: true,
      data: {
        summary: newSummary,
        usage: summaryResult.usage,
        model: summaryResult.model
      }
    }
    
  } catch (error) {
    console.error('AI 요약 생성 오류:', error)
    console.error('오류 상세:', error instanceof Error ? error.message : error)
    
    // Gemini API 관련 에러 처리
    if (error instanceof Error) {
      if (error.message.includes('token limit')) {
        return {
          success: false,
          error: '노트 내용이 너무 깁니다. 더 짧은 내용으로 요약을 시도해주세요.'
        }
      }
      
      if (error.message.includes('API')) {
        return {
          success: false,
          error: 'AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }
      }
    }
    
    return {
      success: false,
      error: `요약 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

// 노트의 요약 조회 Server Action
export async function getNoteSummary(noteId: string) {
  try {
    console.log('getNoteSummary 함수 시작, 노트 ID:', noteId)
    
    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(noteId)) {
      return {
        success: false,
        error: '유효하지 않은 노트 ID입니다.'
      }
    }
    
    // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = '00000000-0000-0000-0000-000000000000'
    
    // 노트 존재 여부 확인
    const [existingNote] = await db
      .select({ id: notes.id, userId: notes.userId })
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1)
    
    if (!existingNote) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.'
      }
    }
    
    // 요약 조회 (최신 요약)
    const [summary] = await db
      .select({
        id: summaries.id,
        model: summaries.model,
        content: summaries.content,
        createdAt: summaries.createdAt,
      })
      .from(summaries)
      .where(eq(summaries.noteId, noteId))
      .orderBy(desc(summaries.createdAt))
      .limit(1)
    
    if (!summary) {
      return {
        success: true,
        data: null // 요약이 없음
      }
    }
    
    console.log('요약 조회 성공:', summary)
    
    return {
      success: true,
      data: summary
    }
    
  } catch (error) {
    console.error('요약 조회 오류:', error)
    console.error('오류 상세:', error instanceof Error ? error.message : error)
    
    return {
      success: false,
      error: `요약 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}
