/**
 * Message types.
 */
export enum InMessageType {
    Users = 'USERS',
    Connect = 'CONNECT',
    Disconnect = 'DISCONNECT',
    PointerPositions = 'POINTER_POSITIONS',
};

export enum OutMessageType {
    SwitchCell = 'SWITCH_CELL',
    PointerPosition = 'POINTER_POSITION',
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
                position: { x: number, y: number,}
            }>
        }
    },

    [InMessageType.Connect]: {
        type: InMessageType.Connect,
        message: {
            id: string,
            isLocal: boolean,
            position: { x: number, y: number, },
        }
    },

    [InMessageType.Disconnect]: {
        type: InMessageType.Disconnect,
        message: {
            id: string,
            isLocal: boolean,
            position: { x: number, y: number, },
        }
    },

    [InMessageType.PointerPositions]: {
        type: InMessageType.PointerPositions,
        message: {
            positions: Array<{
                id: string,
                isLocal: boolean,
                position: { x: number, y: number }
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
        },
    },
};

type ValuesType<T> = T[keyof T];

export type InWebSocketMessage = ValuesType<InMessages>;
export type OutWebSocketMessage = ValuesType<OutMessages>;
