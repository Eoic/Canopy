import * as PIXI from 'pixi.js';
import { Layer } from './layers';
import { Vector } from '../math/vector';
import { Viewport } from 'pixi-viewport';
import { RadialMenu } from '../ui/radial-menu';
import { PositionConverter } from '../math/position-converter';
import { CELL_SIZE, CELL_LINE_WIDTH, CELL_COLOR, CELL_FULL_SIZE } from '../constants';
import { Scene } from './scene';

export class SelectionManager {
    private _scene: Scene;
    private _activeMenu: PIXI.Container | null = null;
    private _hoverMarker: PIXI.Container;
    private _selectionMarker: PIXI.Container;
    private _currentCell: Vector = new Vector();
    private _selectedCell: Vector = new Vector();
    private _focusedCell: Vector = new Vector();
    // private _positionConverter: PositionConverter;
    private readonly _events: Record<string, EventListenerOrEventListenerObject> = {};

    constructor(scene: Scene) {
        this._scene = scene;
        this._selectionMarker = this.setupMarker(CELL_COLOR.SELECTION_FILL, Layer.SelectionCell);
        this._hoverMarker = this.setupMarker(CELL_COLOR.HOVER_FILL, Layer.HoverCell);
        // this._positionConverter = new PositionConverter(this._scene.viewport);

        this._events = {
            'pointerdown': this.handleAppPointerDown as EventListener,
            'pointerup': this.handleAppPointerUp as EventListener,
            'pointermove': this.handleAppPointerMove as EventListener,
            'pointerout': this.handleAppPointerOut as EventListener,
        };
    }

    public enable() {
        this._scene.viewport.addChild(this._selectionMarker);
        this._scene.viewport.addChild(this._hoverMarker);
        this.addEvents();
    }

    public disable() {
        this._scene.viewport.removeChild(this._selectionMarker);
        this._scene.viewport.removeChild(this._hoverMarker);
        this.removeEvents();
    }

    private addEvents() {
        for (const [eventName, handler] of Object.entries(this._events))
            this._scene.viewport.addEventListener(eventName, handler);
    }

    private removeEvents() {
        for (const [eventName, handler] of Object.entries(this._events))
            this._scene.viewport.removeEventListener(eventName, handler);
    }

    private setupMarker(fillColor: number, layerZIndex: number): PIXI.Container {
        const graphics = new PIXI.Graphics();
        const container = new PIXI.Container();

        graphics
            .rect(0, 0, CELL_SIZE - CELL_LINE_WIDTH, CELL_SIZE - CELL_LINE_WIDTH)
            .fill(fillColor);

        const texture = this._scene.app.renderer.generateTexture(graphics);
        const marker = new PIXI.Sprite(texture);

        container.pivot.x = marker.texture.width / 2;
        container.pivot.y = marker.texture.height / 2;
        container.visible = false;
        container.zIndex = layerZIndex;
        container.position.set(0, 0);
        container.addChild(marker);

        return container;
    }

    private handleAppPointerDown = (event: PointerEvent) => {
        if (event.button !== 0)
            return;

        this._focusedCell.copy(this._currentCell);
    };

    private handleAppPointerUp = (event: PointerEvent) => {
        if (event.button !== 0)
            return;

        if (this._currentCell && this._currentCell.isEqual(this._focusedCell)) {
            if (this._currentCell.isEqual(this._selectedCell) && this._selectionMarker.visible) {
                this.hideMenu();
                return;
            }

            this._selectedCell.copy(this._currentCell);
            this.showMenu({ x: this._selectedCell.x * CELL_FULL_SIZE, y: this._selectedCell.y * CELL_FULL_SIZE });
        }
    };

    private handleAppPointerMove = (_event: PointerEvent) => {
        if (!this._scene.users.currentUser)
            return;

        const worldPosition = this._scene.users.currentUser.position;
        const cellPosition = this._scene.worldToCell(worldPosition);
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

        this._activeMenu = new RadialMenu([
            {
                icon: 'circle-minus',
                onClick: () => {
                    console.log('Deleting...');
                    // this.hideMenu();
                },
            },
            { icon: 'circle-plus', onClick: () => { } },
            { icon: 'map-location-dot', onClick: () => { } },
            { icon: 'pen', onClick: () => { } },
            { icon: 'reply', onClick: () => { } },
            { icon: 'thumbtack-slash', onClick: () => { } },
            { icon: 'thumbtack', onClick: () => { } }
        ]);

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
