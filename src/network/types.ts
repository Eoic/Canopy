/**
 * Message types.
 */
export enum InMessageType {
    Users = 'USERS',
    Connect = 'CONNECT',
    Disconnect = 'DISCONNECT',
    PointerPosition = 'POINTER_POSITION',
};

export enum OutMessageType {
    SwitchCell = 'SWITCH_CELL',
    PointerPosition = 'PLAYER_POSITION',
};

/**
 * Defines message message types coming
 * from the server over WebSocket connection.
 */
export type InMessages = {
    Users: {
        type: InMessageType.Users,
        message: {
            users: Array<{
                id: string,
                position: {
                    x: number,
                    y: number,
                }
            }>
        }
    },

    Connect: {
        type: InMessageType.Connect,
        message: {
            id: string,
            isAuthor: boolean,
        }
    },

    Disconnect: {
        type: InMessageType.Disconnect,
        message: {
            id: string,
            isAuthor: boolean,
        }
    },

    PointerPosition: {
        type: InMessageType.PointerPosition,
        message: {
            id: string,
            position: {
                x: number,
                y: number
            }
        }
    },
};

/**
 * Defines message message types 
 * sent to the server over the WebSocket connection.
 */
export type OutMessages = {
    SwitchCell: {
        type: OutMessageType.SwitchCell,
        message: {
            prevCell: { x: number, y: number } | null,
            nextCell: { x: number, y: number } | null
        }
    },

    PointerPosition: {
        type: OutMessageType.PointerPosition
        message: {
            id: string,
            position: {
                x: number,
                y: number
            }
        },
    },
};

type ValuesType<T> = T[keyof T];

export type InWebSocketMessage = ValuesType<InMessages>;
export type OutWebSocketMessage = ValuesType<OutMessages>;
