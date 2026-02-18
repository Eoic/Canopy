import { Viewport } from 'pixi-viewport';
import { Room } from 'colyseus.js';
import { Cursor } from '../ui/cursor';
import { ColyseusClient } from '../network/colyseus-client';
import { Layer } from './layers';
import { GameState, Player } from '../network/types/schema';

export class CursorManager {
    private _viewport: Viewport;
    private _cursors: Map<string, Cursor> = new Map();
    private _room: Room<GameState> | null = null;
    private _enabled: boolean = false;

    constructor(viewport: Viewport) {
        this._viewport = viewport;
    }

    public enable(): void {
        if (this._enabled) return;

        this._enabled = true;
        this._room = ColyseusClient.instance.room;

        if (!this._room) {
            console.warn('[CursorManager] No room available');
            return;
        }

        const state = this._room.state;
        const localSessionId = ColyseusClient.instance.sessionId;

        state.players.onAdd((player: Player, sessionId: string) => {
            if (sessionId === localSessionId) return;

            const cursor = new Cursor(sessionId);
            cursor.zIndex = Layer.Cursor;
            cursor.position.set(player.x, player.y);
            cursor.setVisible(player.visible);
            this._cursors.set(sessionId, cursor);
            this._viewport.addChild(cursor);

            player.onChange(() => {
                cursor.addPoint(player.x, player.y);
                cursor.setVisible(player.visible);
            });
        });

        state.players.onRemove((_player: Player, sessionId: string) => {
            const cursor = this._cursors.get(sessionId);

            if (cursor) {
                cursor.dispose();
                this._viewport.removeChild(cursor);
                this._cursors.delete(sessionId);
            }
        });

        state.players.forEach((player: Player, sessionId: string) => {
            if (sessionId === localSessionId) return;
            if (this._cursors.has(sessionId)) return;

            const cursor = new Cursor(sessionId);
            cursor.zIndex = Layer.Cursor;
            cursor.position.set(player.x, player.y);
            cursor.setVisible(player.visible);
            this._cursors.set(sessionId, cursor);
            this._viewport.addChild(cursor);

            player.onChange(() => {
                cursor.addPoint(player.x, player.y);
                cursor.setVisible(player.visible);
            });
        });
    }

    public disable(): void {
        if (!this._enabled) return;

        this._enabled = false;

        for (const [sessionId, cursor] of this._cursors) {
            cursor.dispose();
            this._viewport.removeChild(cursor);
            this._cursors.delete(sessionId);
        }

        this._room = null;
    }
}
