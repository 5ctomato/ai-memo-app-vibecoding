// create-test-notes.js
// 테스트용 노트 생성 스크립트
// 데이터베이스에 샘플 노트들을 생성하여 "내 노트 보기" 기능을 테스트합니다

const { db } = require('./lib/db/index.ts')
const { notes, users } = require('./drizzle/schema.ts')

async function createTestNotes() {
  try {
    console.log('테스트 노트 생성 시작...')
    
    // 테스트 사용자 ID
    const userId = '00000000-0000-0000-0000-000000000000'
    
    // 먼저 테스트 사용자 생성
    try {
      await db
        .insert(users)
        .values({
          id: userId,
          email: `test-${userId}@example.com`,
        })
        .onConflictDoNothing()
      console.log('테스트 사용자 생성 완료')
    } catch (userError) {
      console.log('사용자 생성 중 오류 (무시):', userError)
    }
    
    // 테스트 노트 데이터
    const testNotes = [
      {
        userId: userId,
        title: '첫 번째 메모',
        content: '이것은 첫 번째 테스트 메모입니다. AI 메모장의 기능을 테스트하기 위한 샘플 데이터입니다.',
        isArchived: false,
      },
      {
        userId: userId,
        title: '회의 노트',
        content: '오늘 회의에서 논의한 내용:\n- 프로젝트 일정 검토\n- 다음 주 목표 설정\n- 팀원 역할 분담',
        isArchived: false,
      },
      {
        userId: userId,
        title: '아이디어 모음',
        content: '새로운 프로젝트 아이디어들:\n1. 모바일 앱 개발\n2. 웹사이트 리뉴얼\n3. 마케팅 전략 수립',
        isArchived: false,
      },
      {
        userId: userId,
        title: '학습 노트',
        content: 'React와 Next.js 학습 내용:\n- 컴포넌트 설계\n- 상태 관리\n- 서버 사이드 렌더링',
        isArchived: false,
      },
      {
        userId: userId,
        title: '아카이브된 메모',
        content: '이 메모는 아카이브된 상태입니다.',
        isArchived: true,
      }
    ]
    
    // 노트 생성
    for (const noteData of testNotes) {
      try {
        const [newNote] = await db
          .insert(notes)
          .values(noteData)
          .returning()
        console.log(`노트 생성 성공: ${newNote.title}`)
      } catch (noteError) {
        console.log(`노트 생성 실패 (${noteData.title}):`, noteError)
      }
    }
    
    console.log('테스트 노트 생성 완료!')
    
  } catch (error) {
    console.error('테스트 노트 생성 중 오류:', error)
  } finally {
    process.exit(0)
  }
}

createTestNotes()
