import { Client, Room } from 'colyseus.js';
import { GameState } from './types/schema';

type Callbacks = {
    onJoin?: Array<(room: Room<GameState>) => void>;
    onLeave?: Array<(code: number) => void>;
    onError?: Array<(code: number, message?: string) => void>;
    onStateChange?: Array<(state: GameState) => void>;
};

export class ColyseusClient {
    public static LOG_LABEL = 'Colyseus';
    private static _instance: ColyseusClient | null = null;

    private _client: Client;
    private _room: Room<GameState> | null = null;
    private _callbacks: { [K in keyof Callbacks]: Callbacks[K] } = {};

    private constructor() {
        this._client = new Client(this.url);
    }

    public static get instance(): ColyseusClient {
        if (this._instance === null)
            this._instance = new ColyseusClient();

        return this._instance;
    }

    public get url(): string {
        return import.meta.env.VITE_COLYSEUS_URL;
    }

    public get room(): Room<GameState> | null {
        return this._room;
    }

    public get sessionId(): string | undefined {
        return this._room?.sessionId;
    }

    public get isConnected(): boolean {
        return this._room !== null;
    }

    public async connect(): Promise<void> {
        try {
            this._room = await this._client.joinOrCreate<GameState>('game');
            console.info(`[${ColyseusClient.LOG_LABEL}] Connected with sessionId: ${this._room.sessionId}`);

            this._room.onLeave((code: number) => {
                console.info(`[${ColyseusClient.LOG_LABEL}] Left room with code: ${code}`);
                this._room = null;

                if (this._callbacks.onLeave && this._callbacks.onLeave.length > 0)
                    this._callbacks.onLeave.forEach((callback) => callback(code));
            });

            this._room.onError((code: number, message?: string) => {
                console.error(`[${ColyseusClient.LOG_LABEL}] Error: ${code} - ${message}`);

                if (this._callbacks.onError && this._callbacks.onError.length > 0)
                    this._callbacks.onError.forEach((callback) => callback(code, message));
            });

            this._room.onStateChange((state: GameState) => {
                if (this._callbacks.onStateChange && this._callbacks.onStateChange.length > 0)
                    this._callbacks.onStateChange.forEach((callback) => callback(state));
            });

            if (this._callbacks.onJoin && this._callbacks.onJoin.length > 0)
                this._callbacks.onJoin.forEach((callback) => callback(this._room!));
        } catch (error) {
            console.error(`[${ColyseusClient.LOG_LABEL}] Failed to connect:`, error);
            throw error;
        }
    }

    public disconnect(): void {
        if (this._room) {
            this._room.leave();
            this._room = null;
        }
    }

    public lockCell(x: number, y: number) {
        if (!this._room)
            return;

        this._room.send('lock_cell', { x, y });
    }

    public unlockCell() {
        if (!this._room)
            return;

        this._room.send('unlock_cell');
    }

    public sendCursorPosition(x: number, y: number): void {
        if (!this._room)
            return;

        this._room.send('cursor', { x, y });
    }

    public sendCursorOut(): void {
        if (!this._room)
            return;

        this._room.send('cursor_out');
    }

    public on<T extends keyof Callbacks>(event: T, callback: NonNullable<Callbacks[T]>[number]) {
        if (!this._callbacks[event])
            this._callbacks[event] = [];

        (this._callbacks[event] as Array<typeof callback>).push(callback);
    }

    public off<T extends keyof Callbacks>(event: T, callback: NonNullable<Callbacks[T]>[number]) {
        if (!this._callbacks[event])
            return;

        const index = (this._callbacks[event] as Array<typeof callback>).findIndex((cb) => cb === callback);

        if (index === -1)
            return;

        (this._callbacks[event] as Array<typeof callback>).splice(index, 1);
    }
}
