/**
 * Message types.
 */
export enum InMessageType {
    Users = 'USERS',
    Connect = 'CONNECT',
    Disconnect = 'DISCONNECT',
    State = 'STATE',
    PointerOut = 'POINTER_OUT_OF_BOUNDS',
};

export enum OutMessageType {
    SwitchCell = 'SWITCH_CELL',
    PointerPosition = 'POINTER_POSITION',
    PointerOut = 'POINTER_OUT',
};

export type GenericEvent = {
    event_id: string,
    timestamp: number,
    is_transient: boolean,
};

export type PointerPositionEvent = {
    name: 'POINTER_POSITION',
    data: {
        position: {
            x: number,
            y: number
        }
    }
} & GenericEvent;

export type PointerOutEvent = {
    name: 'POINTER_OUT',
} & GenericEvent;

export type BufferedEvent = PointerPositionEvent | PointerOutEvent;

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

    [InMessageType.PointerOut]: {
        name: InMessageType.PointerOut,
        message: {
            id: string,
            timestamp: number,
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

    [OutMessageType.PointerPosition]: {
        name: OutMessageType.PointerPosition
        message: {
            id: string,
            timestamp: number,
            data: {
                position: { x: number, y: number },
            }
        },
    },

    [OutMessageType.PointerOut]: {
        name: OutMessageType.PointerOut,
        message: {
            id: string,
            timestamp: number,
        }
    },
};

type ValuesType<T> = T[keyof T];

export type InWebSocketMessage = ValuesType<InMessages>;
export type OutWebSocketMessage = ValuesType<OutMessages>;
