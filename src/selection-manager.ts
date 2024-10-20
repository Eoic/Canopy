import * as PIXI from 'pixi.js';
import { Layers } from './layers';
import { Vector } from './math/vector';
import { Viewport } from 'pixi-viewport';
import { CELL_SIZE, CELL_LINE_WIDTH, CELL_COLOR, CELL_FULL_SIZE, CELL_HALF_SIZE } from './constants';

export class SelectionManager {
    private _viewport: Viewport;
    private _app: PIXI.Application<HTMLCanvasElement>;
    private _hoverMarker: PIXI.Sprite;
    private _selectionMarker: PIXI.Sprite;
    private _currentCell: Vector = new Vector();
    private _selectedCell: Vector = new Vector();
    private readonly _events: Record<string, EventListenerOrEventListenerObject> = {};

    constructor(app: PIXI.Application<HTMLCanvasElement>, viewport: Viewport) {
        this._app = app;
        this._viewport = viewport;
        this._selectionMarker = this.setupMarker(CELL_COLOR.SELECTION_FILL, Layers.SelectionCell);
        this._hoverMarker = this.setupMarker(CELL_COLOR.HOVER_FILL, Layers.HoverCell);

        this._events = {
            'pointerdown': this.handleAppPointerDown as EventListener,
            'pointermove': this.handleAppPointerMove as EventListener,
            'pointerup': this.handleAppPointerUp as EventListener,
            'pointerout': this.handleAppPointerOut as EventListener,
        };
    }

    public enable() {
        this._viewport.addChild(this._selectionMarker);
        this._viewport.addChild(this._hoverMarker);
        this.addEvents();
    }

    public disable() {
        this._viewport.removeChild(this._selectionMarker);
        this._viewport.removeChild(this._hoverMarker);
        this.removeEvents();
    }

    private addEvents() {
        for (const [eventName, handler] of Object.entries(this._events))
            this._app.renderer.view.addEventListener(eventName, handler);
    }

    private removeEvents() {
        for (const [eventName, handler] of Object.entries(this._events))
            this._app.renderer.view.removeEventListener(eventName, handler);
    }

    private setupMarker(fillColor: number, layerZIndex: number): PIXI.Sprite {
        const graphics = new PIXI.Graphics();

        graphics.beginFill(fillColor);
        graphics.drawRect(0, 0, CELL_SIZE - CELL_LINE_WIDTH, CELL_SIZE - CELL_LINE_WIDTH);
        graphics.endFill();

        const texture = this._app.renderer.generateTexture(graphics);
        const marker = new PIXI.Sprite(texture);

        marker.pivot.x = marker.texture.width / 2;
        marker.pivot.y = marker.texture.height / 2;
        marker.zIndex = layerZIndex;
        marker.visible = false;

        return marker;
    }

    private handleAppPointerDown = (event: PointerEvent) => {
        if (event.button !== 0)
            return;

        if (this._currentCell) {
            if (this._currentCell.isEqual(this._selectedCell) && this._selectionMarker.visible) {
                this._selectionMarker.visible = false;
                return;
            }

            this._selectedCell.copy(this._currentCell);
            this._selectionMarker.visible = true;

            this._selectionMarker.position.set(
                this._selectedCell.x * CELL_FULL_SIZE,
                this._selectedCell.y * CELL_FULL_SIZE
            );
        }
    };

    private handleAppPointerMove = (event: PointerEvent) => {
        const worldPosition = this._viewport.toWorld({ x: event.clientX, y: event.clientY });
        worldPosition.x = Math.floor((worldPosition.x + CELL_HALF_SIZE) / CELL_FULL_SIZE) * CELL_FULL_SIZE;
        worldPosition.y = Math.floor((worldPosition.y + CELL_HALF_SIZE) / CELL_FULL_SIZE) * CELL_FULL_SIZE;

        this._currentCell.set(worldPosition.x / CELL_FULL_SIZE, worldPosition.y / CELL_FULL_SIZE);
        this._hoverMarker.position.set(worldPosition.x, worldPosition.y);
        this._hoverMarker.visible = true;
    };

    private handleAppPointerUp = (_event: PointerEvent) => { };

    private handleAppPointerOut = (_event: PointerEvent) => {
        this._hoverMarker.visible = false;
    };
}
