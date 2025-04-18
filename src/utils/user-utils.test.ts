import { describe, it, expect } from 'vitest';
import { USER_COLORS, getUserColor } from './user-utils';

describe('user-utils', () => {
    it('should have a color pool of at least 1 color', () => {
        expect(USER_COLORS.length).toBeGreaterThan(0);
    });

    it('should return a color from the pool', () => {
        const color = getUserColor('test');
        expect(USER_COLORS).toContain(color);
        expect(color).toBeTypeOf('number');
    });
});
