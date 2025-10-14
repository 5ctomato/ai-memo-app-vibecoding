// app/notes/[id]/not-found.tsx
// 노트를 찾을 수 없을 때 표시되는 404 페이지
// 존재하지 않는 노트에 접근했을 때 사용자에게 친근한 안내를 제공합니다
// 이 페이지는 사용자 경험을 개선하고 명확한 에러 상태를 제공하기 위해 존재합니다
// 관련 파일: app/notes/[id]/page.tsx, components/notes/NoteDetail.tsx

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileX, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-muted p-4">
                <FileX className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">노트를 찾을 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              요청하신 노트가 존재하지 않거나 삭제되었을 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/notes">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  노트 목록으로 돌아가기
                </Button>
              </Link>
              <Link href="/">
                <Button className="gap-2">
                  <Home className="h-4 w-4" />
                  홈으로 이동
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


