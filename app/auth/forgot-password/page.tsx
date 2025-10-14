// app/auth/forgot-password/page.tsx
// 비밀번호 재설정 요청 페이지
// 사용자가 이메일을 입력하여 비밀번호 재설정 링크를 요청할 수 있는 페이지를 제공합니다
// 이 파일은 비밀번호를 잊은 사용자를 위한 첫 번째 단계를 구현하기 위해 존재합니다
// 관련 파일: components/auth/ForgotPasswordForm.tsx, lib/supabase/client.ts

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
