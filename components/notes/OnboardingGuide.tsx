// components/notes/OnboardingGuide.tsx
// 온보딩 가이드 컴포넌트
// 신규 사용자에게 앱 사용법을 안내하는 인터랙티브 가이드를 제공합니다
// 이 컴포넌트는 사용자가 앱을 처음 사용할 때 기능을 쉽게 이해할 수 있게 하기 위해 존재합니다
// 관련 파일: components/notes/EmptyState.tsx, app/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Search, 
  Archive, 
  Edit,
  Plus,
  Home
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action?: string
  actionUrl?: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'AI 메모장에 오신 것을 환영합니다!',
    description: '간단하고 직관적인 메모 작성 도구로 아이디어를 기록하고 관리하세요.',
    icon: <FileText className="h-8 w-8 text-blue-600" />
  },
  {
    id: 'create',
    title: '노트 작성하기',
    description: '새 노트 버튼을 클릭하여 제목과 내용을 입력하고 저장하세요.',
    icon: <Plus className="h-8 w-8 text-green-600" />,
    action: '새 노트 작성하기',
    actionUrl: '/notes/create'
  },
  {
    id: 'edit',
    title: '노트 편집하기',
    description: '기존 노트를 클릭하여 상세보기에서 편집하거나 수정할 수 있습니다.',
    icon: <Edit className="h-8 w-8 text-orange-600" />
  },
  {
    id: 'organize',
    title: '노트 정리하기',
    description: '최신순, 제목순으로 정렬하고 페이지네이션으로 많은 노트를 관리하세요.',
    icon: <Archive className="h-8 w-8 text-purple-600" />
  },
  {
    id: 'search',
    title: '노트 검색하기',
    description: '제목이나 내용으로 노트를 빠르게 찾아보세요.',
    icon: <Search className="h-8 w-8 text-indigo-600" />
  }
]

interface OnboardingGuideProps {
  onComplete?: () => void
  onSkip?: () => void
}

export function OnboardingGuide({ onComplete, onSkip }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 로컬 스토리지에서 온보딩 완료 여부 확인
    const hasCompletedOnboarding = localStorage.getItem('onboarding-completed')
    if (!hasCompletedOnboarding) {
      setIsVisible(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('onboarding-completed', 'true')
    setIsVisible(false)
    onComplete?.()
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding-completed', 'true')
    setIsVisible(false)
    onSkip?.()
  }

  if (!isVisible) {
    return null
  }

  const currentStepData = onboardingSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === onboardingSteps.length - 1

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">시작하기</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* 진행률 표시 */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>단계 {currentStep + 1} / {onboardingSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 아이콘 및 제목 */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {currentStepData.icon}
            </div>
            <div>
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              <p className="text-muted-foreground mt-2">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          {currentStepData.action && currentStepData.actionUrl && (
            <div className="text-center">
              <Button asChild className="w-full">
                <a href={currentStepData.actionUrl}>
                  {currentStepData.action}
                </a>
              </Button>
            </div>
          )}

          {/* 네비게이션 버튼 */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>

            <div className="flex gap-2">
              {!isLastStep ? (
                <Button onClick={handleNext} className="gap-2">
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} className="gap-2">
                  완료
                </Button>
              )}
            </div>
          </div>

          {/* 건너뛰기 링크 */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              건너뛰기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



