import { InMessages, InMessageType, InWebSocketMessage } from '../network/types';
import { ConnectionManager } from '../network/connection-manager';
import { Users } from '../repository/users';
import { User } from '../entities/user';
import { Vector } from '../math/vector';

export class ActionsHandler {
    private _users: Users;
    private _isEnabled: boolean = false;

    constructor(users: Users) {
        this._users = users;
    }

    public enable() {
        this._addEvents();
        this._isEnabled = true;
    }

    public disable() {
        this._removeEvents();
        this._isEnabled = false;
    }

    private _addEvents() {
        ConnectionManager.instance.on('message', this._handleActions);
    }

    private _removeEvents() {
        ConnectionManager.instance.off('message', this._handleActions);
    }

    private _handleActions = (data: InWebSocketMessage) => {
        switch (data.type) {
            case InMessageType.Connect:
                this._handleConnect(data.message);
                break;
            case InMessageType.Disconnect:
                this._handleDisconnect(data.message);
                break;
            case InMessageType.PointerPosition:
                this._handlePointerPosition(data.message);
                break;
            case InMessageType.Users:
                this._handleUsers(data.message);
                break;
            default:
                break;
        }
    };

    private _handleConnect = (data: InMessages['Connect']['message']) => {
        const user = new User(data.id, new Vector(0, 0));
        this._users.addEntity(user);

        if (data.isAuthor)
            this._users.currentUser = user;
    };

    private _handleDisconnect = (data: InMessages['Disconnect']['message']) => {
        this._users.removeEntity(data.id);
    };

    private _handlePointerPosition = (data: InMessages['PointerPosition']['message']) => {
        console.log('Pointer at', data);
    };

    private _handleUsers = (data: InMessages['Users']['message']) => {
        data.users.forEach((userData) => {
            const user = new User(userData.id, new Vector(userData.position.x, userData.position.y));
            this._users.addEntity(user);
        });

        console.log(data);
    };
};
