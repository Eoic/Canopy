import { Registry } from './registry';
import { User, UserData } from '../entities/user';

export class Users extends Registry<User, UserData> {
    private _currentUser?: User;

    get currentUser(): User | undefined {
        return this._currentUser;
    }

    set currentUser(user: User) {
        this._currentUser = user;
    }

    public isCurrentUser(id: string): boolean {
        return (this._currentUser?.id === id);
    }
};
