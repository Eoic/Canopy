import { Assets, Container, Graphics, ObservablePoint, Text, TextStyle, Texture, PointData } from 'pixi.js';
import { Layer } from '../../world/layers';
import { getUserColor } from '../../utils/user-utils';
import { EventsBuffer, UserDTO } from '../../network/types/user';
import { PointerPositionEvent, PointerEnterEvent, PointerOutEvent } from '../../network/types/message';

const UPDATE_INTERVAL_MS = 100;

export type UserState = {
    id: string;
    isLocal: boolean;
    cursor: UserCursor;
    eventsBuffer: EventsBuffer;
};

export type UserCursor = {
    name: Text;
    container: Container;
}

export class User {
    private _state: UserState;

    get id(): string {
        return this._state.id;
    }

    get position(): Readonly<PointData> {
        const point = this._state.cursor.container.position;

        return {
            x: point.x,
            y: point.y,
        };
    }

    set position(value: PointData) {
        this._state.cursor.container.position.copyFrom(value);
    }

    get eventsBuffer(): EventsBuffer {
        return this._state.eventsBuffer;
    }

    get cursor(): UserCursor {
        return this._state.cursor;
    }

    constructor(data: UserDTO) {
        this._state = {
            id: data.id,
            eventsBuffer: [],
            isLocal: data.isLocal,
            cursor: this._createCursor(data.id, `User(${data.id})`),
        };
    }

    private _lerp(x0: number, x1: number, t: number): number {
        return x0 + (x1 - x0) * t;
    }

    public update(_deltaMs: number, scale: ObservablePoint) {
        this._state.cursor.name.resolution = scale._x;

        const now = performance.timeOrigin + performance.now();
        const renderTime = now - UPDATE_INTERVAL_MS;
        const buffer = this._state.eventsBuffer;

        // If there is no pair of position events, we cannot interpolate.
        if (buffer.length >= 2) {
            if (buffer[0].name === 'POINTER_POSITION' && buffer[1].name !== 'POINTER_POSITION') {
                const event = buffer.shift() as PointerPositionEvent;

                this.position = {
                    x: event.data.position.x,
                    y: event.data.position.y,
                };
            }
        }

        // Apply non-interpolated events one by one.
        if (buffer.length > 0) {
            switch (buffer[0].name) {
                case 'POINTER_ENTER':
                    this._state.cursor.container.visible = true;
                    buffer.shift();
                    break;
                case 'POINTER_OUT':
                    this._state.cursor.container.visible = false;
                    buffer.shift();
                    break;
            }
        }

        // if (buffer.length > 1 && buffer[1].type === EventType.POINTER_OUT) {
        //     this._state.cursor.container.visible = false;
        //     buffer.shift();
        //     return;
        // }

        while (
            buffer.length >= 2 &&
            buffer[1].timestamp < renderTime &&
            buffer[0].name === 'POINTER_POSITION' &&
            buffer[1].name === 'POINTER_POSITION'
        ) buffer.shift();

        if (buffer.length >= 2) {
            const [p0, p1] = buffer;

            if (p0.name !== 'POINTER_POSITION' || p1.name !== 'POINTER_POSITION')
                return;

            const time = (renderTime - p0.timestamp) / (p1.timestamp - p0.timestamp);

            this.position = {
                x: this._lerp(
                    p0.data.position.x,
                    p1.data.position.x,
                    time
                ),
                y: this._lerp(
                    p0.data.position.y,
                    p1.data.position.y,
                    time
                ),
            };
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

    private _createName(text: string): Text {
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
