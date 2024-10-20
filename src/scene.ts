import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import {
    CELL_LINE_WIDTH,
    CELL_SIZE,
    WORLD_HEIGHT,
    WORLD_WIDTH,
    CELL_HALF_SIZE,
    ZOOM,
    CELL_COLOR
} from './constants';
import { Layers } from './layers';
import { SelectionManager } from './selection-manager';

type ViewportEvent = {
    type: string;
    viewport: Viewport;
};

export class Scene {
    private readonly _viewport: Viewport;
    private readonly _app: PIXI.Application<HTMLCanvasElement>;
    private readonly _graphics: PIXI.Graphics;

    private _background: PIXI.TilingSprite;
    private _selectionManager: SelectionManager;

    constructor() {
        this._app = this.setupApp(document.body);
        this._viewport = this.setupViewport(this._app);
        this._graphics = new PIXI.Graphics();
        this._background = this.setupBackground();
        this._viewport.addChild(this._background);
        this._selectionManager = new SelectionManager(this._app, this._viewport);
        this._selectionManager.enable();
        this.setupEvents();
    }

    private setupApp(container: HTMLElement): PIXI.Application<HTMLCanvasElement> {
        const app = new PIXI.Application<HTMLCanvasElement>({
            resizeTo: window,
            antialias: true,
            autoDensity: true,
            width: window.innerWidth,
            height: window.innerHeight,
            resolution: 2,
        });

        container.appendChild(app.view);

        return app;
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
        this._graphics.clear();
        this._graphics.beginFill(CELL_COLOR.FILL);
        this._graphics.lineStyle({ width: CELL_LINE_WIDTH, color: CELL_COLOR.BORDER });
        this._graphics.drawRect(0, 0, CELL_SIZE, CELL_SIZE);
        this._graphics.endFill();

        const texture = this._app.renderer.generateTexture(this._graphics);

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
        this._app.renderer.view.addEventListener('pointerdown', this.handleAppPointerDown);
        this._app.renderer.view.addEventListener('pointermove', this.handleAppPointerMove);
        this._app.renderer.view.addEventListener('pointerup', this.handleAppPointerUp);
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
