import { Assets, Container, Graphics, ObservablePoint, Sprite, Text, TextStyle, Texture } from 'pixi.js';
import { Layer } from '../world/layers';
import { Tween, Interpolation } from '@tweenjs/tween.js';

export type UserData = {
    cursor: Container;
    positionsBuffer: { x: number, y: number }[];
    fromPosition: { x: number, y: number };
    toPosition: { x: number, y: number };
};

const UPDATE_INTERVAL_MS = 100;

export class User {
    private readonly _id: string;
    private _tween: Tween;
    private _data: UserData;
    private _isTweenDone: boolean = true;
    private _fromPosition: { x: number, y: number } = { x: 0, y: 0 };
    private _toPosition: { x: number, y: number } = { x: 0, y: 0 };
    private _name?: Text;

    get id() {
        return this._id;
    }

    get position() {
        return {
            x: this._data.cursor.position.x,
            y: this._data.cursor.position.y,
        };
    }

    set position(value: { x: number, y: number }) {
        this._data.cursor.position.x = value.x;
        this._data.cursor.position.y = value.y;
    }

    get positionsBuffer() {
        return this._data.positionsBuffer;
    }

    get cursor() {
        return this._data.cursor;
    }

    constructor(id: string, position: { x: number, y: number }) {
        this._id = id;
        this._data = {
            cursor: this._createCursor(),
            positionsBuffer: [position],
            fromPosition: { ...position },
            toPosition: { ...position },
        };

        this._tween = new Tween(this._fromPosition);
    }

    public update(_deltaMs: number, scale: ObservablePoint) {
        this._tween.update();
        this._name!.resolution = scale._x;

        if (this._isTweenDone && this._data.positionsBuffer.length > 0) {
            this._isTweenDone = false;
            this._fromPosition.x = this._data.cursor.position.x;
            this._fromPosition.y = this._data.cursor.position.y;

            const toPosition = this._data.positionsBuffer.shift()!;
            this._toPosition.x = toPosition.x;
            this._toPosition.y = toPosition.y;

            this._tween = new Tween(this._fromPosition)
                .to(this._toPosition, UPDATE_INTERVAL_MS * 0.85)
                .interpolation(Interpolation.Linear)
                .onUpdate((position) => this.position = position)
                .onComplete((_position) => this._isTweenDone = true)
                .start();
        }
    }

    public setData(data: Partial<UserData>): string[] {
        const updatedKeys: string[] = [];

        for (const [key, value] of Object.entries(data)) {
            this._data[key] = value;
            updatedKeys.push(key);
        }

        return updatedKeys;
    }

    private _createCursor() {
        const cursorTexture = Assets.get<Texture>(['cursor']);

        if (!cursorTexture)
            throw new Error('Could not load cursor.');

        const container = new Container();
        const cursor = new Graphics(cursorTexture['0']);
        const name = this._createNameTag(this.id, 0xDC143C, cursor);
        cursor.tint = 0xDC143C;
        container.addChild(name);
        container.addChild(cursor);
        container.zIndex = Layer.Cursor;

        return container;
    }

    private _createNameTag(text: string, color: number, cursor: Graphics): Container {
        const name = new Container();
        const style = new TextStyle({ fill: 0xFFFFFF, fontSize: 11, letterSpacing: 1 });
        const nameText = new Text({ text, style, anchor: { x: 0.5, y: 0.5 } });

        const nameRect = new Graphics()
            .roundRect(0, 0, nameText.width + 10, nameText.height + 5, 3)
            .fill(color);

        name.addChild(nameRect);
        name.addChild(nameText);
        name.pivot.set(-cursor.width / 2, -cursor.height);
        nameText.pivot.set(-nameRect.width / 2, -nameRect.height / 2);
        this._name = nameText;

        return name;
    }
};
