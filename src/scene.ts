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
} from './constants';
import { Layers } from './layers';
import { SelectionManager } from './selection-manager';

type ViewportEvent = {
    type: string;
    viewport: Viewport;
};

export class Scene {
    private _app!: PIXI.Application;
    private _viewport!: Viewport;
    private _background!: PIXI.TilingSprite;
    private _selectionManager?: SelectionManager;

    constructor() {
        this.setupApp(document.body).then(async (app: PIXI.Application) => {
            this._app = app;
            this._viewport = this.setupViewport(this._app);
            this._background = this.setupBackground();
            this._viewport.addChild(this._background);
            this._selectionManager = new SelectionManager(this._app, this._viewport);
            this._selectionManager.enable();
            this.setupEvents();

            await this.loadAssets();
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
                resolution: 1,
            }).then(() => {
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

        const background = new PIXI.TilingSprite(
            texture,
            this._viewport.worldScreenWidth,
            this._viewport.worldScreenHeight
        );

        background.zIndex = Layers.Ground;

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
        this._app.renderer.canvas.addEventListener('pointerdown', this.handleAppPointerDown);
        this._app.renderer.canvas.addEventListener('pointermove', this.handleAppPointerMove);
        this._app.renderer.canvas.addEventListener('pointerup', this.handleAppPointerUp);
    }

    public async loadAssets() {
        await PIXI.Assets.init({ manifest: 'assets/manifest.json' });
        await PIXI.Assets.loadBundle(['treeOne']);

        const trees = PIXI.Assets.get<PIXI.Texture>(['treeOne/small', 'treeOne/medium', 'treeOne/large']);

        if (trees) {
            let i = 0;

            for (const texture of Object.values(trees)) {
                const sprite = new PIXI.Sprite(texture);
                sprite.position.set(i * CELL_FULL_SIZE, 0);
                sprite.anchor.x = 0.5;
                sprite.anchor.y = 0.5;
                sprite.zIndex = Layers.Trees;
                this._viewport.addChild(sprite);
                i++;
            }
        }
    }

    private handleAppPointerDown = (_event: PointerEvent) => { };

    private handleAppPointerMove = (_event: PointerEvent) => { };

    private handleAppPointerUp = (_event: PointerEvent) => { };

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
