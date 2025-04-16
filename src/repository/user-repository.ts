import { User, UserData } from '../entities/user';
import { Repository } from './repository';
import { UserAPI } from '../api/users';
import { UserRegistry } from '../registry/user-registry';
import { Vector } from '../math/vector';

export class UserRepository extends Repository<UserData, User, UserRegistry> {
    public async fetchUsers(): Promise<User[]> {
        const usersData = await UserAPI.fetchAll();
        return usersData.map((userData) => this._hydrate(userData));
    }

    protected _hydrate(dto: UserData): User {
        return new User(dto.id, new Vector(0, 0));
    }
}
