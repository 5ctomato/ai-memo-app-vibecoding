// __tests__/ai/gemini.test.ts
// Gemini API 클라이언트 단위 테스트
// API 클라이언트의 각 메서드별 테스트 및 에러 핸들링 검증
// 관련 파일: lib/ai/gemini.ts

import { GeminiClient, getGeminiClient } from '../../lib/ai/gemini';

// Gemini API 모킹
jest.mock('@google/genai', () => {
  const mockGenerateContent = jest.fn();
  const mockModel = {
    generateContent: mockGenerateContent,
  };
  const mockClient = {
    getGenerativeModel: jest.fn(() => mockModel),
  };
  const mockGoogleGenAI = jest.fn(() => mockClient);

  return {
    GoogleGenAI: mockGoogleGenAI,
  };
});

// 모킹된 함수들을 가져오기
const { GoogleGenAI } = require('@google/genai');
const mockClient = new GoogleGenAI();
const mockModel = mockClient.getGenerativeModel();
const mockGenerateContent = mockModel.generateContent;

// 환경변수 모킹
jest.mock('../../lib/env', () => ({
  env: {
    GEMINI_API_KEY: 'test-api-key',
  },
}));

describe('GeminiClient', () => {
  let client: GeminiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateContent.mockClear();
    mockClient.getGenerativeModel.mockClear();
    client = new GeminiClient();
  });

  describe('초기화', () => {
    it('환경변수가 없으면 에러를 던져야 함', () => {
      // 환경변수 모킹 해제하고 다시 모킹
      jest.resetModules();
      jest.doMock('../../lib/env', () => ({
        env: {
          GEMINI_API_KEY: undefined,
        },
      }));

      const { GeminiClient } = require('../../lib/ai/gemini');
      expect(() => new GeminiClient()).toThrow('GEMINI_API_KEY is not set in environment variables');
    });

    it('환경변수가 있으면 정상적으로 초기화되어야 함', () => {
      expect(client).toBeInstanceOf(GeminiClient);
    });
  });

  describe('토큰 카운팅', () => {
    it('텍스트의 토큰 수를 대략적으로 계산해야 함', () => {
      const text = 'Hello world test';
      const tokenCount = (client as any).countTokens(text);
      
      expect(tokenCount).toBeGreaterThan(0);
      expect(typeof tokenCount).toBe('number');
    });

    it('한국어 텍스트도 토큰 수를 계산해야 함', () => {
      const text = '안녕하세요 테스트입니다';
      const tokenCount = (client as any).countTokens(text);
      
      expect(tokenCount).toBeGreaterThan(0);
      expect(typeof tokenCount).toBe('number');
    });
  });

  describe('토큰 제한 검증', () => {
    it('토큰 제한을 초과하면 에러를 던져야 함', () => {
      // 매우 긴 텍스트 생성 (8k 토큰 초과)
      const longText = 'test '.repeat(10000);
      
      expect(() => {
        (client as any).validateTokenLimit(longText);
      }).toThrow('Text exceeds token limit');
    });

    it('토큰 제한 내의 텍스트는 통과해야 함', () => {
      const shortText = 'Hello world';
      
      expect(() => {
        (client as any).validateTokenLimit(shortText);
      }).not.toThrow();
    });
  });

  describe('generateText', () => {
    it('정상적인 텍스트 생성이 작동해야 함', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue('Generated text response'),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await client.generateText('Test prompt');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('usage');
      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('timestamp');
      expect(result.data).toBe('Generated text response');
      expect(result.model).toBe('gemini-1.5-flash');
    });

    it('API 호출 실패 시 에러를 처리해야 함', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(client.generateText('Test prompt')).rejects.toThrow('generateText failed after 3 attempts');
    }, 10000);
  });

  describe('generateSummary', () => {
    it('노트 내용을 요약해야 함', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue('• 요약 포인트 1\n• 요약 포인트 2\n• 요약 포인트 3'),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const noteContent = '이것은 테스트 노트 내용입니다. 여러 문장으로 구성되어 있습니다.';
      const result = await client.generateSummary(noteContent);

      expect(result.data).toContain('요약');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('다음 노트 내용을 3-6개의 불릿 포인트로 요약해주세요')
      );
    });
  });

  describe('generateTags', () => {
    it('노트 내용에서 태그를 생성해야 함', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue('개발, 테스트, AI, 프로그래밍, 기술'),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const noteContent = 'AI 개발에 관한 노트입니다.';
      const result = await client.generateTags(noteContent);

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.length).toBeLessThanOrEqual(6);
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('다음 노트 내용을 분석하여 관련성 높은 태그를 최대 6개까지 생성해주세요')
      );
    });

    it('빈 응답에 대해서도 처리해야 함', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(''),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await client.generateTags('Test content');

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(0);
    });
  });

  describe('healthCheck', () => {
    it('정상적인 경우 true를 반환해야 함', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue('Hello'),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await client.healthCheck();

      expect(result).toBe(true);
    });

    it('API 에러 시 false를 반환해야 함', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const result = await client.healthCheck();

      expect(result).toBe(false);
    }, 10000);
  });

  describe('getGeminiClient', () => {
    it('싱글톤 인스턴스를 반환해야 함', () => {
      const client1 = getGeminiClient();
      const client2 = getGeminiClient();

      expect(client1).toBe(client2);
    });
  });

  describe('재시도 로직', () => {
    it('API 호출 실패 시 재시도해야 함', async () => {
      // 모킹 초기화
      mockGenerateContent.mockClear();
      
      // 첫 번째와 두 번째 호출은 실패, 세 번째 호출은 성공
      mockGenerateContent
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce({
          response: { text: jest.fn().mockReturnValue('Success') }
        });

      const result = await client.generateText('Test prompt');

      expect(mockGenerateContent).toHaveBeenCalledTimes(3);
      expect(result.data).toBe('Success');
    }, 10000);

    it('최대 재시도 횟수 초과 시 에러를 던져야 함', async () => {
      // 모킹 초기화
      mockGenerateContent.mockClear();
      
      // 모든 호출이 실패
      mockGenerateContent.mockRejectedValue(new Error('Persistent Error'));

      await expect(client.generateText('Test prompt')).rejects.toThrow(
        'generateText failed after 3 attempts'
      );
    }, 10000);
  });
});
