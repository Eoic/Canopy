declare module 'perfect-cursors' {
    export class PerfectCursor {
        constructor(callback: (point: number[]) => void);
        addPoint(point: number[]): void;
        dispose(): void;
    }
}
