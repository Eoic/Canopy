import * as PIXI from 'pixi.js';
import { Layer } from './layers';
import { Vector } from './math/vector';
import { Viewport } from 'pixi-viewport';
import { CELL_SIZE, CELL_LINE_WIDTH, CELL_COLOR, CELL_FULL_SIZE, CELL_HALF_SIZE } from './constants';
import { PositionConverter } from './math/position-converter';
import { RadialMenu } from './ui/radial-menu';

export class SelectionManager {
    private _menuBuilder: RadialMenu;
    private _activeMenu: PIXI.Container | null = null;
    private _viewport: Viewport;
    private _app: PIXI.Application;
    private _hoverMarker: PIXI.Sprite;
    private _selectionMarker: PIXI.Sprite;
    private _currentCell: Vector = new Vector();
    private _selectedCell: Vector = new Vector();
    private _positionConverter: PositionConverter;
    private readonly _events: Record<string, EventListenerOrEventListenerObject> = {};

    constructor(app: PIXI.Application, viewport: Viewport) {
        this._app = app;
        this._viewport = viewport;
        this._selectionMarker = this.setupMarker(CELL_COLOR.SELECTION_FILL, Layer.SelectionCell);
        this._hoverMarker = this.setupMarker(CELL_COLOR.HOVER_FILL, Layer.HoverCell);
        this._positionConverter = new PositionConverter(this._viewport);
        this._menuBuilder = new RadialMenu();

        this._events = {
            'pointerup': this.handleAppPointerUp as EventListener,
            'pointermove': this.handleAppPointerMove as EventListener,
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
            this._app.renderer.canvas.addEventListener(eventName, handler);
    }

    private removeEvents() {
        for (const [eventName, handler] of Object.entries(this._events))
            this._app.renderer.canvas.removeEventListener(eventName, handler);
    }

    private setupMarker(fillColor: number, layerZIndex: number): PIXI.Sprite {
        const graphics = new PIXI.Graphics();

        graphics
            .rect(0, 0, CELL_SIZE - CELL_LINE_WIDTH, CELL_SIZE - CELL_LINE_WIDTH)
            .fill(fillColor);

        const texture = this._app.renderer.generateTexture(graphics);
        const marker = new PIXI.Sprite(texture);

        marker.pivot.x = marker.texture.width / 2;
        marker.pivot.y = marker.texture.height / 2;
        marker.zIndex = layerZIndex;
        marker.visible = false;

        return marker;
    }

    private handleAppPointerUp = (event: PointerEvent) => {
        if (event.button !== 0)
            return;

        console.log(event.target);

        if (this._currentCell) {
            if (this._currentCell.isEqual(this._selectedCell) && this._selectionMarker.visible) {
                this.hideMenu();
                return;
            }

            this._selectedCell.copy(this._currentCell);
            this.showMenu({ x: this._selectedCell.x * CELL_FULL_SIZE, y: this._selectedCell.y * CELL_FULL_SIZE });
        }
    };

    private handleAppPointerMove = (event: PointerEvent) => {
        const worldPosition = this._positionConverter.worldPosition(event);
        const cellPosition = this._positionConverter.worldToCell(worldPosition);
        this._currentCell.set(cellPosition.x, cellPosition.y);
        this._hoverMarker.position.set(worldPosition.x, worldPosition.y);
        this._hoverMarker.visible = true;
    };

    private handleAppPointerOut = (_event: PointerEvent) => {
        this._hoverMarker.visible = false;
    };

    private showMenu(position: { x: number, y: number }) {
        this._selectionMarker.visible = true;
        this._selectionMarker.position.set(position.x, position.y);

        if (this._activeMenu) {
            this._selectionMarker.removeChild(this._activeMenu);
            this._activeMenu.destroy();
            this._activeMenu = null;
        }

        this._activeMenu = this._menuBuilder.build();
        this._activeMenu.position.set(this._selectionMarker.width / 2, this._selectionMarker.height / 2);
        this._selectionMarker.addChild(this._activeMenu);
    }

    private hideMenu() {
        this._selectionMarker.visible = false;

        if (this._activeMenu) {
            this._selectionMarker.removeChild(this._activeMenu);
            this._activeMenu.destroy();
            this._activeMenu = null;
        }
    }
}
