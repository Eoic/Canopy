import { Service } from './service';
import { UserRegistry } from '../registry/user-registry';
import { UserRepository } from '../repository/user-repository';
import { User, UserData } from '../entities/user';

export class UserService extends Service<UserRepository, UserRegistry> {
    async loadUsers() {
        try {
            const users = await this._repository.fetchUsers();
            this._registry.upsertEntities(users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    }

    getUser(id: string): User | null {
        return null;
    }

    getCurrentUser(id: string): User | null {
        return null;
    }

    setCurrentUser(data: UserData) {
    }

    addUser(data: UserData) {

    }

    removeUser(data: UserData) {
        
    }
};
