// app/auth/signup/page.tsx
// 회원가입 페이지
// 사용자가 이메일과 비밀번호로 회원가입할 수 있는 페이지를 제공합니다
// 이 파일은 회원가입 기능의 메인 페이지를 구현하기 위해 존재합니다
// 관련 파일: components/auth/SignupForm.tsx, app/layout.tsx

import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  )
}
