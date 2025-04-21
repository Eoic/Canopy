import { InMessages, InMessageType, InWebSocketMessage } from '../network/types/message';
import { ConnectionManager } from '../network/connection-manager';
import { UserService } from '../service/user-service';
import { EventType } from '../network/types/user';

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
            case InMessageType.PointerOut:
                this._handlePointerOut(data.message);
                break;
            default:
                break;
        }
    };

    private _handleConnect = (data: InMessages[InMessageType.Connect]['message']) => {
        if (data.isLocal) {
            this._userService.loadConnectedUsers(data.id).then(() => {
                console.info('Users loaded.');
            }).catch((error) => {
                console.error('Error loading users:', error);
            });
        }

        this._userService.addUser(data);
    };

    private _handleDisconnect = (data: InMessages[InMessageType.Disconnect]['message']) => {
        this._userService.removeUser(data.id);
    };

    private _handlePointerPositions = (data: InMessages[InMessageType.PointerPositions]['message']) => {
        data.entities.forEach((entity) => {
            const user = this._userService.getUser(entity.id);

            if (!user)
                return;

            if (this._userService.isLocalUser(user.id))
                return;

            this._userService.pushEvent(
                entity.id,
                {
                    x: entity.position.x,
                    y: entity.position.y,
                    type: EventType.POSITION,
                    timestamp: entity.position.timestamp,
                }
            );
        });
    };

    private _handlePointerOut = (data: InMessages[InMessageType.PointerOut]['message']) => {
        const user = this._userService.getUser(data.id);

        if (!user)
            return;

        this._userService.pushEvent(
            user.id,
            {
                type: EventType.POINTER_OUT,
                timestamp: data.timestamp,
            }
        );
    };
};
