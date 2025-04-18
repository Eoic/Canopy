import { describe, it, expect } from 'vitest';
import { cyrb53 } from './crypto';

describe('cyrb53', () => {
    it('should return consistent hash values for the same input', () => {
        const hash1 = cyrb53('test');
        const hash2 = cyrb53('test');
        expect(hash1).toBe(hash2);
    });

    it('should return different hash values for different inputs', () => {
        const hash1 = cyrb53('test1');
        const hash2 = cyrb53('test2');
        expect(hash1).not.toBe(hash2);
    });

    it('should respect the seed value', () => {
        const hash1 = cyrb53('test', 1);
        const hash2 = cyrb53('test', 2);
        expect(hash1).not.toBe(hash2);
    });
});
