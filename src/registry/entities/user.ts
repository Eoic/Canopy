import { Assets, Container, Graphics, ObservablePoint, Text, TextStyle, Texture, PointData, Buffer } from 'pixi.js';
import { Layer } from '../../world/layers';
import { getUserColor } from '../../utils/user-utils';
import { BufferedPosition, UserDTO } from '../../network/types/user';

const UPDATE_INTERVAL_MS = 100;

export type UserState = {
    id: string;
    isLocal: boolean;
    cursor: UserCursor;
    positionsBuffer: BufferedPosition[];
};

export type UserCursor = {
    name: Text;
    container: Container;
}

export class User {
    private _state: UserState;

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
            positionsBuffer: [],
        };
    }

    private _lerp(x0: number, x1: number, t: number) {
        return x0 + (x1 - x0) * t;
    }

    public update(_deltaMs: number, scale: ObservablePoint) {
        this._state.cursor.name.resolution = scale._x;

        const now = performance.timeOrigin + performance.now();
        const renderTime = now - UPDATE_INTERVAL_MS;
        const buffer = this._state.positionsBuffer;
      
        while (buffer.length >= 2 && buffer[1].timestamp < renderTime) 
            buffer.shift();

        if (buffer.length >= 2) {
            const [p0, p1] = buffer;
            const t = (renderTime - p0.timestamp) / (p1.timestamp - p0.timestamp);
      
            this.position = {
                x: this._lerp(p0.x, p1.x, t),
                y: this._lerp(p0.y, p1.y, t),
            };

            this._state.cursor.container.visible = true;
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
        cursorContainer.visible = false;

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
