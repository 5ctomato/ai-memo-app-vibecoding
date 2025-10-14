// components/auth/SignupForm.tsx
// 회원가입 폼 컴포넌트
// 이메일과 비밀번호로 회원가입할 수 있는 폼을 제공합니다
// 이 파일은 사용자 회원가입 UI를 구현하기 위해 존재합니다
// 관련 파일: app/auth/signup/page.tsx, lib/utils/validation.ts, lib/supabase/client.ts

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  getEmailError, 
  getPasswordError, 
  getPasswordConfirmError 
} from '@/lib/utils/validation'

interface FormData {
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  // 실시간 유효성 검사
  const validateField = (name: keyof FormData, value: string) => {
    let error: string | null = null

    switch (name) {
      case 'email':
        error = getEmailError(value)
        break
      case 'password':
        error = getPasswordError(value)
        break
      case 'confirmPassword':
        error = getPasswordConfirmError(formData.password, value)
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
    const confirmPasswordValid = validateField('confirmPassword', formData.confirmPassword)

    if (!emailValid || !passwordValid || !confirmPasswordValid) {
      setIsLoading(false)
      return
    }

    try {
      // Supabase Auth를 통한 회원가입
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        // 에러 메시지 한국어 변환
        let errorMessage = '회원가입 중 오류가 발생했습니다.'
        
        switch (error.message) {
          case 'User already registered':
            errorMessage = '이미 등록된 이메일 주소입니다.'
            break
          case 'Password should be at least 6 characters':
            errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.'
            break
          case 'Invalid email':
            errorMessage = '올바른 이메일 형식을 입력해주세요.'
            break
          default:
            errorMessage = error.message
        }

        setErrors({ general: errorMessage })
        return
      }

      if (data.user) {
        // 회원가입 성공 시 자동 로그인 처리
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (signInError) {
          setErrors({ general: '로그인 중 오류가 발생했습니다.' })
          return
        }

        // 메인 대시보드로 리다이렉트
        router.push('/')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ general: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>
          이메일과 비밀번호로 계정을 생성하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              placeholder="최소 8자, 영문+숫자+특수문자"
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 필드 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="비밀번호를 다시 입력하세요"
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* 일반 에러 메시지 */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* 회원가입 버튼 */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '회원가입'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
