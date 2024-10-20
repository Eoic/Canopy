import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { CELL_LINE_WIDTH, CELL_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from './constants';

export class Scene {
    private readonly _viewport: Viewport;
    private readonly _app: PIXI.Application<HTMLCanvasElement>;
    private readonly _graphics: PIXI.Graphics;

    private _background: PIXI.TilingSprite;
    private _marker: PIXI.TilingSprite;

    constructor() {
        this._app = this.setupApp(document.body);
        this._viewport = this.setupViewport(this._app);
        this._graphics = new PIXI.Graphics();
        this._background = this.setupBackground();
        this._marker = this.setupMarker();
        this._viewport.addChild(this._background);
        this._viewport.addChild(this._marker);
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
                minScale: 0.25,
                maxScale: 5,
            });

        viewport.fit();
        viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
        viewport.on('moved', (_event) => {
            this.updateBackground();
            this.updateMarker();
        });

        viewport.on('zoomed', (_event) => {
            this.updateBackground({ isReplaceNeeded: true });
            this.updateMarker({ isReplaceNeeded: true });
        });

        return viewport;
    }

    private setupBackground(): PIXI.TilingSprite {
        this._graphics.clear();

        this._graphics.lineStyle({ width: CELL_LINE_WIDTH, color: 0xadc178 });
        this._graphics.beginFill(0xf0ead2);
        this._graphics.drawRect(0, 0, CELL_SIZE, CELL_SIZE);
        this._graphics.endFill();

        const texture = this._app.renderer.generateTexture(this._graphics);

        const sprite = new PIXI.TilingSprite(
            texture,
            this._viewport.worldScreenWidth,
            this._viewport.worldScreenHeight
        );

        sprite.tilePosition.x = -this._viewport.left;
        sprite.tilePosition.y = -this._viewport.top;
        sprite.x = this._viewport.left;
        sprite.y = this._viewport.top;

        return sprite;
    }

    private setupMarker(): PIXI.TilingSprite {
        this._graphics.clear();

        this._graphics.lineStyle({ width: 0 });
        this._graphics.beginFill(0xbfd8bd);
        this._graphics.drawRect(0, 0, this._background.texture.width, this._background.texture.height);
        this._graphics.endFill();

        const texture = this._app.renderer.generateTexture(this._graphics);

        const sprite = new PIXI.TilingSprite(
            texture,
            CELL_SIZE - CELL_LINE_WIDTH + 6,
            CELL_SIZE - CELL_LINE_WIDTH + 6
        );

        return sprite;
    }

    private updateBackground(options: { isReplaceNeeded?: boolean } = {}) {
        if (options.isReplaceNeeded) {
            const index = this._viewport.getChildIndex(this._background);
            this._viewport.removeChildAt(index);
            this._background = this.setupBackground();
            this._viewport.addChild(this._background);
        }

        this._background.tilePosition.x = -this._viewport.left;
        this._background.tilePosition.y = -this._viewport.top;
        this._background.x = this._viewport.left;
        this._background.y = this._viewport.top;
    }

    private updateMarker(options: { isReplaceNeeded?: boolean } = {}) {
        if (options.isReplaceNeeded) {
            const index = this._viewport.getChildIndex(this._marker);
            this._viewport.removeChildAt(index);
            this._marker = this.setupMarker();
            this._viewport.addChild(this._marker);
        }
    }

    private setupEvents() {
        window.addEventListener('resize', this.handleWindowResize);
        window.addEventListener('mousedown', this.handleWindowMouseDown);
        this._app.renderer.view.addEventListener('pointerdown', this.handleAppPointerDown);
        this._app.renderer.view.addEventListener('pointermove', this.handleAppPointerMove);
        this._app.renderer.view.addEventListener('pointerup', this.handleAppPointerUp);
    }

    private handleAppPointerDown = (_event: PointerEvent) => {

    };

    private handleAppPointerMove = (_event: PointerEvent) => {
        const worldPosition = this._viewport.toWorld({ x: _event.clientX, y: _event.clientY });

        const cellSize = this._marker.texture.width;
        const snappedX = Math.round(worldPosition.x / cellSize) * cellSize;
        const snappedY = Math.round(worldPosition.y / cellSize) * cellSize;

        worldPosition.x = snappedX;
        worldPosition.y = snappedY;

        this._marker.position.set(worldPosition.x, worldPosition.y);
        this._marker.tilePosition.x = -worldPosition.x;
        this._marker.tilePosition.y = -worldPosition.y;
        this._marker.x = worldPosition.x;
        this._marker.y = worldPosition.y;
    };

    private handleAppPointerUp = (_event: PointerEvent) => {

    };

    private handleWindowResize = () => {
        this._app?.resize();
        this._viewport?.resize(window.innerWidth, window.innerHeight);
        this.updateBackground({ isReplaceNeeded: true });
        this.updateMarker({ isReplaceNeeded: true });
    };

    private handleWindowMouseDown = (event: MouseEvent) => {
        if (event.button === 1) {
            event.preventDefault();
            return false;
        }

        return true;
    };
}
