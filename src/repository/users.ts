import { User } from '../entities/user';
import { Registry, WithId } from './registry';

export class Users extends Registry<User> {
    public addEntity(entity: WithId<User>): void {
        super.addEntity(entity);
    }

    public removeEntity(id: string): void {
        super.removeEntity(id);
    }
};
