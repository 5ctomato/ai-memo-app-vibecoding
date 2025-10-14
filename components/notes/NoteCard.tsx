// components/notes/NoteCard.tsx
// 개별 노트 카드 컴포넌트
// 노트의 제목, 미리보기, 생성일시, 수정일시를 표시하는 카드 형태의 UI 컴포넌트
// 이 컴포넌트는 노트 목록에서 각 노트를 시각적으로 표현하기 위해 존재합니다
// 관련 파일: components/notes/NotesList.tsx, app/notes/page.tsx

'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteButton } from './DeleteButton'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface NoteCardProps {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  isArchived?: boolean
}

export function NoteCard({ 
  id, 
  title, 
  content, 
  createdAt, 
  updatedAt, 
  isArchived = false 
}: NoteCardProps) {
  // 내용 미리보기 생성 (최대 150자)
  const preview = content.length > 150 
    ? content.substring(0, 150) + '...' 
    : content

  // 날짜 포맷팅
  const createdTimeAgo = formatDistanceToNow(createdAt, { 
    addSuffix: true, 
    locale: ko 
  })
  const updatedTimeAgo = formatDistanceToNow(updatedAt, { 
    addSuffix: true, 
    locale: ko 
  })

  // 수정일시가 생성일시와 다른 경우에만 표시
  const isUpdated = updatedAt.getTime() !== createdAt.getTime()

  return (
    <div className="group relative">
      <Link href={`/notes/${id}`} className="block">
        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight">
                {title}
              </CardTitle>
              {isArchived && (
                <Badge variant="secondary" className="ml-2 flex-shrink-0">
                  보관됨
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {preview || '내용이 없습니다.'}
            </CardDescription>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <span>생성: {createdTimeAgo}</span>
                {isUpdated && (
                  <span>• 수정: {updatedTimeAgo}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
      
      {/* 액션 버튼들 - 호버 시 표시 */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <DeleteButton 
          noteId={id} 
          noteTitle={title}
          isArchived={isArchived}
          variant="archive"
        />
      </div>
    </div>
  )
}
