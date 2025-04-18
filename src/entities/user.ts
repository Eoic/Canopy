import { Assets, Container, Graphics, ObservablePoint, Text, TextStyle, Texture, PointData } from 'pixi.js';
import { Layer } from '../world/layers';
import { Tween, Interpolation } from '@tweenjs/tween.js';
import { getUserColor } from '../utils/user-utils';
import { UserDTO } from '../network/types/user';

const UPDATE_INTERVAL_MS = 100;
const TWEEN_INTERVAL_MS = UPDATE_INTERVAL_MS * 0.65;

export type UserState = {
    id: string;
    isLocal: boolean;
    cursor: UserCursor;
    positionsBuffer: PointData[];
    positionFrom: PointData;
    positionTo: PointData;
};

export type UserCursor = {
    name: Text;
    container: Container;
}

export class User {
    private _tween: Tween;
    private _state: UserState;
    private _isTweenDone: boolean = true;
    private _fromPosition: PointData = { x: 0, y: 0 };
    private _toPosition: PointData = { x: 0, y: 0 };

    get id() {
        return this._state.id;
    }

    get position() {
        const point = this._state.cursor.container.position;

        return {
            x: point.x,
            y: point.y,
        };
    }

    set position(value: PointData) {
        this._state.cursor.container.position.copyFrom(value);
    }

    get positionsBuffer() {
        return this._state.positionsBuffer;
    }

    get cursor() {
        return this._state.cursor;
    }

    constructor(data: UserDTO) {
        this._state = {
            id: data.id,
            isLocal: data.isLocal,
            cursor: this._createCursor(data.id, `User(${data.id})`),
            positionsBuffer: [{ ...data.position }],
            positionFrom: { ...data.position },
            positionTo: { ...data.position },
        };

        this._tween = new Tween(this._fromPosition);
    }

    public update(_deltaMs: number, scale: ObservablePoint) {
        this._tween.update();
        this._state.cursor.name.resolution = scale._x;

        if (this._isTweenDone && this._state.positionsBuffer.length > 0) {
            this._fromPosition.x = this._state.cursor.container.position.x;
            this._fromPosition.y = this._state.cursor.container.position.y;

            const toPosition = this._state.positionsBuffer.shift()!;
            this._toPosition.x = toPosition.x;
            this._toPosition.y = toPosition.y;
            this._isTweenDone = false;

            this._tween = new Tween(this._fromPosition)
                .to(this._toPosition, TWEEN_INTERVAL_MS)
                .interpolation(Interpolation.Linear)
                .onUpdate((position) => this.position = position)
                .onComplete((_position) => this._isTweenDone = true)
                .start();
        }
    }

    public setData<K extends keyof UserState>(data: Pick<UserState, K>): K[] {
        const updatedKeys: K[] = [];

        for (const [key, value] of Object.entries(data) as [K, UserState[K]][]) {
            this._state[key] = value;
            updatedKeys.push(key);
        }

        return updatedKeys;
    }

    private _createCursor(id: string, userName: string): UserCursor {
        const cursorTexture = Assets.get<Texture>(['cursor']);

        if (!cursorTexture)
            throw new Error('Could not load cursor.');

        const color = getUserColor(id);
        const cursorContainer = new Container();
        const cursor = new Graphics(cursorTexture['0']);
        const name = this._createName(userName);
        const nameContainer = this._createNameContainer(name, color, cursor);
        cursor.tint = color;
        cursorContainer.addChild(nameContainer);
        cursorContainer.addChild(cursor);
        cursorContainer.zIndex = Layer.Cursor;

        return { container: cursorContainer, name };
    }

    private _createName(text: string) {
        const style = new TextStyle({ fill: 0xFFFFFF, fontSize: 11, letterSpacing: 1 });
        return new Text({ text, style, anchor: { x: 0.5, y: 0.5 } });
    }

    private _createNameContainer(text: Text, color: number, cursor: Graphics): Container {
        const container = new Container();

        const rect = new Graphics()
            .roundRect(0, 0, text.width + 10, text.height + 5, 3)
            .fill(color);

        container.addChild(rect);
        container.addChild(text);
        container.pivot.set(-cursor.width / 2, -cursor.height);
        text.pivot.set(-rect.width / 2, -rect.height / 2);

        return container;
    }
};
