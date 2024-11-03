import { User } from '../entities/user';
import { Registry, WithId } from './registry';

export class Users extends Registry<User> {
    private _currentUser?: User;

    get currentUser(): User | undefined {
        return this._currentUser;
    }

    set currentUser(user: User) {
        this._currentUser = user;
    }

    public addEntity(entity: WithId<User>): void {
        super.addEntity(entity);
    }

    public removeEntity(id: string): void {
        super.removeEntity(id);
    }
};
