// components/auth/LoginForm.tsx
// 로그인 폼 컴포넌트
// 이메일과 비밀번호로 로그인할 수 있는 폼을 제공합니다
// 이 파일은 사용자 로그인 UI를 구현하기 위해 존재합니다
// 관련 파일: app/auth/login/page.tsx, lib/supabase/client.ts

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getEmailError } from '@/lib/utils/validation'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // URL 파라미터에서 성공 메시지 확인
  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'password-reset-success') {
      setSuccessMessage('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.')
    }
  }, [searchParams])

  // 실시간 유효성 검사
  const validateField = (name: keyof FormData, value: string) => {
    let error: string | null = null

    switch (name) {
      case 'email':
        error = getEmailError(value)
        break
      case 'password':
        if (!value) error = '비밀번호를 입력해주세요'
        break
    }

    setErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }))

    return !error
  }

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // 실시간 유효성 검사
    validateField(name as keyof FormData, value)
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // 전체 폼 유효성 검사
    const emailValid = validateField('email', formData.email)
    const passwordValid = validateField('password', formData.password)

    if (!emailValid || !passwordValid) {
      setIsLoading(false)
      return
    }

    try {
      // Supabase Auth를 통한 로그인
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        // 에러 메시지 한국어 변환
        let errorMessage = '로그인 중 오류가 발생했습니다.'
        
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.'
            break
          case 'Email not confirmed':
            errorMessage = '이메일 인증이 필요합니다. 이메일을 확인해주세요.'
            break
          case 'Too many requests':
            errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.'
            break
          default:
            errorMessage = error.message
        }

        setErrors({ general: errorMessage })
        return
      }

      if (data.user) {
        // 로그인 성공 시 메인 대시보드로 리다이렉트
        router.push('/')
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>
          계정에 로그인하여 AI 메모장을 이용하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 성공 메시지 표시 */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 입력 필드 */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="비밀번호를 입력하세요"
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* 일반 에러 메시지 */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* 로그인 버튼 */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          {/* 비밀번호 재설정 링크 */}
          <div className="text-center">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          {/* 회원가입 링크 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link 
                href="/auth/signup" 
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                회원가입
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
