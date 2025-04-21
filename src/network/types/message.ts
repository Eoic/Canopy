/**
 * Message types.
 */
export enum InMessageType {
    Users = 'USERS',
    Connect = 'CONNECT',
    Disconnect = 'DISCONNECT',
    PointerPositions = 'POINTER_POSITIONS',
    PointerOut = 'POINTER_OUT_OF_BOUNDS',
};

export enum OutMessageType {
    SwitchCell = 'SWITCH_CELL',
    PointerPosition = 'POINTER_POSITION',
    PointerOut = 'POINTER_OUT',
};

/**
 * Defines message message types coming
 * from the server over WebSocket connection.
 */
export type InMessages = {
    [InMessageType.Users]: {
        type: InMessageType.Users,
        message: {
            users: Array<{
                id: string,
                isLocal: boolean,
            }>
        }
    },

    [InMessageType.Connect]: {
        type: InMessageType.Connect,
        message: {
            id: string,
            isLocal: boolean,
        }
    },

    [InMessageType.Disconnect]: {
        type: InMessageType.Disconnect,
        message: {
            id: string,
            isLocal: boolean,
        }
    },

    [InMessageType.PointerPositions]: {
        type: InMessageType.PointerPositions,
        message: {
            entities: Array<{
                id: string,
                isLocal: boolean,
                position: { x: number, y: number, timestamp: number },
            }>
        }
    },

    [InMessageType.PointerOut]: {
        type: InMessageType.PointerOut,
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
        type: OutMessageType.SwitchCell,
        message: {
            prevCell: { x: number, y: number } | null,
            nextCell: { x: number, y: number } | null,
        }
    },

    [OutMessageType.PointerPosition]: {
        type: OutMessageType.PointerPosition
        message: {
            id: string,
            position: { x: number, y: number },
            timestamp: number,
        },
    },

    [OutMessageType.PointerOut]: {
        type: OutMessageType.PointerOut,
        message: {
            id: string,
            timestamp: number,
        }
    },
};

type ValuesType<T> = T[keyof T];

export type InWebSocketMessage = ValuesType<InMessages>;
export type OutWebSocketMessage = ValuesType<OutMessages>;
