// app/auth/reset-password/page.tsx
// 비밀번호 재설정 페이지
// 사용자가 이메일로 받은 링크를 통해 새 비밀번호를 설정할 수 있는 페이지를 제공합니다
// 이 파일은 비밀번호 재설정의 두 번째 단계를 구현하기 위해 존재합니다
// 관련 파일: components/auth/ResetPasswordForm.tsx, lib/supabase/client.ts

import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <ResetPasswordForm />
      </div>
    </div>
  )
}
