// components/notes/SummarySection.tsx
// 노트 요약 섹션 컴포넌트
// AI 요약 생성, 표시, 재생성 기능을 제공하는 독립적인 컴포넌트
// 관련 파일: lib/actions/notes.ts, app/notes/[id]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { generateSummary, getNoteSummary } from '@/lib/actions/notes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SummaryData {
  id: string
  model: string
  content: string
  createdAt: Date
}

interface SummarySectionProps {
  noteId: string
  noteContent: string
}

export default function SummarySection({ noteId, noteContent }: SummarySectionProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 컴포넌트 마운트 시 기존 요약 조회
  useEffect(() => {
    loadExistingSummary()
  }, [noteId])

  const loadExistingSummary = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await getNoteSummary(noteId)
      
      if (result.success) {
        setSummary(result.data)
      } else {
        console.error('요약 조회 실패:', result.error)
        setError('요약을 불러오는 중 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('요약 조회 중 오류:', err)
      setError('요약을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateSummary = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      
      const result = await generateSummary(noteId)
      
      if (result.success) {
        setSummary(result.data.summary)
        console.log('요약 생성 성공:', result.data)
      } else {
        setError(result.error || '요약 생성에 실패했습니다.')
      }
    } catch (err) {
      console.error('요약 생성 중 오류:', err)
      setError('요약 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerateSummary = async () => {
    await handleGenerateSummary()
  }

  // 노트 내용이 비어있는 경우 요약 생성 버튼 비활성화
  const canGenerateSummary = noteContent && noteContent.trim().length > 0

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">요약을 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI 요약
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!summary ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              이 노트의 AI 요약이 아직 생성되지 않았습니다.
            </p>
            <Button
              onClick={handleGenerateSummary}
              disabled={!canGenerateSummary || isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  요약 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI 요약 생성
                </>
              )}
            </Button>
            {!canGenerateSummary && (
              <p className="text-sm text-muted-foreground mt-2">
                노트에 내용을 작성한 후 요약을 생성할 수 있습니다.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {summary.model}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(summary.createdAt).toLocaleString()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateSummary}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                재생성
              </Button>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {summary.content}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
