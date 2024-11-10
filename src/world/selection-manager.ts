import * as PIXI from 'pixi.js';
import { Layer } from './layers';
import { Vector } from '../math/vector';
import { RadialMenu } from '../ui/radial-menu';
import { CELL_SIZE, CELL_LINE_WIDTH, CELL_COLOR, CELL_FULL_SIZE, POSITION_UPDATE_THROTTLE_MS } from '../constants';
import { Scene } from './scene';
import { ConnectionManager } from '../network/connection-manager';
import { OutMessageType } from '../network/types';
import { throttle } from 'throttle-debounce';

export class SelectionManager {
    private _scene: Scene;
    private _activeMenu: PIXI.Container | null = null;
    private _hoverMarker: PIXI.Container;
    private _selectionMarker: PIXI.Container;
    private _currentCell: Vector = new Vector();
    private _selectedCell: Vector = new Vector();
    private _focusedCell: Vector = new Vector();
    private readonly _events: Record<string, EventListenerOrEventListenerObject> = {};

    constructor(scene: Scene) {
        this._scene = scene;
        this._selectionMarker = this._setupMarker(CELL_COLOR.SELECTION_FILL, Layer.SelectionCell);
        this._hoverMarker = this._setupMarker(CELL_COLOR.HOVER_FILL, Layer.HoverCell);
        this._sendPosition = throttle(POSITION_UPDATE_THROTTLE_MS, this._sendPosition);

        this._events = {
            'pointerdown': this._handleAppPointerDown as EventListener,
            'pointerup': this._handleAppPointerUp as EventListener,
            'pointermove': this._handleAppPointerMove as EventListener,
            'pointerout': this._handleAppPointerOut as EventListener,
        };
    }

    public enable() {
        this._scene.viewport.addChild(this._selectionMarker);
        this._scene.viewport.addChild(this._hoverMarker);
        this._addEvents();
    }

    public disable() {
        this._scene.viewport.removeChild(this._selectionMarker);
        this._scene.viewport.removeChild(this._hoverMarker);
        this._removeEvents();
    }

    private _addEvents() {
        for (const [eventName, handler] of Object.entries(this._events))
            this._scene.viewport.addEventListener(eventName, handler);
    }

    private _removeEvents() {
        for (const [eventName, handler] of Object.entries(this._events))
            this._scene.viewport.removeEventListener(eventName, handler);
    }

    private _setupMarker(fillColor: number, layerZIndex: number): PIXI.Container {
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

    private _handleAppPointerDown = (event: PointerEvent) => {
        if (event.button !== 0)
            return;

        this._focusedCell.copy(this._currentCell);
    };

    private _handleAppPointerUp = (event: PointerEvent) => {
        if (event.button !== 0)
            return;

        if (this._currentCell && this._currentCell.isEqual(this._focusedCell)) {
            if (this._currentCell.isEqual(this._selectedCell) && this._selectionMarker.visible) {
                this._hideMenu();
                return;
            }

            this._selectedCell.copy(this._currentCell);
            this._showMenu({ x: this._selectedCell.x * CELL_FULL_SIZE, y: this._selectedCell.y * CELL_FULL_SIZE });
        }
    };

    private _handleAppPointerMove = (_event: PointerEvent) => {
        if (!this._scene.users.currentUser)
            return;

        const worldPosition = this._scene.rawWorldToSnappedWorld(this._scene.users.currentUser.position);
        const cellPosition = this._scene.rawWorldToCellIndex(worldPosition);
        this._currentCell.set(cellPosition.x, cellPosition.y);
        this._hoverMarker.position.set(worldPosition.x, worldPosition.y);
        this._hoverMarker.visible = true;
        this._sendPosition(this._scene.users.currentUser.position);
    };

    private _handleAppPointerOut = (_event: PointerEvent) => {
        this._hoverMarker.visible = false;
    };

    private _showMenu(position: { x: number, y: number }) {
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

    private _hideMenu() {
        this._selectionMarker.visible = false;

        if (this._activeMenu) {
            this._selectionMarker.removeChild(this._activeMenu);
            this._activeMenu.destroy();
            this._activeMenu = null;
        }
    }

    private _sendPosition = (position: { x: number, y: number }) => {
        ConnectionManager.instance.send({
            type: OutMessageType.PointerPosition,
            message: {
                id: this._scene.users.currentUser!.id,
                position: { ...position },
            },
        });
    };
}

