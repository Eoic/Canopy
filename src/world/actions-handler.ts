import { InMessages, InMessageType, InWebSocketMessage } from '../network/types';
import { ConnectionManager } from '../network/connection-manager';
import { Vector } from '../math/vector';
import { UserService } from '../service/user-service';

export class ActionsHandler {
    private _userService: UserService;
    private _isEnabled: boolean = false;

    constructor(userService: UserService) {
        this._userService = userService;
    }

    public enable() {
        if (this._isEnabled)
            throw new Error('Already enabled!');

        this._addEvents();
        this._isEnabled = true;
    }

    public disable() {
        if (!this._isEnabled)
            throw new Error('Already disabled!');

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
            default:
                break;
        }
    };

    private _handleConnect = (data: InMessages[InMessageType.Connect]['message']) => {
        // const user = new User(data.id, new Vector(0, 0));

        // TODO: Not good.
        if (data.isAuthor)
            this._userService.setCurrentUser(data);
            // this._users.currentUser = user;

        this._userService.addUser(data);
        // this._users.addEntity(user);
    };

    private _handleDisconnect = (data: InMessages[InMessageType.Disconnect]['message']) => {
        // this._users.removeEntity(data.id);
        this._userService.removeUser(data);
    };

    private _handlePointerPositions = (data: InMessages[InMessageType.PointerPositions]['message']) => {
        data.positions.forEach((entity) => {
            const position = new Vector(entity.position.x, entity.position.y);
            const user = this._userService.getUser(entity.id);
            // const user = this._users.getEntity(entity.id);

            if (user?.id === this._userService.getCurrentUser()?.id/*this._users.currentUser?.id*/)
                return;

            if (user) {
                // this._users.updateEntity(
                //     entity.id,
                //     { positionsBuffer: [...user.positionsBuffer, position] }
                // );

                this._userService.updateUser(
                    entity.id,
                    { positionsBuffer: [...user.positionsBuffer, position] }
                );
            }
        });
    };

    // private _handleUsers = (data: InMessages[InMessageType.Users]['message']) => {
    //     data.users.forEach((userData) => {
    //         const user = new User(userData.id, new Vector(userData.position.x, userData.position.y));
    //         this._users.addEntity(user);
    //     });
    // };
};
