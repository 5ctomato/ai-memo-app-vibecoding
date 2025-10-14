// app/api/test-gemini/route.ts
// Gemini API 연결 테스트 엔드포인트
// API 키 설정 및 연결 상태 확인

import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Gemini API 연결 테스트 시작...');
    
    const client = getGeminiClient();
    
    // 헬스체크
    const isHealthy = await client.healthCheck();
    if (!isHealthy) {
      return NextResponse.json(
        { success: false, error: 'API 연결 실패' },
        { status: 500 }
      );
    }

    console.log('✅ Gemini API 연결 성공!');
    
    // 간단한 테스트 요청
    console.log('📝 테스트 요청 전송...');
    const result = await client.generateText('hello');
    
    console.log('📄 응답:', result.data);
    console.log('📊 토큰 사용량:', result.usage);

    return NextResponse.json({
      success: true,
      message: 'Gemini API 연결 성공!',
      testResult: {
        response: result.data,
        usage: result.usage,
        model: result.model,
        timestamp: result.timestamp
      }
    });

  } catch (error) {
    console.error('❌ Gemini API 테스트 에러:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 에러',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: '유효한 프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('🔍 커스텀 프롬프트 테스트 시작...', { prompt });
    
    const client = getGeminiClient();
    
    // 헬스체크
    const isHealthy = await client.healthCheck();
    if (!isHealthy) {
      return NextResponse.json(
        { success: false, error: 'API 연결 실패' },
        { status: 500 }
      );
    }

    console.log('✅ Gemini API 연결 성공!');
    
    // 커스텀 프롬프트로 테스트 요청
    console.log('📝 커스텀 테스트 요청 전송...');
    const result = await client.generateText(prompt);
    
    console.log('📄 응답:', result.data);
    console.log('📊 토큰 사용량:', result.usage);

    return NextResponse.json({
      success: true,
      message: '커스텀 프롬프트 테스트 성공!',
      testResult: {
        response: result.data,
        usage: result.usage,
        model: result.model,
        timestamp: result.timestamp
      }
    });

  } catch (error) {
    console.error('❌ 커스텀 프롬프트 테스트 에러:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 에러',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
