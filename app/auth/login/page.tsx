// app/auth/login/page.tsx
// 로그인 페이지
// 사용자가 이메일과 비밀번호로 로그인할 수 있는 페이지를 제공합니다
// 이 파일은 기존 사용자의 로그인 기능을 구현하기 위해 존재합니다
// 관련 파일: components/auth/LoginForm.tsx, app/layout.tsx

import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
