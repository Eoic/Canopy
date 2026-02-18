declare module 'colyseus.js' {
    export class Client {
        constructor(url: string);
        joinOrCreate<T = unknown>(roomName: string, options?: Record<string, unknown>): Promise<Room<T>>;
        join<T = unknown>(roomName: string, options?: Record<string, unknown>): Promise<Room<T>>;
        create<T = unknown>(roomName: string, options?: Record<string, unknown>): Promise<Room<T>>;
    }

    export interface Room<T = unknown> {
        sessionId: string;
        state: T;
        send(type: string, message?: unknown): void;
        leave(): void;
        onMessage<M = unknown>(type: string, callback: (message: M) => void): void;
        onStateChange(callback: (state: T) => void): void;
        onLeave(callback: (code: number) => void): void;
        onError(callback: (code: number, message?: string) => void): void;
    }
}
