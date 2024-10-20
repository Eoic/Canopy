type Callbacks = {
    open?: () => void;
    close?: () => void;
    error?: (error: string) => void;
    message?: (data: object) => void;
};

export class ConnectionManager {
    private static LOG_LABEL = 'WebSocket';

    private url: string;
    private callbacks: Callbacks = {};
    private connection: WebSocket | null = null;

    public get isConnected(): boolean {
        return this.connection !== null && this.connection.readyState === WebSocket.OPEN;
    }

    constructor(url: string) {
        this.url = url;
        this.connect();
    }

    private connect() {
        this.connection = new WebSocket(this.url);
        this.addEvents();
    }

    private addEvents() {
        if (!this.connection)
            throw Error('Connection does not exist!');

        this.connection.addEventListener('open', this.handleOpen);
        this.connection.addEventListener('close', this.handleClose);
        this.connection.addEventListener('error', this.handleError);
        this.connection.addEventListener('message', this.handleMessage);
    }

    private handleOpen = (_event: Event) => {
        console.info(`[${ConnectionManager.LOG_LABEL}] Connection opened.`);
        this.callbacks.open?.();
    };

    private handleClose = (event: CloseEvent) => {
        console.info(`[${ConnectionManager.LOG_LABEL}] Connection closed:`, event.reason);
        this.callbacks.close?.();
    };

    private handleError = (event: Event) => {
        console.log(`[${ConnectionManager.LOG_LABEL}] Error:`, event);
        this.callbacks.error?.('Oops...');
    };

    private handleMessage = (event: MessageEvent) => {
        this.callbacks.message?.(JSON.parse(event.data as string) as object);
    };

    public on<T extends keyof Callbacks>(event: T, callback: Callbacks[T]): void {
        this.callbacks[event] = callback;
    }

    public send(data: Record<string, unknown> & Record<'type', string>) {
        if (!this.isConnected)
            throw new Error('Cannot send because we are not connected.');

        this.connection!.send(JSON.stringify(data));
    }
};
