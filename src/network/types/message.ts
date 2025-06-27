/**
 * Message types.
 */
export enum InMessageType {
    Users = 'USERS',
    Connect = 'CONNECT',
    Disconnect = 'DISCONNECT',
    State = 'STATE',
};

export enum OutMessageType {
    SwitchCell = 'SWITCH_CELL',
};

export type GenericEvent = {
    event_id: string,
    timestamp: number,
    is_transient: boolean,
};

export type BufferedEvent = GenericEvent

/**
 * Defines message message types coming
 * from the server over WebSocket connection.
 */
export type InMessages = {
    [InMessageType.Users]: {
        name: InMessageType.Users,
        message: {
            users: Array<{
                id: string,
                isLocal: boolean,
            }>
        }
    },

    [InMessageType.Connect]: {
        name: InMessageType.Connect,
        message: {
            id: string,
            isLocal: boolean,
        }
    },

    [InMessageType.Disconnect]: {
        name: InMessageType.Disconnect,
        message: {
            id: string,
            isLocal: boolean,
        }
    },

    [InMessageType.State]: {
        name: InMessageType.State,
        message: {
            entities: Array<{
                id: string,
                events: Array<BufferedEvent>,
            }>
        }
    },
};

/**
 * Defines message message types 
 * sent to the server over the WebSocket connection.
 */
export type OutMessages = {
    [OutMessageType.SwitchCell]: {
        name: OutMessageType.SwitchCell,
        message: {
            prevCell: { x: number, y: number } | null,
            nextCell: { x: number, y: number } | null,
        }
    },
};

type ValuesType<T> = T[keyof T];

export type InWebSocketMessage = ValuesType<InMessages>;
export type OutWebSocketMessage = ValuesType<OutMessages>;
