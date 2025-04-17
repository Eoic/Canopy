import { Service } from './service';
import { UserRegistry } from '../registry/user-registry';
import { UserRepository } from '../repository/user-repository';
import { User, UserState } from '../entities/user';
import { UserDTO } from '../network/types/user';

export class UserService extends Service<UserRepository, UserRegistry> {
    public get repository(): UserRepository {
        return this._repository;
    }

    public get registry(): UserRegistry {
        return this._registry;
    }

    public async loadUsers() {
        try {
            const users = await this._repository.fetchUsers();
            this._registry.upsertEntities(users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    }

    public getUser(id: string): User | null {
        return this.registry.getEntity(id);
    }

    public getUsers(): User[] {
        return this.registry.getEntities();
    }

    public getLocalUser(): User | null {
        return this.repository.getLocalUser();
    }

    public setLocalUser(id: string) {
        this.repository.setLocalUser(id);
    }

    public isLocalUser(id: string): boolean {
        const localUser = this.getLocalUser();

        if (!localUser)
            return false;

        return localUser.id === id;
    }

    public addUser(data: UserDTO) {
        try {
            this.repository.createUser(data);
        } catch (error) {
            console.error('Failed to create user:', error);
        }
    }

    public updateUser(id: string, data: Pick<UserState, keyof UserState>) {
        try {
            this.repository.updateUser(id, data);
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    }

    public removeUser(id: string) {
        this.repository.removeUser(id);
    }
};
