// app/notes/layout.tsx
// 노트 관련 페이지들의 공통 레이아웃
// 노트 목록, 검색, 상세보기, 작성, 편집 페이지에서 공통으로 사용되는 레이아웃을 제공합니다
// 이 파일은 노트 관련 페이지들에서 Header와 AuthProvider를 공통으로 제공하기 위해 존재합니다
// 관련 파일: components/layout/Header.tsx, components/providers/AuthProvider.tsx, app/notes/page.tsx

import { AuthProvider } from '@/components/providers/AuthProvider'
import Header from '@/components/layout/Header'
import { Suspense } from 'react'

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Suspense fallback={<div>로딩 중...</div>}>
          <Header />
        </Suspense>

        {/* 페이지 컨텐츠 */}
        <main>
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
