// components/auth/ResetPasswordForm.tsx
// 비밀번호 재설정 폼 컴포넌트
// 사용자가 새 비밀번호를 입력하여 비밀번호를 재설정할 수 있는 폼을 제공합니다
// 이 파일은 비밀번호 재설정의 두 번째 단계를 구현하기 위해 존재합니다
// 관련 파일: app/auth/reset-password/page.tsx, lib/utils/validation.ts, lib/supabase/client.ts

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPasswordError, getPasswordConfirmError } from '@/lib/utils/validation'

interface FormData {
  password: string
  confirmPassword: string
}

interface FormErrors {
  password?: string
  confirmPassword?: string
  general?: string
}

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // URL에서 토큰 확인
  useEffect(() => {
    const checkToken = async () => {
      try {
        // 쿼리 파라미터에서 토큰 확인 (Supabase redirect 형식)
        const queryToken = searchParams.get('token')
        const type = searchParams.get('type')
        
            console.log('Token check:', { queryToken, type })
        
        // 비밀번호 재설정 타입인지 확인
        if (type === 'recovery' && queryToken) {
          console.log('Attempting OTP verification with token:', queryToken)
          
          // Supabase에서 리다이렉트된 경우, 토큰을 사용하여 세션 설정
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: queryToken,
            type: 'recovery'
          })
          
          console.log('OTP verification result:', { data, error })
          
          if (error) {
            console.error('OTP verification error:', error)
            setIsValidToken(false)
            return
          }
          
          if (!data?.user) {
            console.error('No user in OTP verification result')
            setIsValidToken(false)
            return
          }
          
          console.log('Token validation successful')
          setIsValidToken(true)
          return
        }
        
        // URL 해시에서 토큰 추출 (이메일 링크 직접 클릭)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('Hash params:', { accessToken, refreshToken })
        
        // 해시에서 토큰이 있는 경우
        if (accessToken && refreshToken) {
          console.log('Attempting session setting with hash tokens')
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          console.log('Session setting result:', { data, error })
          
          if (error || !data?.user) {
            console.error('Session setting failed:', error)
            setIsValidToken(false)
            return
          }
          
          console.log('Hash token validation successful')
          setIsValidToken(true)
          return
        }
        
        // 토큰이 없는 경우
        console.log('No valid token found')
        
        // 개발 환경에서 임시로 토큰 검증 우회 (실제 배포 시에는 제거)
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: bypassing token validation')
          setIsValidToken(true)
          return
        }
        
        setIsValidToken(false)
        
      } catch (error) {
        console.error('Token validation error:', error)
        setIsValidToken(false)
      }
    }

    checkToken()
  }, [searchParams])

  // 실시간 유효성 검사
  const validateField = (name: keyof FormData, value: string) => {
    let error: string | null = null

    switch (name) {
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
    const passwordValid = validateField('password', formData.password)
    const confirmPasswordValid = validateField('confirmPassword', formData.confirmPassword)

    if (!passwordValid || !confirmPasswordValid) {
      setIsLoading(false)
      return
    }

    try {
      // Supabase Auth를 통한 비밀번호 업데이트
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        // 에러 메시지 한국어 변환
        let errorMessage = '비밀번호 재설정 중 오류가 발생했습니다.'
        
        switch (error.message) {
          case 'Password should be at least 6 characters':
            errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.'
            break
          case 'Password is too weak':
            errorMessage = '비밀번호가 너무 약합니다. 영문, 숫자, 특수문자를 포함해주세요.'
            break
          case 'Invalid session':
            errorMessage = '세션이 만료되었습니다. 다시 비밀번호 재설정을 요청해주세요.'
            break
          case 'Network error':
          case 'Failed to fetch':
            errorMessage = '네트워크 연결을 확인해주세요.'
            break
          default:
            if (error.message.includes('password')) {
              errorMessage = '비밀번호 관련 오류가 발생했습니다. 비밀번호 규칙을 확인해주세요.'
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
              errorMessage = '네트워크 연결을 확인해주세요.'
            } else {
              errorMessage = `비밀번호 재설정 중 오류가 발생했습니다: ${error.message}`
            }
        }

        setErrors({ general: errorMessage })
        return
      }

      // 성공 시 성공 메시지 표시
      setIsSuccess(true)
      
      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/auth/login?message=password-reset-success')
      }, 3000)
    } catch (error) {
      console.error('Reset password error:', error)
      setErrors({ general: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' })
    } finally {
      setIsLoading(false)
    }
  }

  // 성공 상태 표시
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-green-600">비밀번호 재설정 완료</CardTitle>
          <CardDescription>
            비밀번호가 성공적으로 변경되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 text-center">
              잠시 후 로그인 페이지로 이동합니다...
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 토큰이 유효하지 않은 경우
  if (isValidToken === false) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>유효하지 않은 링크</CardTitle>
          <CardDescription>
            비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              새로운 비밀번호 재설정 링크를 요청해주세요.
            </p>
            <Button 
              onClick={() => router.push('/auth/forgot-password')}
              className="w-full"
            >
              새 링크 요청
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 토큰 검증 중
  if (isValidToken === null) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">링크를 확인하는 중...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>새 비밀번호 설정</CardTitle>
        <CardDescription>
          새 비밀번호를 입력하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 새 비밀번호 입력 필드 */}
          <div className="space-y-2">
            <Label htmlFor="password">새 비밀번호</Label>
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

          {/* 비밀번호 재설정 버튼 */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '비밀번호 재설정'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
