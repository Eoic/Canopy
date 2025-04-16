import { request } from './utils/client';
import { UserData } from '../entities/user';

export class UserAPI {
    static fetchAll(): Promise<UserData[]> {
        return request<UserData[]>('users/');
    }
}
