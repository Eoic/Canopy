import { Service } from './service';
import { UserRegistry } from '../registry/user-registry';
import { UserRepository } from '../repository/user-repository';
import { User, UserState } from '../registry/entities/user';
import { UserDTO } from '../network/types/user';
import { BufferedEvent } from '../network/types/message';
import { Scene } from '../world/scene';

export class UserService extends Service<UserRepository, UserRegistry> {
    public get repository(): UserRepository {
        return this._repository;
    }

    public get registry(): UserRegistry {
        return this._registry;
    }

    public async loadConnectedUsers(localUserId: string) {
        try {
            const users = await this._repository.fetchUsers(localUserId);

            for (const user of users) {
                if (!this.isLocalUser(user.id))
                    this.addUser(user);
            }
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

    public pushEvent(id: string, event: BufferedEvent) {
        const user = this.getUser(id);

        if (!user)
            return;

        // FIXME: Why is the timestamp overwritten on the client?
        user.eventsBuffer.push({ ...event, timestamp: Scene.pageStart + performance.now() });
    }
};
