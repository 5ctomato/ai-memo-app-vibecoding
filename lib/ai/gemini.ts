// lib/ai/gemini.ts
// Google Gemini API 클라이언트 구현
// AI 기반 요약 및 태깅 기능을 위한 Gemini API 연동
// 관련 파일: lib/env.ts, lib/actions/notes.ts, __tests__/ai/gemini.test.ts

import { GoogleGenAI } from '@google/genai';
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
  private readonly maxTokens = 8000; // 8k 토큰 제한
  private readonly maxRetries = 3;
  private readonly timeout = 10000; // 10초 타임아웃
  private readonly modelName = 'gemini-2.0-flash-001';

  constructor() {
    // 환경변수 검증
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // GoogleGenAI 클라이언트 초기화
    this.client = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
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
        console.warn(`[GeminiClient] ${operationName} - Attempt ${attempt} failed:`, error);
        
        if (attempt < this.maxRetries) {
          // 지수 백오프: 1초, 2초, 4초
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`[GeminiClient] ${operationName} - Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`${operationName} failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }

  // 기본 텍스트 생성
  async generateText(prompt: string): Promise<GeminiResponse<string>> {
    this.validateTokenLimit(prompt);

    return this.callWithRetry(async () => {
      const startTime = Date.now();
      
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 토큰 사용량 추정 (실제 API에서는 정확한 값을 제공하지 않을 수 있음)
      const promptTokens = this.countTokens(prompt);
      const responseTokens = this.countTokens(response.text || '');
      const totalTokens = promptTokens + responseTokens;

      console.log(`[GeminiClient] generateText - Tokens: ${totalTokens}, Time: ${responseTime}ms`);

      return {
        data: response.text || '',
        usage: {
          promptTokens,
          responseTokens,
          totalTokens,
        },
        model: this.modelName,
        timestamp: new Date(),
      };
    }, 'generateText');
  }

  // 노트 요약 생성
  async generateSummary(noteContent: string): Promise<GeminiResponse<string>> {
    this.validateTokenLimit(noteContent);

    const prompt = `다음 노트 내용을 3-6개의 불릿 포인트로 요약해주세요. 핵심 내용만 간결하게 정리해주세요:

${noteContent}`;

    return this.callWithRetry(async () => {
      const startTime = Date.now();
      
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          maxOutputTokens: 500,
          temperature: 0.5,
        },
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const promptTokens = this.countTokens(prompt);
      const responseTokens = this.countTokens(response.text || '');
      const totalTokens = promptTokens + responseTokens;

      console.log(`[GeminiClient] generateSummary - Tokens: ${totalTokens}, Time: ${responseTime}ms`);

      return {
        data: response.text || '',
        usage: {
          promptTokens,
          responseTokens,
          totalTokens,
        },
        model: this.modelName,
        timestamp: new Date(),
      };
    }, 'generateSummary');
  }

  // 노트 태그 생성
  async generateTags(noteContent: string): Promise<GeminiResponse<string[]>> {
    this.validateTokenLimit(noteContent);

    const prompt = `다음 노트 내용을 분석하여 관련성 높은 태그를 최대 6개까지 생성해주세요. 태그는 쉼표로 구분하여 나열해주세요:

${noteContent}`;

    return this.callWithRetry(async () => {
      const startTime = Date.now();
      
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          maxOutputTokens: 200,
          temperature: 0.3,
        },
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 태그 파싱
      const tagsText = response.text || '';
      const tags = tagsText
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 6); // 최대 6개로 제한

      const promptTokens = this.countTokens(prompt);
      const responseTokens = this.countTokens(tagsText);
      const totalTokens = promptTokens + responseTokens;

      console.log(`[GeminiClient] generateTags - Tokens: ${totalTokens}, Time: ${responseTime}ms, Tags: ${tags.length}`);

      return {
        data: tags,
        usage: {
          promptTokens,
          responseTokens,
          totalTokens,
        },
        model: this.modelName,
        timestamp: new Date(),
      };
    }, 'generateTags');
  }

  // API 헬스체크
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: 'Hello',
        config: {
          maxOutputTokens: 10,
          temperature: 0.1,
        },
      });
      
      return !!response.text;
    } catch (error) {
      console.error('[GeminiClient] Health check failed:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스 관리
let geminiClientInstance: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClientInstance) {
    geminiClientInstance = new GeminiClient();
  }
  return geminiClientInstance;
}