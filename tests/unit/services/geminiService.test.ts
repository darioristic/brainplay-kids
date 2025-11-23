import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAnswerQuickly, getOwlChatResponse, generateRewardImage } from '@/services/geminiService';

// Mock the GoogleGenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
    chats: {
      create: vi.fn(),
    },
  })),
}));

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAnswerQuickly', () => {
    it('should return true for correct answers', async () => {
      const mockResponse = {
        text: JSON.stringify({ correct: true, feedback: 'Great job!' }),
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new (GoogleGenAI as any)({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await checkAnswerQuickly('What is 2+2?', '4');
      expect(result).toBe(true);
    });

    it('should return false for incorrect answers', async () => {
      const mockResponse = {
        text: JSON.stringify({ correct: false, feedback: 'Try again!' }),
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new (GoogleGenAI as any)({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await checkAnswerQuickly('What is 2+2?', '5');
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new (GoogleGenAI as any)({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockRejectedValue(new Error('API Error'));

      const result = await checkAnswerQuickly('What is 2+2?', '4');
      expect(result).toBe(false);
    });
  });

  describe('getOwlChatResponse', () => {
    it('should return a chat response', async () => {
      const mockChat = {
        sendMessage: vi.fn().mockResolvedValue({
          text: 'Hello! How can I help you?',
        }),
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new (GoogleGenAI as any)({ apiKey: 'test' });
      mockAI.chats.create = vi.fn().mockReturnValue(mockChat);

      const history = [{ role: 'user', parts: 'Hello' }];
      const result = await getOwlChatResponse(history, 'What is 2+2?');

      expect(result).toBe('Hello! How can I help you?');
    });

    it('should return default message if no response', async () => {
      const mockChat = {
        sendMessage: vi.fn().mockResolvedValue({
          text: '',
        }),
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new (GoogleGenAI as any)({ apiKey: 'test' });
      mockAI.chats.create = vi.fn().mockReturnValue(mockChat);

      const history = [];
      const result = await getOwlChatResponse(history, 'Hello');

      expect(result).toBe("Hoot hoot! I'm thinking...");
    });
  });

  describe('generateRewardImage', () => {
    it('should return base64 image data', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              inlineData: {
                data: 'base64imagedata',
              },
            }],
          },
        }],
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new (GoogleGenAI as any)({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await generateRewardImage('A cat', '1K');
      expect(result).toBe('data:image/png;base64,base64imagedata');
    });

    it('should return null if no image data', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [],
          },
        }],
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new (GoogleGenAI as any)({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await generateRewardImage('A cat', '1K');
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new (GoogleGenAI as any)({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockRejectedValue(new Error('API Error'));

      const result = await generateRewardImage('A cat', '1K');
      expect(result).toBeNull();
    });
  });
});

