import { UserDTO } from '../network/types/user';
import { request } from './utils/client';

export class UserAPI {
    static fetchAll(localUserId: string): Promise<{ users: UserDTO[] }> {
        return request<{ users: UserDTO[] }>(`users/?localUserId=${localUserId}`);
    }
}
