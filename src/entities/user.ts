import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { Vector } from '../math/vector';
import { Layer } from '../world/layers';

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
};

export class User {
    private readonly _id: string;
    private _data: UserData;
    // private _data.cursor?: Container;
    // private _position: Vector;

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
        this._data.cursor.scale.set(0.075, 0.075);

        return this._data.cursor;
    }

    constructor(id: string, position: Vector) {
        this._id = id;
        this._data = {
            position: new Vector().copy(position),
            cursor: new Container(),
        };
    }

    public update(data: Partial<UserData>): string[] {
        const updatedKeys: string[] = [];

        for (const [key, value] of Object.entries(data)) {
            this._data[key] = value;
            updatedKeys.push(key);
        }

        return updatedKeys;
    }
};
