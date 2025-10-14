// app/test-gemini/page.tsx
// Gemini API 테스트 페이지
// API 연결 상태 확인 및 간단한 테스트 기능 제공

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Send } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  testResult?: {
    response: string;
    usage: {
      promptTokens: number;
      responseTokens: number;
      totalTokens: number;
    };
    model: string;
    timestamp: string;
  };
  error?: string;
}

export default function TestGeminiPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testPrompt, setTestPrompt] = useState('안녕하세요! 간단한 테스트입니다.');
  const [result, setResult] = useState<TestResult | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-gemini');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'API 호출 실패',
        error: error instanceof Error ? error.message : '알 수 없는 에러'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCustomPrompt = async () => {
    if (!testPrompt.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: testPrompt }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'API 호출 실패',
        error: error instanceof Error ? error.message : '알 수 없는 에러'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gemini API 테스트</h1>
        <p className="text-muted-foreground">
          Google Gemini API 연결 상태를 확인하고 간단한 테스트를 수행할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-6">
        {/* 기본 연결 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              기본 연결 테스트
            </CardTitle>
            <CardDescription>
              API 키 설정 및 기본 연결 상태를 확인합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  테스트 중...
                </>
              ) : (
                '연결 테스트 시작'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 커스텀 프롬프트 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              커스텀 프롬프트 테스트
            </CardTitle>
            <CardDescription>
              원하는 텍스트로 Gemini API를 테스트해보세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="테스트할 프롬프트를 입력하세요..."
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={testCustomPrompt} 
              disabled={isLoading || !testPrompt.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                '프롬프트 테스트'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 결과 표시 */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                테스트 결과
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "성공" : "실패"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {result.message}
                </span>
              </div>

              {result.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800 font-medium">에러:</p>
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              )}

              {result.testResult && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">응답:</h4>
                    <div className="p-3 bg-gray-50 border rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{result.testResult.response}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {result.testResult.usage.promptTokens}
                      </p>
                      <p className="text-xs text-muted-foreground">프롬프트 토큰</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {result.testResult.usage.responseTokens}
                      </p>
                      <p className="text-xs text-muted-foreground">응답 토큰</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {result.testResult.usage.totalTokens}
                      </p>
                      <p className="text-xs text-muted-foreground">총 토큰</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        {result.testResult.model}
                      </p>
                      <p className="text-xs text-muted-foreground">모델</p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    테스트 시간: {new Date(result.testResult.timestamp).toLocaleString('ko-KR')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
