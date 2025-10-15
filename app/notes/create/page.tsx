// app/notes/create/page.tsx
// 노트 생성 페이지
// 사용자가 새 노트를 작성할 수 있는 페이지를 제공합니다
// 이 파일은 노트 생성 기능의 메인 페이지를 담당하기 위해 존재합니다
// 관련 파일: components/notes/CreateNoteForm.tsx, lib/actions/notes.ts, app/layout.tsx

import Link from 'next/link'
import { AdvancedCreateNoteForm } from '@/components/notes/AdvancedCreateNoteForm'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default async function CreateNotePage() {
  // 임시로 인증 체크를 비활성화하여 테스트
  // TODO: 실제 배포 시에는 인증을 활성화해야 함
  // const supabase = createServerClient()
  // const { data: { user }, error } = await supabase.auth.getUser()

  // if (error || !user) {
  //   redirect('/auth/login')
  // }

  return (
    <div className="container mx-auto py-8 px-4">
      <AdvancedCreateNoteForm />
    </div>
  )
}
