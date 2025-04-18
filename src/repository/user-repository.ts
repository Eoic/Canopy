import { User, UserState } from '../entities/user';
import { Repository } from './repository';
import { UserAPI } from '../api/users';
import { UserRegistry } from '../registry/user-registry';
import { UserDTO } from '../network/types/user';

export class UserRepository extends Repository<UserDTO, User, UserRegistry> {
    public async fetchUsers(localUserId: string): Promise<UserDTO[]> {
        const usersData = await UserAPI.fetchAll(localUserId);
        return usersData.users;
    }

    public hydrate(dto: UserDTO): User {
        return new User(dto);
    }

    public createUser(data: UserDTO): User {
        if (this._registry.hasEntity(data.id))
            throw new Error(`User with id ${data.id} already exists.`);

        const user = this.hydrate(data);

        if (data.isLocal)
            this.setLocalUser(user.id);

        this._registry.addEntity(user);

        return user;
    }

    public updateUser(id: string, data: Pick<UserState, keyof UserState>): User {
        this._registry.updateEntity(id, data);
        const user = this._registry.getEntity(id);
    
        if (!user)
            throw new Error(`User with id ${id} does not exist.`);

        return user;
    }

    public removeUser(id: string) {
        this._registry.removeEntity(id);
    }

    public getLocalUser(): User | null {
        if (!this._registry.localUserId)
            return null;

        return this._registry.getEntity(this._registry.localUserId);
    }

    public setLocalUser(id: string) {
        this._registry.localUserId = id;
    }
}
