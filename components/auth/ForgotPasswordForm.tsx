// components/auth/ForgotPasswordForm.tsx
// 비밀번호 재설정 요청 폼 컴포넌트
// 사용자가 이메일을 입력하여 비밀번호 재설정 링크를 요청할 수 있는 폼을 제공합니다
// 이 파일은 비밀번호 재설정의 첫 번째 단계를 구현하기 위해 존재합니다
// 관련 파일: app/auth/forgot-password/page.tsx, lib/utils/validation.ts, lib/supabase/client.ts

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getEmailError } from '@/lib/utils/validation'

interface FormData {
  email: string
}

interface FormErrors {
  email?: string
  general?: string
}

export default function ForgotPasswordForm() {
  const [formData, setFormData] = useState<FormData>({
    email: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // 실시간 유효성 검사
  const validateField = (name: keyof FormData, value: string) => {
    let error: string | null = null

    switch (name) {
      case 'email':
        error = getEmailError(value)
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

    // 이메일 유효성 검사
    const emailValid = validateField('email', formData.email)

    if (!emailValid) {
      setIsLoading(false)
      return
    }

    try {
      // Supabase Auth를 통한 비밀번호 재설정 이메일 전송
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        // 에러 메시지 한국어 변환
        let errorMessage = '비밀번호 재설정 요청 중 오류가 발생했습니다.'
        
        switch (error.message) {
          case 'Invalid email':
            errorMessage = '올바른 이메일 형식을 입력해주세요.'
            break
          case 'User not found':
            errorMessage = '등록되지 않은 이메일 주소입니다.'
            break
          case 'Too many requests':
            errorMessage = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
            break
          case 'Network error':
          case 'Failed to fetch':
            errorMessage = '네트워크 연결을 확인해주세요.'
            break
          default:
            if (error.message.includes('security purposes') && error.message.includes('request this after')) {
              // 보안 제한 메시지 처리 (예: "For security purposes, you can only request this after 31 seconds.")
              const timeMatch = error.message.match(/(\d+)\s*(second|minute|hour)/i)
              if (timeMatch) {
                const time = timeMatch[1]
                const unit = timeMatch[2].toLowerCase()
                const unitKorean = unit === 'second' ? '초' : unit === 'minute' ? '분' : '시간'
                errorMessage = `보안을 위해 ${time}${unitKorean} 후에 다시 요청해주세요.`
              } else {
                errorMessage = '보안을 위해 잠시 후에 다시 요청해주세요.'
              }
            } else if (error.message.includes('email')) {
              errorMessage = '이메일 관련 오류가 발생했습니다. 이메일 형식을 확인해주세요.'
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
              errorMessage = '네트워크 연결을 확인해주세요.'
            } else {
              errorMessage = `비밀번호 재설정 요청 중 오류가 발생했습니다: ${error.message}`
            }
        }

        setErrors({ general: errorMessage })
        return
      }

      // 성공 시 성공 메시지 표시
      setIsSuccess(true)
    } catch (error) {
      console.error('Forgot password error:', error)
      setErrors({ general: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>이메일을 확인해주세요</CardTitle>
          <CardDescription>
            비밀번호 재설정 링크를 {formData.email}로 전송했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              이메일을 확인하고 링크를 클릭하여 새 비밀번호를 설정하세요.
            </p>
            <Button 
              onClick={() => {
                setIsSuccess(false)
                setFormData({ email: '' })
                setErrors({})
              }}
              className="w-full"
            >
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>비밀번호 재설정</CardTitle>
        <CardDescription>
          등록된 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다
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

          {/* 일반 에러 메시지 */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* 재설정 요청 버튼 */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? '전송 중...' : '재설정 링크 전송'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
