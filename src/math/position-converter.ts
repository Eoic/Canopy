import { Vector } from './vector';
import { Viewport } from 'pixi-viewport';
import { CELL_HALF_SIZE, CELL_FULL_SIZE } from '../constants';

export class VectorPool {
    private _pool: Vector[] = [];

    public get(x: number = 0, y: number = 0): Vector {
        if (this._pool.length > 0)
            return this._pool.pop()!.set(x, y);

        return new Vector(x, y);
    }

    public release(vector: Vector): void {
        this._pool.push(vector);
    }
}

export class PositionConverter {
    private _viewport: Viewport;
    private _vectorPool: VectorPool;

    constructor(viewport: Viewport) {
        this._viewport = viewport;
        this._vectorPool = new VectorPool();
    }

    public worldPosition(event: PointerEvent): Vector {
        const worldPosition = this._viewport.toWorld({ x: event.clientX, y: event.clientY });

        return this._vectorPool.get(
            Math.floor((worldPosition.x + CELL_HALF_SIZE) / CELL_FULL_SIZE) * CELL_FULL_SIZE,
            Math.floor((worldPosition.y + CELL_HALF_SIZE) / CELL_FULL_SIZE) * CELL_FULL_SIZE
        );
    }

    public worldToCell(worldPosition: Vector): Vector {
        return this._vectorPool.get(
            worldPosition.x / CELL_FULL_SIZE,
            worldPosition.y / CELL_FULL_SIZE
        );
    }

    public cellToWorld(cellPosition: Vector): Vector {
        return this._vectorPool.get(
            cellPosition.x * CELL_FULL_SIZE,
            cellPosition.y * CELL_FULL_SIZE
        );
    }
};
