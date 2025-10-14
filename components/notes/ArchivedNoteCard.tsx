// components/notes/ArchivedNoteCard.tsx
// 아카이브된 노트 카드 컴포넌트
// 아카이브된 노트의 정보를 표시하고 복구/영구삭제 버튼을 제공합니다
// 이 컴포넌트는 아카이브된 노트를 시각적으로 표현하고 관리 기능을 제공하기 위해 존재합니다
// 관련 파일: components/notes/DeleteButton.tsx, components/notes/RestoreButton.tsx

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteButton } from './DeleteButton'
import { RestoreButton } from './RestoreButton'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface ArchivedNoteCardProps {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  isArchived: boolean
}

export function ArchivedNoteCard({
  id,
  title,
  content,
  createdAt,
  updatedAt,
  isArchived,
}: ArchivedNoteCardProps) {
  // 미리보기 텍스트 생성 (100자 제한)
  const preview = content.length > 100 ? content.substring(0, 100) + '...' : content

  // 상대적 시간 표시
  const createdTimeAgo = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: ko,
  })

  const updatedTimeAgo = formatDistanceToNow(updatedAt, {
    addSuffix: true,
    locale: ko,
  })

  // 수정일시가 생성일시와 다른 경우에만 표시
  const isUpdated = updatedAt.getTime() !== createdAt.getTime()

  return (
    <div className="group relative">
      <Card className="hover:shadow-md transition-shadow duration-200 h-full border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight">
              {title}
            </CardTitle>
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              보관됨
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {preview || '내용이 없습니다.'}
          </CardDescription>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center space-x-2">
              <span>생성: {createdTimeAgo}</span>
              {isUpdated && (
                <span>• 수정: {updatedTimeAgo}</span>
              )}
            </div>
          </div>
          
          {/* 액션 버튼들 */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <RestoreButton 
              noteId={id} 
              noteTitle={title}
            />
            <DeleteButton 
              noteId={id} 
              noteTitle={title}
              isArchived={isArchived}
              variant="permanent"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



