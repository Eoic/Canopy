import { InWebSocketMessage, OutMessages, OutMessageType } from './types/message';

type Callbacks = {
    open?: Array<VoidFunction>;
    close?: Array<VoidFunction>
    error?: Array<(error: string) => void>;
    message?: Array<(message: InWebSocketMessage) => void>;
};

export class ConnectionManager {
    public static LOG_LABEL = 'WebSocket';
    private static _instance: ConnectionManager | null = null;

    private _connection: WebSocket | null = null;
    private _callbacks: { [K in keyof Callbacks]: Callbacks[K] } = {};

    public static get instance(): ConnectionManager {
        if (this._instance === null)
            this._instance = new ConnectionManager();

        return this._instance;
    }

    public get url(): string {
        return import.meta.env.VITE_WEBSOCKET_URL;
    }

    public get isConnected(): boolean {
        return this._connection !== null && this._connection.readyState === WebSocket.OPEN;
    }

    public connect() {
        this._connection = new WebSocket(this.url);
        this._addEvents();
    }

    public disconnect() {
        this._connection?.close();
        this._removeEvents();
        this._connection = null;
    }

    private _addEvents() {
        if (!this._connection)
            throw Error('Connection does not exist!');

        this._connection.addEventListener('open', this._handleOpen);
        this._connection.addEventListener('close', this._handleClose);
        this._connection.addEventListener('error', this._handleError);
        this._connection.addEventListener('message', this._handleMessage);
    }

    private _removeEvents() {
        if (!this._connection)
            return;

        this._connection.removeEventListener('open', this._handleOpen);
        this._connection.removeEventListener('close', this._handleClose);
        this._connection.removeEventListener('error', this._handleError);
        this._connection.removeEventListener('message', this._handleMessage);
    }

    private _handleOpen = (_event: Event) => {
        console.info(`[${ConnectionManager.LOG_LABEL}] Connection opened.`);

        if (this._callbacks.open && this._callbacks.open.length > 0)
            this._callbacks.open?.forEach((callback) => callback());
    };

    private _handleClose = (event: CloseEvent) => {
        console.info(`[${ConnectionManager.LOG_LABEL}] Connection closed:`, event.reason);

        if (this._callbacks.close && this._callbacks.close.length > 0)
            this._callbacks.close?.forEach((callback) => callback());
    };

    private _handleError = (event: Event) => {
        console.log(`[${ConnectionManager.LOG_LABEL}] Error:`, event);

        if (this._callbacks.error && this._callbacks.error.length > 0)
            this._callbacks.error?.forEach((callback) => callback('An error occurred.'));
    };

    private _handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data as string) as InWebSocketMessage;

        if (this._callbacks.message && this._callbacks.message.length > 0)
            this._callbacks.message?.forEach((callback) => callback(data));
    };

    public on<T extends keyof Callbacks>(event: T, callback: Flatten<Callbacks[T]>) {
        if (!this._callbacks[event])
            this._callbacks[event] = [];

        this._callbacks[event].push(callback);
    }

    public off<T extends keyof Callbacks>(event: T, callback: Flatten<Callbacks[T]>) {
        if (!this._callbacks[event])
            return;

        const index = this._callbacks[event].findIndex((cb) => cb === callback);

        if (index === -1)
            return;

        this._callbacks[event].splice(index, 1);
    }

    public send<T extends OutMessageType>(data: OutMessages[T]) {
        if (!this.isConnected)
            throw new Error('Cannot send a message because we are not connected.');

        this._connection!.send(JSON.stringify(data));
    }
};
