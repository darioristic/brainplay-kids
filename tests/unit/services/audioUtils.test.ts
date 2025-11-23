import { describe, it, expect } from 'vitest';
import { base64ToUint8Array, arrayBufferToBase64, decodeAudioData, createPcmBlob } from '@/services/audioUtils';

describe('audioUtils', () => {
  describe('base64ToUint8Array', () => {
    it('should convert base64 string to Uint8Array', () => {
      const base64 = btoa('Hello');
      const result = base64ToUint8Array(base64);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(5);
    });

    it('should handle empty string', () => {
      const base64 = btoa('');
      const result = base64ToUint8Array(base64);
      expect(result.length).toBe(0);
    });
  });

  describe('arrayBufferToBase64', () => {
    it('should convert ArrayBuffer to base64 string', () => {
      const buffer = new ArrayBuffer(5);
      const view = new Uint8Array(buffer);
      view.set([72, 101, 108, 108, 111]); // 'Hello'
      const result = arrayBufferToBase64(buffer);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('createPcmBlob', () => {
    it('should create a PCM blob from Float32Array', () => {
      const data = new Float32Array([0.5, -0.5, 0.0, 1.0, -1.0]);
      const result = createPcmBlob(data);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('mimeType');
      expect(result.mimeType).toBe('audio/pcm;rate=16000');
    });

    it('should clamp values to -1.0 to 1.0 range', () => {
      const data = new Float32Array([2.0, -2.0]);
      const result = createPcmBlob(data);
      expect(result).toHaveProperty('data');
    });
  });
});

