// components/notes/NoteDetail.tsx
// 노트 상세 정보 표시 컴포넌트
// 노트의 제목, 본문, 생성일시, 수정일시를 표시하고 편집 버튼을 제공합니다
// 이 컴포넌트는 사용자가 노트의 전체 내용을 읽고 편집할 수 있게 하기 위해 존재합니다
// 관련 파일: app/notes/[id]/page.tsx, components/notes/NoteNavigation.tsx

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteButton } from './DeleteButton'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ArrowLeft, Edit, Archive, Home } from 'lucide-react'

interface NoteDetailProps {
  note: {
    id: string
    title: string
    content: string
    isArchived: boolean
    createdAt: Date
    updatedAt: Date
  }
}

export function NoteDetail({ note }: NoteDetailProps) {
  // 날짜 포맷팅
  const createdTimeAgo = formatDistanceToNow(note.createdAt, { 
    addSuffix: true, 
    locale: ko 
  })
  const updatedTimeAgo = formatDistanceToNow(note.updatedAt, { 
    addSuffix: true, 
    locale: ko 
  })

  // 수정일시가 생성일시와 다른 경우에만 표시
  const isUpdated = note.updatedAt.getTime() !== note.createdAt.getTime()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 네비게이션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/notes">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              목록으로 돌아가기
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              홈
            </Button>
          </Link>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/notes/${note.id}/edit`}>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              편집
            </Button>
          </Link>
          <DeleteButton 
            noteId={note.id} 
            noteTitle={note.title}
            isArchived={note.isArchived}
            variant="archive"
          />
        </div>
      </div>

      {/* 노트 상세 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-2xl font-bold leading-tight">
              {note.title}
            </CardTitle>
            {note.isArchived && (
              <Badge variant="secondary" className="ml-2 flex-shrink-0">
                <Archive className="h-3 w-3 mr-1" />
                보관됨
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 노트 내용 */}
          <div className="prose prose-gray max-w-none">
            <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
              {note.content || '내용이 없습니다.'}
            </div>
          </div>
          
          {/* 메타 정보 */}
          <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>생성: {createdTimeAgo}</span>
                {isUpdated && (
                  <span>• 수정: {updatedTimeAgo}</span>
                )}
              </div>
              <div className="text-xs">
                노트 ID: {note.id}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
