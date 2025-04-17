import { UserDTO } from '../network/types/user';
import { request } from './utils/client';

export class UserAPI {
    static fetchAll(): Promise<{ users: UserDTO[] }> {
        return request<{ users: UserDTO[] }>('users/');
    }
}
