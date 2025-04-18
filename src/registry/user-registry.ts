import { Registry } from './registry';
import { User, UserState } from './entities/user';

export class UserRegistry extends Registry<User, UserState> {
    private _localUserId: string | null = null;

    public get localUserId(): string | null {
        return this._localUserId;
    }

    public set localUserId(id: string | null) {
        this._localUserId = id;
    }
};
