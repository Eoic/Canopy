import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import {
    CELL_LINE_WIDTH,
    CELL_SIZE,
    WORLD_HEIGHT,
    WORLD_WIDTH,
    CELL_HALF_SIZE,
    ZOOM,
    CELL_COLOR,
    CELL_FULL_SIZE
} from '../constants';
import { Layer } from './layers';
import { SelectionManager } from './selection-manager';
import { CursorManager } from './cursor-manager';
import { PositionConverter } from '../math/position-converter';
import { Vector } from '../math/vector';
import { UI } from '../ui/ui';
import { UserService } from '../service/user-service';
import { UserRegistry } from '../registry/user-registry';
import { UserRepository } from '../repository/user-repository';
import { ColyseusClient } from '../network/colyseus-client';

type ViewportEvent = {
    type: string;
    viewport: Viewport;
};

export class Scene {
    private _ui!: UI;
    private _viewport!: Viewport;
    private _app!: PIXI.Application;
    private _background!: PIXI.TilingSprite;
    private _selectionManager!: SelectionManager;
    private _cursorManager!: CursorManager;
    private _positionConverter!: PositionConverter;
    private _userService!: UserService;
    private _isMoved!: boolean;
    private _touches!: Array<number>;

    get app() {
        return this._app;
    }

    get viewport() {
        return this._viewport;
    }

    get userService() {
        return this._userService;
    }

    get isMoved() {
        return this._isMoved;
    }

    constructor(onReady: VoidFunction) {
        const userRegistry = new UserRegistry();
        const userRepository = new UserRepository(userRegistry);
        this._userService = new UserService(userRepository, userRegistry);

        this.setupApp(document.body).then(async (app: PIXI.Application) => {
            this._app = app;
            this._isMoved = false;
            this._viewport = this.setupViewport(this._app);
            this._background = this.setupBackground();
            this._viewport.addChild(this._background);
            this._ui = new UI(this);
            this._touches = [];
            this._selectionManager = new SelectionManager(this);
            this._cursorManager = new CursorManager(this._viewport);
            this._positionConverter = new PositionConverter(this._viewport);
            this._ui.enable();
            this._setupEvents();

            ColyseusClient.instance.on('onJoin', (room) => {
                this._userService.addUser({ id: room.sessionId, isLocal: true });
                this._selectionManager.enable();
                this._cursorManager.enable();
                console.info('Connected with sessionId:', room.sessionId);
            });

            ColyseusClient.instance.on('onLeave', () => {
                const localUser = this._userService.getLocalUser();

                if (localUser)
                    this._userService.removeUser(localUser.id);

                this._selectionManager.disable();
                this._cursorManager.disable();
                console.info('Disconnected from server');
            });

            ColyseusClient.instance.on('onError', (code, message) => {
                console.error('Connection error:', code, message);
            });

            if (ColyseusClient.instance.isConnected) {
                const room = ColyseusClient.instance.room!;
                this._userService.addUser({ id: room.sessionId, isLocal: true });
                this._selectionManager.enable();
                this._cursorManager.enable();
                console.info('Connected with sessionId:', room.sessionId);
            }

            await this.loadAssets();
            this._app.ticker.start();
            onReady();
        }).catch((error) => {
            console.error(error);
        });
    }

