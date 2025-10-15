-- drizzle/migrations/insert_test_notes.sql
-- 요약 기능 테스트를 위한 노트 목업 데이터 생성
-- 다양한 길이와 주제의 노트를 생성하여 AI 요약 기능 테스트

-- 먼저 테스트용 사용자 생성 (이미 존재하는 경우 무시)
INSERT INTO users (id, email, created_at, updated_at) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'test@example.com',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 1. 짧은 일기 노트
INSERT INTO notes (id, user_id, title, content, is_archived, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  '오늘의 일기',
  '오늘은 정말 좋은 하루였다. 아침에 일어나서 커피를 마시고, 산책을 했다. 점심에는 맛있는 파스타를 먹었고, 오후에는 책을 읽었다. 저녁에는 친구와 영화를 보며 시간을 보냈다. 내일도 이런 좋은 하루가 되었으면 좋겠다.',
  false,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- 2. 긴 기술 문서
INSERT INTO notes (id, user_id, title, content, is_archived, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  'Next.js 14 App Router 완벽 가이드',
  'Next.js 14의 App Router는 React의 Server Components와 함께 사용하여 더 나은 성능과 개발자 경험을 제공합니다. App Router는 파일 시스템 기반 라우팅을 사용하며, 각 폴더는 route segment를 나타냅니다. 

주요 특징:
1. Server Components: 서버에서 렌더링되어 초기 로딩 시간을 단축
2. Streaming: 점진적으로 콘텐츠를 로드하여 사용자 경험 향상
3. Layouts: 중첩된 레이아웃을 통해 코드 재사용성 증대
4. Loading UI: 로딩 상태를 쉽게 관리
5. Error Handling: 에러 바운더리를 통한 에러 처리

App Router를 사용할 때 주의사항:
- 클라이언트 컴포넌트는 "use client" 지시어 필요
- Server Components에서는 브라우저 API 사용 불가
- 데이터 페칭은 async/await 패턴 사용
- 메타데이터는 generateMetadata 함수로 관리

실제 프로젝트에서 App Router를 적용할 때는 기존 Pages Router와의 차이점을 명확히 이해하고, 점진적으로 마이그레이션하는 것이 좋습니다.',
  false,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- 3. 회의록
INSERT INTO notes (id, user_id, title, content, is_archived, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440000',
  '주간 팀 미팅 회의록',
  '일시: 2024년 1월 15일 오후 2시
참석자: 김개발, 이디자인, 박기획, 최마케팅

안건:
1. 프로젝트 진행 상황 보고
   - 프론트엔드: 로그인/회원가입 기능 완료, 메인 페이지 80% 완료
   - 백엔드: API 설계 완료, 데이터베이스 스키마 정의 완료
   - 디자인: UI/UX 디자인 90% 완료, 모바일 반응형 작업 중

2. 이번 주 목표
   - 프론트엔드: 메인 페이지 완료, 검색 기능 구현
   - 백엔드: API 개발 시작, 인증 시스템 구현
   - 디자인: 모바일 디자인 완료, 디자인 시스템 문서화

3. 이슈 및 논의사항
   - API 응답 시간 최적화 필요
   - 모바일에서의 사용자 경험 개선 방안 논의
   - 다음 주 중간 발표 준비

다음 미팅: 1월 22일 오후 2시',
  false,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- 4. 학습 노트
INSERT INTO notes (id, user_id, title, content, is_archived, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440000',
  'TypeScript 고급 타입 정리',
  'TypeScript의 고급 타입들을 정리해보자.

1. Union Types (유니온 타입)
   - 여러 타입 중 하나를 허용
   - 예: string | number

2. Intersection Types (교차 타입)
   - 여러 타입을 모두 만족
   - 예: Person & Serializable

3. Generic Types (제네릭 타입)
   - 타입을 매개변수로 받는 타입
   - 예: Array<T>, Promise<T>

4. Conditional Types (조건부 타입)
   - 조건에 따라 타입을 결정
   - 예: T extends U ? X : Y

5. Mapped Types (매핑된 타입)
   - 기존 타입을 변환하여 새로운 타입 생성
   - 예: Partial<T>, Required<T>

6. Template Literal Types (템플릿 리터럴 타입)
   - 문자열 리터럴 타입을 조합
   - 예: `Hello ${string}`

실제 사용 예시:
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>; // 모든 속성이 선택적
type RequiredUser = Required<User>; // 모든 속성이 필수
type UserEmail = Pick<User, "email">; // 특정 속성만 선택',
  false,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
);

-- 5. 요리 레시피
INSERT INTO notes (id, user_id, title, content, is_archived, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440000',
  '김치찌개 레시피',
  '재료:
- 돼지고기 앞다리살 200g
- 김치 1컵
- 두부 1/2모
- 대파 1대
- 마늘 3쪽
- 고춧가루 2큰술
- 된장 1큰술
- 설탕 1작은술
- 물 2컵

만드는 방법:
1. 돼지고기를 한입 크기로 썰어 준비
2. 김치는 3cm 길이로 썰어 준비
3. 두부는 2cm 크기로 썰어 준비
4. 대파는 어슷하게 썰어 준비
5. 냄비에 돼지고기를 넣고 볶다가 김치를 넣어 함께 볶음
6. 고춧가루, 된장, 설탕을 넣고 볶음
7. 물을 넣고 끓인 후 두부를 넣음
8. 10분 정도 끓인 후 대파를 넣고 마무리

팁:
- 김치가 신맛이 강하면 설탕을 조금 더 넣어주세요
- 돼지고기 대신 소고기나 닭고기도 좋습니다
- 끓일 때 중간불로 천천히 끓이면 더 맛있어요',
  false,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
);

-- 6. 여행 계획
INSERT INTO notes (id, user_id, title, content, is_archived, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440000',
  '제주도 3박 4일 여행 계획',
  '여행 일정: 2024년 2월 10일 ~ 2월 13일

1일차 (2/10, 토)
- 오전: 제주공항 도착 (10:30)
- 점심: 제주시내 흑돼지 구이
- 오후: 용두암, 용머리해안
- 저녁: 제주시내 숙소 체크인
- 야간: 동문시장 탐방

2일차 (2/11, 일)
- 오전: 성산일출봉 (일출 관람)
- 점심: 성산 포구 회국수
- 오후: 섭지코지, 카멜리아힐
- 저녁: 서귀포시 숙소 이동

3일차 (2/12, 월)
- 오전: 중문관광단지, 천지연폭포
- 점심: 중문 흑돼지
- 오후: 한라수목원, 오설록티뮤지엄
- 저녁: 서귀포시내

4일차 (2/13, 화)
- 오전: 제주공항 출발 (12:00)

준비물:
- 여권, 신분증
- 여행자보험
- 카메라, 충전기
- 간편한 옷차림
- 현금, 카드

예산: 50만원 (항공료 제외)',
  false,
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days'
);

-- 7. 책 독서 노트
INSERT INTO notes (id, user_id, title, content, is_archived, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440007',
  '550e8400-e29b-41d4-a716-446655440000',
  '클린 코드 독서 노트',
  '로버트 C. 마틴의 "클린 코드"를 읽고 정리한 내용입니다.

핵심 원칙:
1. 의미 있는 이름 사용
   - 변수, 함수, 클래스 이름은 의도를 명확히 표현
   - 검색하기 쉬운 이름 사용
   - 인코딩을 피하라 (헝가리안 표기법 등)

2. 함수는 작게, 더 작게
   - 함수는 한 가지 일만 해야 함
   - 함수 인수는 적을수록 좋음
   - 부수 효과를 일으키지 마라

3. 주석
   - 코드로 의도를 표현할 수 없다면 주석을 사용
   - 좋은 주석: 법적인 정보, 의도를 설명하는 주석
   - 나쁜 주석: 코드를 중복하는 주석, 주석 처리된 코드

4. 형식 맞추기
   - 적절한 행 길이 유지 (200줄 이내)
   - 빈 행으로 개념 분리
   - 세로 밀도: 서로 밀접한 코드는 세로로 가까이

5. 객체와 자료 구조
   - 자료 추상화: 구현을 숨기고 추상화에 의존
   - 자료/객체 비대칭성 이해
   - 디미터 법칙: 모듈은 자신이 조작하는 객체의 속사항을 몰라야 함

인상 깊었던 구절:
"코드는 항상 다른 사람이 읽는다고 생각하고 작성하라. 그 다른 사람이 바로 6개월 후의 당신일 수도 있다."',
  false,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
);

-- 8. 운동 계획
INSERT INTO notes (id, user_id, title, content, is_archived, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440008',
  '550e8400-e29b-41d4-a716-446655440000',
  '1월 운동 계획표',
  '목표: 체중 3kg 감량, 근력 향상

주간 운동 스케줄:
월요일: 상체 근력 운동 (가슴, 어깨, 팔)
- 벤치프레스 3세트 x 10회
- 인클라인 덤벨프레스 3세트 x 12회
- 오버헤드 프레스 3세트 x 10회
- 랫풀다운 3세트 x 12회
- 바이셉 컬 3세트 x 15회
- 트라이셉 익스텐션 3세트 x 15회

화요일: 유산소 운동
- 러닝머신 30분 (속도 8km/h)
- 자전거 20분

수요일: 하체 근력 운동
- 스쿼트 4세트 x 12회
- 데드리프트 3세트 x 8회
- 레그프레스 3세트 x 15회
- 런지 3세트 x 12회 (각 다리)
- 카프레이즈 3세트 x 20회

목요일: 유산소 운동
- 수영 45분
- 또는 등산 1시간

금요일: 전신 근력 운동
- 버피 3세트 x 10회
- 마운틴 클라이머 3세트 x 30초
- 플랭크 3세트 x 1분
- 푸시업 3세트 x 15회

주말: 휴식 또는 가벼운 활동

식단 관리:
- 하루 칼로리: 1800kcal
- 단백질: 120g 이상
- 탄수화물: 200g 이하
- 지방: 60g 이하',
  false,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days'
);

-- 9. 프로젝트 아이디어
INSERT INTO notes (id, user_id, title, content, is_archived, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440009',
  '550e8400-e29b-41d4-a716-446655440000',
  '개인 프로젝트 아이디어 모음',
  '1. AI 기반 개인 비서 앱
   - 음성 인식으로 일정 관리
   - 자연어 처리로 스마트 알림
   - 개인화된 추천 시스템

2. 실시간 협업 도구
   - 화상회의 + 화이트보드 통합
   - 실시간 문서 편집
   - 프로젝트 관리 기능

3. 건강 관리 플랫폼
   - 운동 루틴 추천
   - 식단 관리 및 칼로리 계산
   - 건강 데이터 시각화

4. 언어 학습 앱
   - AI 튜터와 대화 연습
   - 발음 교정 기능
   - 개인화된 학습 계획

5. 투자 포트폴리오 관리
   - 실시간 주가 모니터링
   - 리스크 분석 및 알림
   - 투자 성과 추적

기술 스택 고려사항:
- 프론트엔드: React, Next.js, TypeScript
- 백엔드: Node.js, Express, Python
- 데이터베이스: PostgreSQL, MongoDB
- AI/ML: TensorFlow, PyTorch, OpenAI API
- 클라우드: AWS, Vercel, Supabase

우선순위:
1. AI 기반 개인 비서 앱 (가장 관심 있음)
2. 건강 관리 플랫폼 (시장성 좋음)
3. 언어 학습 앱 (기술적 도전)',
  false,
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '9 days'
);

-- 10. 짧은 메모 (요약 테스트용)
INSERT INTO notes (id, user_id, title, content, is_archived, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440000',
  '오늘 할 일',
  '1. 이메일 확인 및 답변
2. 프로젝트 문서 정리
3. 팀 미팅 준비
4. 점심 약속 (12시, 강남역)
5. 저녁 운동 (헬스장)',
  false,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
);

