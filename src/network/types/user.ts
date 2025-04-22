import { BufferedEvent } from './message';

export enum EventType {
    POSITION = 'POSITION',
    POINTER_OUT = 'POINTER_OUT',
}

export type EventsBuffer = BufferedEvent[];

export type UserDTO = {
    id: string;
    isLocal: boolean;
};
