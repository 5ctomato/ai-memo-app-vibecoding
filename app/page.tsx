// app/page.tsx
// AI 메모장 메인 페이지
// 사용자에게 서비스 소개와 주요 기능을 보여주는 랜딩 페이지를 제공합니다
// 이 파일은 AI 메모장 서비스의 첫인상을 결정하는 메인 페이지를 구현하기 위해 존재합니다
// 관련 파일: app/layout.tsx, components/auth/SignupForm.tsx, app/auth/signup/page.tsx

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthProvider } from '@/components/providers/AuthProvider'
import Header from '@/components/layout/Header'

export default function Home() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI가 도와주는
            <span className="text-indigo-600"> 스마트 메모장</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            음성으로 메모를 녹음하고, AI가 자동으로 요약하고 태그를 달아주는
            <br />
            혁신적인 메모 관리 서비스입니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* 무료로 시작하기 버튼 - 숨김처리됨 */}
            {/* 
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                무료로 시작하기
              </Button>
            </Link>
            */}
            <Link href="/notes">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                내 노트 보기
              </Button>
            </Link>
            <Link href="/notes/create">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                노트 작성하기
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <CardTitle>음성 메모</CardTitle>
              <CardDescription>
                음성으로 메모를 녹음하고 자동으로 텍스트로 변환
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                언제 어디서나 음성으로 메모를 남기고, AI가 정확하게 텍스트로 변환해드립니다.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <CardTitle>AI 요약</CardTitle>
              <CardDescription>
                AI가 메모 내용을 분석하여 핵심 내용을 요약
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                긴 메모도 AI가 핵심 내용을 파악하여 간결하고 명확하게 요약해드립니다.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏷️</span>
              </div>
              <CardTitle>자동 태깅</CardTitle>
              <CardDescription>
                메모 내용을 분석하여 관련 태그를 자동으로 생성
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                메모의 주제와 내용을 분석하여 적절한 태그를 자동으로 달아 정리해드립니다.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section - 주석처리됨 */}
        {/* 
        <div className="mt-24 text-center">
          <Card className="max-w-2xl mx-auto bg-indigo-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-2xl">지금 시작해보세요</CardTitle>
              <CardDescription className="text-lg">
                무료로 가입하고 AI 메모장의 모든 기능을 체험해보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  무료 회원가입
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        */}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <span className="text-xl font-bold">메모장</span>
              </div>
              <p className="text-gray-400">
                AI가 도와주는 스마트 메모 관리 서비스
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">서비스</h3>
              <ul className="space-y-2 text-gray-400">
                <li>음성 메모</li>
                <li>AI 요약</li>
                <li>자동 태깅</li>
                <li>검색 & 필터</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">지원</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/forgot-password" className="hover:text-white transition-colors">비밀번호 재설정</Link></li>
                <li>도움말</li>
                <li>문의하기</li>
                <li>개인정보처리방침</li>
                <li>이용약관</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">연결</h3>
              <ul className="space-y-2 text-gray-400">
                <li>GitHub</li>
                <li>Twitter</li>
                <li>Discord</li>
                <li>블로그</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI 메모장. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </AuthProvider>
  )
}