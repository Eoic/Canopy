import { Container } from 'pixi.js';
import { Room } from 'colyseus.js';
import { ColyseusClient } from '../network/colyseus-client';
import { Cell, GameState } from '../network/types/schema';
import { Scene } from './scene';
import { CELL_COLOR } from '../constants';
import { Vector } from '../math/vector';
import { Layer } from './layers';

export class CellLockHandler {
    private _scene: Scene;
    private _room: Room<GameState> | null = null;
    private _lockMarkers: Map<string, Container>;

    constructor(scene: Scene) {
        this._scene = scene;
        this._room = ColyseusClient.instance.room;
        this._lockMarkers = new Map();
    }

    public enable() {
        if (!this._room)
            throw new Error('GameRoom is not initialized.');

        const state = this._room.state;
        state.cells.onAdd(this._handleLockAdd);
        state.cells.onRemove(this._handleLockRemove);
    }

    public disable() {
        throw new Error('Not implemented.');
    }

    private _handleLockAdd = (cell: Cell, sessionId: string) => {
        cell.onChange(this._handleCellChange(cell, sessionId));
    };

    private _handleCellChange = (cell: Cell, sessionId: string) => () => {
        const localUser = this._scene.userService.getLocalUser();

        if (localUser?.id == sessionId)
            return;

        const marker = this._acquireLockMarker(sessionId);
        marker.visible = true;
        const position = this._scene.cellIndexToSnappedWorld(new Vector(cell.x, cell.y));
        marker.position.set(position.x, position.y);
    };

    private _handleLockRemove = (_cell: Cell, sessionId: string) => {
        this._removeLockMarker(sessionId);
    };

    private _acquireLockMarker(sessionId: string): Container {
        if (this._lockMarkers.has(sessionId))
            return this._lockMarkers.get(sessionId)!;

        const marker = this._scene.createCellMarker(CELL_COLOR.LOCK_FILL, Layer.LockedCell, 0.7);
        this._scene.viewport.addChild(marker);
        this._lockMarkers.set(sessionId, marker);

        return marker;
    }

    private _removeLockMarker(sessionId: string): boolean {
        const marker = this._lockMarkers.get(sessionId);

        if (!marker)
            return false;

        this._scene.viewport.removeChild(marker);
        this._lockMarkers.delete(sessionId);

        return true;
    }
};
