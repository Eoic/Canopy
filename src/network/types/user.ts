export enum EventType {
    POSITION = 'POSITION',
    POINTER_OUT = 'POINTER_OUT',
}

export type PositionEvent = {
    x: number;
    y: number;
    type: EventType.POSITION,
};

export type PointerOutEvent = {
    type: EventType.POINTER_OUT,
};

export type BufferedEvent = {
    timestamp: number;
} & (
    | PositionEvent
    | PointerOutEvent
);

export type EventsBuffer = BufferedEvent[];

export type UserDTO = {
    id: string;
    isLocal: boolean;
};
