import { UserRegistry } from './user-registry';
import { describe, it, expect } from 'vitest';
import { User } from './entities/user';

describe('UserRegistry', () => {
    it('should add a user to the registry', () => {
        const userRegistry = new UserRegistry();

        const user = new User({
            id: '1',
            isLocal: false,
        });

        userRegistry.addEntity(user);
        expect(userRegistry.getEntity('1')).toEqual(user);
    });

    it('should remove a user from the registry', () => {
        const userRegistry = new UserRegistry();

        const user = new User({
            id: '1',
            isLocal: false,
        });

        userRegistry.addEntity(user);
        expect(userRegistry.hasEntity('1')).toBe(true);

        userRegistry.removeEntity('1');
        expect(userRegistry.getEntity('1')).toBeNull();
        expect(userRegistry.hasEntity('1')).toBe(false);
    });

    it('should manage reference to a local user by id', () => {
        const userRegistry = new UserRegistry();
        const localUserId = '1';

        userRegistry.localUserId = localUserId;
        expect(userRegistry.localUserId).toBe(localUserId);

        userRegistry.localUserId = null;
        expect(userRegistry.localUserId).toBeNull();
    });
});
