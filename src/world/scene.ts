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
import { ActionsHandler } from './actions-handler';
import { Users } from '../repository/users';
import { PositionConverter } from '../math/position-converter';
import { Vector } from '../math/vector';
import { UI } from '../ui/ui';

type ViewportEvent = {
    type: string;
    viewport: Viewport;
};

export class Scene {
    private _app!: PIXI.Application;
    private _viewport!: Viewport;
    private _background!: PIXI.TilingSprite;
    private _selectionManager!: SelectionManager;
    private _actionsHandler!: ActionsHandler;
    private _positionConverter!: PositionConverter;
    private _users!: Users;
    private _ui!: UI;

    get app() {
        return this._app;
    }

    get viewport() {
        return this._viewport;
    }

    get users() {
        return this._users;
    }

    constructor(onReady: VoidFunction) {
        this.setupApp(document.body).then(async (app: PIXI.Application) => {
            this._app = app;
            this._viewport = this.setupViewport(this._app);
            this._background = this.setupBackground();
            this._viewport.addChild(this._background);
            this._users = new Users();
            this._ui = new UI(this);
            this._selectionManager = new SelectionManager(this);
            this._actionsHandler = new ActionsHandler(this._users, this._viewport);
            this._positionConverter = new PositionConverter(this._viewport);
            this.setupEvents();
            this._selectionManager.enable();
            this._actionsHandler.enable();
            this._ui.enable();

            await this.loadAssets();

            this._users.onAdd((entity) => {
                if (this._users.isCurrentUser(entity.id))
                    return;

                this.viewport.addChild(entity.cursor);
            });

            this._users.onRemove((entity) => {
                if (this._users.isCurrentUser(entity.id))
                    return;

                this.viewport.removeChild(entity.cursor);
            });

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

    private setupEvents() {
        window.addEventListener('resize', this.handleWindowResize);
        window.addEventListener('mousedown', this.handleWindowMouseDown);
        this._app.ticker.autoStart = false;
        this._app.ticker.add(this.handleUpdate);
        this._viewport.addEventListener('pointermove', this.handleAppPointerMove);
    }

    public async loadAssets() {
        await PIXI.Assets.init({ manifest: 'assets/manifest.json' });
        await PIXI.Assets.loadBundle(['tree-one', 'icons']);

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

    public moveToCell(cellPosition: { x: number, y: number }) {
        this._viewport.moveCenter(cellPosition.x * CELL_FULL_SIZE, cellPosition.y * CELL_HALF_SIZE);
        this.updateBackground(this._background);
    }

    public zoomIn() {
        this._viewport.zoom(-100, true);
        this.updateBackground(this._background, { isReplaceNeeded: true });
    }

    public zoomOut() {
        this._viewport.zoom(100, true);
        this.updateBackground(this._background, { isReplaceNeeded: true });
    }

    private handleAppPointerMove = (event: PIXI.FederatedPointerEvent) => {
        if (!this._users.currentUser)
            return;

        const position = this._positionConverter.screenToRawWorld(event);
        this._users.currentUser.position = { x: position.x, y: position.y };
    };

    private handleUpdate = (ticker: PIXI.Ticker) => {
        for (const user of this._users.entities.values())
            user.update(ticker.deltaMS);
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
        this.updateBackground(this._background);
    };

    private handleViewportZoomed = (_event: ViewportEvent) => {
        this.updateBackground(this._background, { isReplaceNeeded: true });
    };
}
