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

export class User {
    private readonly _id: string;
    private _cursor?: Container;

    get id() {
        return this._id;
    }

    // TODO:
    // * Add outline / border.
    get cursor() {
        this._cursor = new Container();
        const cursorSprite = new Sprite(Texture.WHITE);
        const cursorMask = new Graphics().svg(cursor);

        cursorSprite.mask = cursorMask;
        cursorSprite.position.set(0, 0);
        cursorSprite.tint = 0x231651;
        cursorSprite.width = cursorMask.width;
        cursorSprite.height = cursorMask.height;

        this._cursor.addChild(cursorMask);
        this._cursor.addChild(cursorSprite);
        this._cursor.zIndex = Layer.Cursor;
        this._cursor.scale.set(0.075, 0.075);

        return this._cursor;
    }

    constructor(id: string) {
        this._id = id;
    }
};
