import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { Vector } from '../math/vector';
import { Layer } from '../world/layers';
import { Tween, Interpolation } from '@tweenjs/tween.js';

const cursor = `
<svg version="1.1" viewBox="0 0 191.77 241.02" xmlns="http://www.w3.org/2000/svg">
  <cursorMask transform="translate(.085323 .2732)" fill="#000">
    <path
      d="m92 166-34 47c-4 7-14 5-15-3l-43-199c-1-8 7-14 13-10l174 105c7 4 6 14-2 16l-57 17 52 70c3 4 2 9-1 12l-25 18c-4 3-9 2-12-2z" />
  </cursorMask>
</svg>`;

export type UserData = {
    cursor: Container;
    position: Vector;
    elapsedTime: number;
};

const UPDATE_INTERVAL_MS = 100;

export class User {
    private readonly _id: string;
    private _data: UserData;
    private _fromPos: { x: number, y: number } = { x: 0, y: 0 };
    private _toPos: { x: number, y: number } = { x: 0, y: 0 };
    private _tween: Tween;

    get id() {
        return this._id;
    }

    get position() {
        return this._data.position;
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

    constructor(id: string, position: Vector) {
        this._id = id;
        this._data = {
            elapsedTime: 0,
            cursor: new Container(),
            position: new Vector().copy(position),
        };

        this._fromPos.x = position.x;
        this._fromPos.y = position.y;
        this._toPos.x = position.x;
        this._toPos.y = position.y;

        this._tween = new Tween(this._fromPos);
    }

    public update(deltaMs: number) {
        this._tween.update();
        this._data.elapsedTime += deltaMs;

        if (this._data.elapsedTime >= UPDATE_INTERVAL_MS) {
            this._data.elapsedTime = 0;
            this._fromPos.x = this._data.cursor.position.x;
            this._fromPos.y = this._data.cursor.position.y;
            this._toPos.x = this.position.x;
            this._toPos.y = this.position.y;

            this._tween = new Tween(this._fromPos)
                .to(this._toPos, UPDATE_INTERVAL_MS)
                .interpolation(Interpolation.Linear)
                .onUpdate((position) => {
                    this._data.cursor.position.x = position.x;
                    this._data.cursor.position.y = position.y;
                })
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
