// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [],
    test: {
        globals: true,
        environment: 'jsdom',
        deps: {
            optimizer: {
                web: {
                    include: ['vitest-canvas-mock'],
                },
            },
        },
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        environmentOptions: {
            jsdom: {
                resources: 'usable',
            },
        },
    },
});
