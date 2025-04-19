import * as PIXI from 'pixi.js';
import { Scene } from './scene';
import { Layer } from './layers';
import { Vector } from '../math/vector';
import { throttle } from 'throttle-debounce';
import { RadialMenu } from '../ui/radial-menu';
import { OutMessageType } from '../network/types/message';
import { ConnectionManager } from '../network/connection-manager';
import { CELL_SIZE, CELL_LINE_WIDTH, CELL_COLOR, CELL_FULL_SIZE, POSITION_UPDATE_THROTTLE_MS } from '../constants';
import { PointData } from 'pixi.js';

export class SelectionManager {
    private _scene: Scene;
    private _activeMenu: RadialMenu | null = null;
    private _hoverMarker: PIXI.Container;
    private _selectionMarker: PIXI.Container;
    private _currentCell: Vector = new Vector();
    private _selectedCell: Vector = new Vector();
    private _focusedCell: Vector = new Vector();
    private _positionText: HTMLParagraphElement;
    private readonly _events: Record<string, EventListenerOrEventListenerObject> = {};

    constructor(scene: Scene) {
        this._scene = scene;
        this._selectionMarker = this._setupMarker(CELL_COLOR.SELECTION_FILL, Layer.SelectionCell);
        this._hoverMarker = this._setupMarker(CELL_COLOR.HOVER_FILL, Layer.HoverCell);
        this._sendPosition = throttle(POSITION_UPDATE_THROTTLE_MS, this._sendPosition);
        this._positionText = document.getElementById('position') as HTMLParagraphElement;

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
                this._selectionMarker.visible = false;
                this._activeMenu?.close();
                return;
            }

            this._selectedCell.copy(this._currentCell);
            this._showMenu({ x: this._selectedCell.x * CELL_FULL_SIZE, y: this._selectedCell.y * CELL_FULL_SIZE });
        }
    };

    private _handleAppPointerMove = (_event: PointerEvent) => {
        const localUser = this._scene.userService.getLocalUser();

        if (!localUser)
            return;

        const worldPosition = this._scene.rawWorldToSnappedWorld(localUser.position);
        const cellPosition = this._scene.rawWorldToCellIndex(worldPosition);
        this._currentCell.set(cellPosition.x, cellPosition.y);
        this._hoverMarker.position.set(worldPosition.x, worldPosition.y);
        this._hoverMarker.visible = true;
        this._sendPosition(localUser.position);
        this._positionText.innerText = `(X: ${cellPosition.x}, Y: ${cellPosition.y})`;
    };

    private _handleAppPointerOut = (_event: PointerEvent) => {
        this._hoverMarker.visible = false;
    };

    private _handleCloseMenu = (_event: object) => {
        if (this._activeMenu) {
            this._selectionMarker.removeChild(this._activeMenu);
            this._activeMenu.off('close', this._handleCloseMenu);
            this._activeMenu = null;
        }
    };

    private _showMenu(position: PointData) {
        this._activeMenu?.close();
        this._selectionMarker.visible = true;
        this._selectionMarker.position.set(position.x, position.y);

        this._activeMenu = new RadialMenu([
            {
                icon: 'circle-minus',
                onClick: () => {
                    this._selectionMarker.visible = false;
                    this._activeMenu?.close();
                },
            },
            { icon: 'circle-plus', onClick: () => { } },
            { icon: 'map-location-dot', onClick: () => { } },
            { icon: 'pen', onClick: () => { } },
            { icon: 'reply', onClick: () => { } },
            { icon: 'thumbtack-slash', onClick: () => { } },
            { icon: 'thumbtack', onClick: () => { } }
        ]);

        this._activeMenu.on('close', this._handleCloseMenu);
        this._activeMenu.position.set(this._selectionMarker.width / 2, this._selectionMarker.height / 2);
        this._selectionMarker.addChild(this._activeMenu);
    }

    private _sendPosition = (position: PointData) => {
        const localUser = this._scene.userService.getLocalUser();

        if (!localUser)
            return;

        ConnectionManager.instance.send({
            type: OutMessageType.PointerPosition,
            message: {
                id: localUser.id,
                position: { ...position },
                timestamp: Scene.pageStart + performance.now(),
            },
        });
    };
}
