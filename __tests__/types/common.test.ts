/*
 * SakuMari: Japanese Kana Flashcard App
 * Copyright (C) 2025 SakuMari
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import type { KanaWithAccuracy, InteractionMode, SortDirection } from '@/types/common';

describe('Type Definitions', () => {
  describe('KanaWithAccuracy', () => {
    it('should accept valid KanaWithAccuracy object', () => {
      const kana: KanaWithAccuracy = {
        id: 'test-id',
        character: 'あ',
        romaji: 'a',
        accuracy: 85.5,
        attempts: 10,
        correct_attempts: 8
      };

      expect(kana.id).toBe('test-id');
      expect(kana.character).toBe('あ');
      expect(kana.romaji).toBe('a');
      expect(kana.accuracy).toBe(85.5);
      expect(kana.attempts).toBe(10);
      expect(kana.correct_attempts).toBe(8);
    });

    it('should handle zero attempts', () => {
      const kana: KanaWithAccuracy = {
        id: 'zero-attempts',
        character: 'か',
        romaji: 'ka',
        accuracy: 0,
        attempts: 0,
        correct_attempts: 0
      };

      expect(kana.accuracy).toBe(0);
      expect(kana.attempts).toBe(0);
      expect(kana.correct_attempts).toBe(0);
    });

    it('should handle perfect accuracy', () => {
      const kana: KanaWithAccuracy = {
        id: 'perfect',
        character: 'さ',
        romaji: 'sa',
        accuracy: 100,
        attempts: 5,
        correct_attempts: 5
      };

      expect(kana.accuracy).toBe(100);
      expect(kana.attempts).toBe(5);
      expect(kana.correct_attempts).toBe(5);
    });
  });

  describe('InteractionMode', () => {
    it('should accept typing mode', () => {
      const mode: InteractionMode = 'typing';
      expect(mode).toBe('typing');
    });

    it('should accept multiple-choice mode', () => {
      const mode: InteractionMode = 'multiple-choice';
      expect(mode).toBe('multiple-choice');
    });
  });

  describe('SortDirection', () => {
    it('should accept ascending direction', () => {
      const direction: SortDirection = 'asc';
      expect(direction).toBe('asc');
    });

    it('should accept descending direction', () => {
      const direction: SortDirection = 'desc';
      expect(direction).toBe('desc');
    });
  });

  describe('Type usage patterns', () => {
    it('should work with arrays of KanaWithAccuracy', () => {
      const kanaArray: KanaWithAccuracy[] = [
        {
          id: '1',
          character: 'あ',
          romaji: 'a',
          accuracy: 90,
          attempts: 10,
          correct_attempts: 9
        },
        {
          id: '2',
          character: 'い',
          romaji: 'i',
          accuracy: 80,
          attempts: 5,
          correct_attempts: 4
        }
      ];

      expect(kanaArray).toHaveLength(2);
      expect(kanaArray[0].character).toBe('あ');
      expect(kanaArray[1].character).toBe('い');
    });

    it('should work with mode selection', () => {
      const modes: InteractionMode[] = ['typing', 'multiple-choice'];
      const currentMode: InteractionMode = modes[0];

      expect(currentMode).toBe('typing');
      expect(modes).toContain('multiple-choice');
    });

    it('should work with sort direction toggling', () => {
      let direction: SortDirection = 'asc';

      expect(direction).toBe('asc');

      direction = 'desc';
      expect(direction).toBe('desc');
    });
  });
});