import { Vector } from './vector';
import { Viewport } from 'pixi-viewport';
import { CELL_HALF_SIZE, CELL_FULL_SIZE } from '../constants';
import { FederatedPointerEvent } from 'pixi.js';

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

    public screenToRawWorld(event: FederatedPointerEvent): Vector {
        return this._viewport.toWorld({ x: event.clientX, y: event.clientY });
    }

    public screenToSnappedWorld(event: FederatedPointerEvent): { x: number, y: number } {
        const worldPosition = this._viewport.toWorld({ x: event.clientX, y: event.clientY });
        return this.rawWorldToSnappedWorld({ x: worldPosition.x, y: worldPosition.y });
    }

    public rawWorldToSnappedWorld(position: { x: number, y: number }): { x: number, y: number } {
        return {
            x: Math.floor((position.x + CELL_HALF_SIZE) / CELL_FULL_SIZE) * CELL_FULL_SIZE,
            y: Math.floor((position.y + CELL_HALF_SIZE) / CELL_FULL_SIZE) * CELL_FULL_SIZE,
        };
    }

    public rawWorldToCellIndex(position: { x: number, y: number }): { x: number, y: number } {
        const snappedPosition = this.rawWorldToSnappedWorld(position);
        return this.snappedWorldToCellIndex({ x: snappedPosition.x, y: snappedPosition.y });
    }

    public snappedWorldToCellIndex(worldPosition: { x: number, y: number }): { x: number, y: number } {
        return this._vectorPool.get(
            worldPosition.x / CELL_FULL_SIZE,
            worldPosition.y / CELL_FULL_SIZE
        );
    }

    public cellIndexToSnappedWorld(cellPosition: Vector): Vector {
        return this._vectorPool.get(
            cellPosition.x * CELL_FULL_SIZE,
            cellPosition.y * CELL_FULL_SIZE
        );
    }
};
