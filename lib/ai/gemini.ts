// lib/ai/gemini.ts
// Google Gemini API 클라이언트 구현
// AI 기반 요약 및 태깅 기능을 위한 Gemini API 연동
// 관련 파일: lib/env.ts, lib/actions/notes.ts, __tests__/ai/gemini.test.ts

import { GoogleGenAI, GenerativeModel } from '@google/genai';
import { env } from '../env';

// API 에러 타입 정의
export interface GeminiError {
  code: string;
  message: string;
  details?: any;
}

// 토큰 사용량 추적 인터페이스
export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
}

// API 호출 결과 인터페이스
export interface GeminiResponse<T = string> {
  data: T;
  usage: TokenUsage;
  model: string;
  timestamp: Date;
}

// Gemini API 클라이언트 클래스
export class GeminiClient {
  private client: GoogleGenAI;
  private model: GenerativeModel;
  private readonly maxTokens = 8000; // 8k 토큰 제한
  private readonly maxRetries = 3;
  private readonly timeout = 10000; // 10초 타임아웃

  constructor() {
    // 환경변수 검증
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // GoogleGenAI 클라이언트 초기화
    this.client = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    // 모델 초기화 (gemini-1.5-flash 사용)
    this.model = this.client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 1000, // 응답 최대 토큰 수
        temperature: 0.7,
      },
    });
  }

  // 토큰 카운팅 함수 (대략적 추정)
  private countTokens(text: string): number {
    // 간단한 토큰 추정: 공백으로 분리된 단어 수 * 1.3 (한국어 고려)
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words * 1.3);
  }

  // 토큰 제한 검증
  private validateTokenLimit(text: string): void {
    const tokenCount = this.countTokens(text);
    if (tokenCount > this.maxTokens) {
      throw new Error(
        `Text exceeds token limit. Current: ${tokenCount}, Max: ${this.maxTokens}`
      );
    }
  }

  // 재시도 로직이 포함된 API 호출
  private async callWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[GeminiClient] ${operationName} - Attempt ${attempt}/${this.maxRetries}`);
        
        // 타임아웃 설정
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), this.timeout);
        });

        const result = await Promise.race([operation(), timeoutPromise]);
        
        console.log(`[GeminiClient] ${operationName} - Success on attempt ${attempt}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`[GeminiClient] ${operationName} - Attempt ${attempt} failed:`, error);

        // 마지막 시도가 아니면 잠시 대기
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 지수 백오프
          console.log(`[GeminiClient] ${operationName} - Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `${operationName} failed after ${this.maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }

  // 기본 텍스트 생성 메서드
  async generateText(prompt: string): Promise<GeminiResponse<string>> {
    this.validateTokenLimit(prompt);

    const startTime = Date.now();
    
    const result = await this.callWithRetry(async () => {
      const response = await this.model.generateContent(prompt);
      return response.response.text();
    }, 'generateText');

    const endTime = Date.now();
    const duration = endTime - startTime;

    // 토큰 사용량 추적 (대략적)
    const promptTokens = this.countTokens(prompt);
    const responseTokens = this.countTokens(result);
    const totalTokens = promptTokens + responseTokens;

    console.log(`[GeminiClient] generateText completed in ${duration}ms`);
    console.log(`[GeminiClient] Token usage - Prompt: ${promptTokens}, Response: ${responseTokens}, Total: ${totalTokens}`);

    return {
      data: result,
      usage: {
        promptTokens,
        responseTokens,
        totalTokens,
      },
      model: 'gemini-1.5-flash',
      timestamp: new Date(),
    };
  }

  // 노트 요약 생성 메서드
  async generateSummary(noteContent: string): Promise<GeminiResponse<string>> {
    const prompt = `다음 노트 내용을 3-6개의 불릿 포인트로 요약해주세요. 각 포인트는 간결하고 명확해야 합니다:

${noteContent}

요약:`;

    return this.generateText(prompt);
  }

  // 노트 태그 생성 메서드
  async generateTags(noteContent: string): Promise<GeminiResponse<string[]>> {
    const prompt = `다음 노트 내용을 분석하여 관련성 높은 태그를 최대 6개까지 생성해주세요. 태그는 쉼표로 구분하고, 한국어로 작성해주세요:

${noteContent}

태그:`;

    const response = await this.generateText(prompt);
    
    // 응답을 태그 배열로 변환
    const tags = response.data
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 6); // 최대 6개로 제한

    return {
      ...response,
      data: tags,
    };
  }

  // 헬스체크 메서드
  async healthCheck(): Promise<boolean> {
    try {
      await this.generateText('Hello');
      return true;
    } catch (error) {
      console.error('[GeminiClient] Health check failed:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스 생성
let geminiClient: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    geminiClient = new GeminiClient();
  }
  return geminiClient;
}

// 기본 내보내기
export default GeminiClient;
