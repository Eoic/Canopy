import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { Vector } from '../math/vector';
import { Layer } from '../world/layers';
import { Tween, Interpolation, Easing } from '@tweenjs/tween.js';

const cursor = `
<svg version="1.1" viewBox="0 0 191.77 241.02" xmlns="http://www.w3.org/2000/svg">
  <cursorMask transform="translate(.085323 .2732)" fill="#000">
    <path
      d="m92 166-34 47c-4 7-14 5-15-3l-43-199c-1-8 7-14 13-10l174 105c7 4 6 14-2 16l-57 17 52 70c3 4 2 9-1 12l-25 18c-4 3-9 2-12-2z" />
  </cursorMask>
</svg>`;

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

    // TODO:
    // * Add outline / border.
    get cursor() {
        const cursorSprite = new Sprite(Texture.WHITE);
        const cursorMask = new Graphics().svg(cursor);

        cursorSprite.mask = cursorMask;
        cursorSprite.position.set(0, 0);
        cursorSprite.tint = 0x231651;
        cursorSprite.width = cursorMask.width;
        cursorSprite.height = cursorMask.height;

        this._data.cursor.addChild(cursorMask);
        this._data.cursor.addChild(cursorSprite);
        this._data.cursor.zIndex = Layer.Cursor;
        this._data.cursor.scale.set(0.05, 0.05);

        return this._data.cursor;
    }

    constructor(id: string, position: { x: number, y: number }) {
        this._id = id;
        this._data = {
            cursor: new Container(),
            positionsBuffer: [position],
            fromPosition: { ...position },
            toPosition: { ...position },
        };

        this._tween = new Tween(this._fromPosition);
    }

    public update(_deltaMs: number) {
        this._tween.update();

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
};