    private setupApp(container: HTMLElement): Promise<PIXI.Application> {
        return new Promise((resolve, reject) => {
            const app = new PIXI.Application();

            app.init({
                antialias: true,
                resizeTo: window,
                autoDensity: true,
                width: window.innerWidth,
                height: window.innerHeight,
                resolution: 2,
            }).then(() => {
                app.ticker.maxFPS = 60;
                container.appendChild(app.canvas);
                resolve(app);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }

    private setupViewport(app: PIXI.Application): Viewport {
        const viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: WORLD_WIDTH,
            worldHeight: WORLD_HEIGHT,
            events: app.renderer.events,
            disableOnContextMenu: true,
        });

        app.stage.addChild(viewport);

        viewport
            .drag({ mouseButtons: 'middle-right' })
            .pinch()
            .wheel()
            .clampZoom({
                minScale: ZOOM.MIN,
                maxScale: ZOOM.MAX,
            });

        viewport.sortableChildren = true;
        viewport.moveCenter(0, 0);
        viewport.on('moved', this.handleViewportMoved);
        viewport.on('zoomed', this.handleViewportZoomed);
        viewport.on('mouseup', this.handleViewportMouseUp);
        viewport.on('touchstart', (event: PIXI.FederatedPointerEvent) => this._touches.push(event.pointerId));
        viewport.on('touchend', this.handleViewportTouchEnd);

        return viewport;
    }

    private setupBackground(): PIXI.TilingSprite {
        return this.updateBackground(this.createBackground());
    }

    private createBackground() {
        const graphics = new PIXI.Graphics();

        graphics
            .rect(0, 0, CELL_SIZE, CELL_SIZE)
            .fill(CELL_COLOR.FILL)
            .stroke({ width: CELL_LINE_WIDTH, color: CELL_COLOR.BORDER });

        const texture = this._app.renderer.generateTexture(graphics);

        const background = new PIXI.TilingSprite({
            texture,
            width: this._viewport.worldScreenWidth,
            height: this._viewport.worldScreenHeight,
        });

        background.zIndex = Layer.Ground;

        return this.updateBackground(background);
    }

    private replaceBackground(background: PIXI.TilingSprite) {
        this.removeBackground(background);
        this._background = this.createBackground();
        this._viewport.addChild(this._background);

        return this._background;
    }

    private updateBackground(background: PIXI.TilingSprite, options: { isReplaceNeeded?: boolean } = {}) {
        if (options.isReplaceNeeded)
            this.replaceBackground(background);

        background.tilePosition.x = -this._viewport.left + CELL_HALF_SIZE;
        background.tilePosition.y = -this._viewport.top + CELL_HALF_SIZE;
        background.x = this._viewport.left;
        background.y = this._viewport.top;

        return background;
    }

    private removeBackground(background: PIXI.TilingSprite) {
        const index = this._viewport.getChildIndex(background);

        if (index !== -1)
            this._viewport.removeChildAt(index);
    }

    private _setupEvents() {
        window.addEventListener('resize', this.handleWindowResize);
        window.addEventListener('mousedown', this.handleWindowMouseDown);
        this._app.ticker.add(this.handleUpdate);
    }

    public async loadAssets() {
        await PIXI.Assets.init({ manifest: 'assets/manifest.json' });
        await PIXI.Assets.loadBundle(['tree-one', 'icons']);
        PIXI.Assets.setPreferences({ parseAsGraphicsContext: true });
        await PIXI.Assets.loadBundle(['misc']);

        const trees = PIXI.Assets.get<PIXI.Texture>(['tree-small-one', 'tree-medium-one', 'tree-large-one']);

        if (trees) {
            let i = 0;

            for (const texture of Object.values(trees)) {
                const sprite = new PIXI.Sprite(texture);
                sprite.position.set(i * CELL_FULL_SIZE, 0);
                sprite.anchor.x = 0.5;
                sprite.anchor.y = 0.5;
                sprite.zIndex = Layer.Trees;
                sprite.hitArea = new PIXI.Polygon();
                this._viewport.addChild(sprite);
                i++;
            }
        }
    }

    public rawWorldToSnappedWorld(position: { x: number, y: number }): { x: number, y: number } {
        return this._positionConverter.rawWorldToSnappedWorld(position);
    }

    public rawWorldToCellIndex(position: { x: number, y: number }): { x: number, y: number } {
        return this._positionConverter.rawWorldToCellIndex(position);
    }

    public cellIndexToSnappedWorld(position: Vector): Vector {
        return this._positionConverter.cellIndexToSnappedWorld(position);
    }

    public screenToRawWorld(event: PIXI.FederatedPointerEvent): { x: number, y: number } {
        return this._positionConverter.screenToRawWorld(event);
    }

    public screenToCellIndex(event: PIXI.FederatedPointerEvent): { x: number, y: number } {
        const position = this.screenToRawWorld(event as unknown as PIXI.FederatedPointerEvent);
        const worldPosition = this.rawWorldToSnappedWorld(position);
        return this.rawWorldToCellIndex(worldPosition);
    }

    public moveToCell(cellPosition: { x: number, y: number }) {
        this._viewport.setZoom(1, true);
        this._viewport.moveCenter(cellPosition.x * CELL_FULL_SIZE, cellPosition.y * CELL_HALF_SIZE);
        this.updateBackground(this._background, { isReplaceNeeded: true });
    }

    public zoomIn() {
        this._viewport.zoom(-100, true);
        this.updateBackground(this._background, { isReplaceNeeded: true });
    }

    public zoomOut() {
        this._viewport.zoom(100, true);
        this.updateBackground(this._background, { isReplaceNeeded: true });
    }

    private handleUpdate = (_ticker: PIXI.Ticker) => {
        // NOTE: Update the viewport and background on each tick.
    };

    private handleWindowResize = () => {
        this._app?.resize();
        this._viewport?.resize(window.innerWidth, window.innerHeight);
        this.updateBackground(this._background, { isReplaceNeeded: true });
    };

    private handleWindowMouseDown = (event: MouseEvent) => {
        if (event.button === 1) {
            event.preventDefault();
            return false;
        }

        return true;
    };

    private handleViewportMoved = (_event: ViewportEvent) => {
        this._isMoved = true;
        this.updateBackground(this._background);
    };

    private handleViewportZoomed = (_event: ViewportEvent) => {
        this.updateBackground(this._background, { isReplaceNeeded: true });
    };

    private handleViewportMouseUp = (_event: PIXI.FederatedMouseEvent) => {
        this._clearMovedState();
    };

    private handleViewportTouchEnd = (_event: PIXI.FederatedPointerEvent) => {
        this._touches = this._touches.filter((id) => _event.pointerId != id);
        this._clearMovedState();
    };

    /**
     * On multi-touch event, do not rest the `isMoved` flag to false until
     * all fingers are released from the screen. This prevents `SelectionManager`
     * handlers from firing prematurely on mobile devices.
     */
    private _clearMovedState() {
        if (this._isMoved && this._touches.length === 0) 
            this._isMoved = false;
    }
}
