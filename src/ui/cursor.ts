import * as PIXI from 'pixi.js';
import { PerfectCursor } from 'perfect-cursors';
import { getUserColor } from '../utils/user-utils';

export class Cursor extends PIXI.Container {
    private _cursor: PerfectCursor;
    private _graphics: PIXI.Graphics;
    private _userId: string;

    constructor(userId: string) {
        super();
        this._userId = userId;
        this._graphics = this._createCursorGraphics();
        this.addChild(this._graphics);

        this._cursor = new PerfectCursor((point: number[]) => {
            this.position.set(point[0], point[1]);
        });
    }

    private _createCursorGraphics(): PIXI.Graphics {
        const graphics = new PIXI.Graphics();
        const color = getUserColor(this._userId);

        graphics
            .moveTo(0, 0)
            .lineTo(0, 24)
            .lineTo(6, 18)
            .lineTo(12, 28)
            .lineTo(16, 26)
            .lineTo(10, 16)
            .lineTo(18, 16)
            .closePath()
            .fill(color)
            .stroke({ width: 2, color: 0xffffff });

        return graphics;
    }

    public addPoint(x: number, y: number): void {
        this._cursor.addPoint([x, y]);
    }

    public setVisible(visible: boolean): void {
        this.visible = visible;
    }

    public dispose(): void {
        this._cursor.dispose();
        this._graphics.destroy();
        this.destroy();
    }
}
