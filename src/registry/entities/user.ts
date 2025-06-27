import { EventsBuffer, UserDTO } from '../../network/types/user';

export type UserState = {
    id: string;
    isLocal: boolean;
    eventsBuffer: EventsBuffer;
};

export class User {
    private _state: UserState;

    get id(): string {
        return this._state.id;
    }

    get eventsBuffer(): EventsBuffer {
        return this._state.eventsBuffer;
    }

    constructor(data: UserDTO) {
        this._state = {
            id: data.id,
            eventsBuffer: [],
            isLocal: data.isLocal,
        };
    }

    public setData<K extends keyof UserState>(data: Pick<UserState, K>): K[] {
        const updatedKeys: K[] = [];

        for (const [key, value] of Object.entries(data) as [K, UserState[K]][]) {
            this._state[key] = value;
            updatedKeys.push(key);
        }

        return updatedKeys;
    }

}
