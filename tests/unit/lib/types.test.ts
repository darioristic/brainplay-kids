import { describe, it, expect } from 'vitest';
import { getAgeGroup, getThemeColors, AgeGroup } from '@/types';

describe('types helpers', () => {
  describe('getAgeGroup', () => {
    it('should return EARLY for age 0-4', () => {
      expect(getAgeGroup(0)).toBe(AgeGroup.EARLY);
      expect(getAgeGroup(2)).toBe(AgeGroup.EARLY);
      expect(getAgeGroup(4)).toBe(AgeGroup.EARLY);
    });

    it('should return DISCOVERY for age 5-8', () => {
      expect(getAgeGroup(5)).toBe(AgeGroup.DISCOVERY);
      expect(getAgeGroup(6)).toBe(AgeGroup.DISCOVERY);
      expect(getAgeGroup(8)).toBe(AgeGroup.DISCOVERY);
    });

    it('should return JUNIOR for age 9+', () => {
      expect(getAgeGroup(9)).toBe(AgeGroup.JUNIOR);
      expect(getAgeGroup(10)).toBe(AgeGroup.JUNIOR);
      expect(getAgeGroup(13)).toBe(AgeGroup.JUNIOR);
    });
  });

  describe('getThemeColors', () => {
    it('should return EARLY theme colors', () => {
      const theme = getThemeColors(AgeGroup.EARLY);
      expect(theme.bg).toBe('bg-early-bg');
      expect(theme.primary).toBe('bg-early-primary');
      expect(theme.text).toBe('text-early-text');
    });

    it('should return DISCOVERY theme colors', () => {
      const theme = getThemeColors(AgeGroup.DISCOVERY);
      expect(theme.bg).toBe('bg-disco-bg');
      expect(theme.primary).toBe('bg-disco-primary');
      expect(theme.text).toBe('text-disco-text');
    });

    it('should return JUNIOR theme colors', () => {
      const theme = getThemeColors(AgeGroup.JUNIOR);
      expect(theme.bg).toBe('bg-junior-bg');
      expect(theme.primary).toBe('bg-junior-primary');
      expect(theme.text).toBe('text-junior-text');
    });
  });
});

