import { InMessages, InMessageType, InWebSocketMessage } from '../network/types';
import { ConnectionManager } from '../network/connection-manager';
import { Users } from '../repository/users';
import { User } from '../entities/user';
import { Vector } from '../math/vector';
import { Viewport } from 'pixi-viewport';

export class ActionsHandler {
    private _users: Users;
    private _viewport: Viewport;
    private _isEnabled: boolean = false;

    constructor(users: Users, viewport: Viewport) {
        this._users = users;
        this._viewport = viewport;
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
            case InMessageType.PointerPositions:
                this._handlePointerPositions(data.message);
                break;
            case InMessageType.Users:
                this._handleUsers(data.message);
                break;
            default:
                break;
        }
    };

    private _handleConnect = (data: InMessages[InMessageType.Connect]['message']) => {
        const user = new User(data.id, new Vector(0, 0));

        // TODO: Not great.
        if (data.isAuthor)
            this._users.currentUser = user;

        this._users.addEntity(user);
    };

    private _handleDisconnect = (data: InMessages[InMessageType.Disconnect]['message']) => {
        this._users.removeEntity(data.id);
    };

    private _handlePointerPositions = (data: InMessages[InMessageType.PointerPositions]['message']) => {
        data.positions.forEach((entity) => {
            this._users.updateEntity(entity.id, { position: new Vector().set(entity.position.x, entity.position.y) });
        });
    };

    private _handleUsers = (data: InMessages[InMessageType.Users]['message']) => {
        data.users.forEach((userData) => {
            const user = new User(userData.id, new Vector(userData.position.x, userData.position.y));
            this._users.addEntity(user);
        });
    };
};
