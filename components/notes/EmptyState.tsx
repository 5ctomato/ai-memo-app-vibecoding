// components/notes/EmptyState.tsx
// 노트가 없을 때 표시되는 빈 상태 UI 컴포넌트
// 사용자에게 노트가 없다는 것을 알리고 새 노트 작성을 유도하는 UI를 제공합니다
// 이 컴포넌트는 사용자 경험을 개선하고 명확한 액션 가이드를 제공하기 위해 존재합니다
// 관련 파일: components/notes/NotesList.tsx, app/notes/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OnboardingGuide } from './OnboardingGuide'
import { FileText, Plus, Home, HelpCircle } from 'lucide-react'

interface EmptyStateProps {
  showOnboarding?: boolean
}

export function EmptyState({ showOnboarding = true }: EmptyStateProps) {
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    if (showOnboarding) {
      // 로컬 스토리지에서 온보딩 완료 여부 확인
      const hasCompletedOnboarding = localStorage.getItem('onboarding-completed')
      if (!hasCompletedOnboarding) {
        setShowGuide(true)
      }
    }
  }, [showOnboarding])

  const handleShowGuide = () => {
    setShowGuide(true)
  }

  const handleGuideComplete = () => {
    setShowGuide(false)
  }

  return (
    <>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">아직 노트가 없습니다</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            첫 번째 노트를 작성하여 생각과 아이디어를 기록해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/notes/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                새 노트 작성하기
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleShowGuide}
              className="gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              사용법 보기
            </Button>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                홈으로
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 온보딩 가이드 */}
      {showGuide && (
        <OnboardingGuide onComplete={handleGuideComplete} />
      )}
    </>
  )
}
