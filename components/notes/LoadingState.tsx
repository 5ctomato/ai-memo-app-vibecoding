// components/notes/LoadingState.tsx
// 노트 목록 로딩 중에 표시되는 로딩 상태 UI 컴포넌트
// 사용자에게 데이터가 로딩 중임을 알리고 시각적 피드백을 제공합니다
// 이 컴포넌트는 사용자 경험을 개선하고 로딩 상태를 명확히 표시하기 위해 존재합니다
// 관련 파일: components/notes/NotesList.tsx, app/notes/page.tsx

'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}



