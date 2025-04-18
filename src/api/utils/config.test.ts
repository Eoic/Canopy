import { describe, it, expect } from 'vitest';
import { API_BASE } from './config';

describe('API_BASE', () => {
    it('should match the environment variable', () => {
        expect(API_BASE).toBe(import.meta.env.VITE_API_URL);
    });
});
