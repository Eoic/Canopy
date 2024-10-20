import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { CELL_LINE_WIDTH, CELL_SIZE, WORLD_HEIGHT, WORLD_WIDTH, CELL_FULL_SIZE, CELL_HALF_SIZE } from './constants';

export class Scene {
    private readonly _viewport: Viewport;
    private readonly _app: PIXI.Application<HTMLCanvasElement>;
    private readonly _graphics: PIXI.Graphics;

    private _background: PIXI.TilingSprite;
    private _marker: PIXI.Sprite;
    private _coords: PIXI.Text;

    constructor() {
        this._app = this.setupApp(document.body);
        this._viewport = this.setupViewport(this._app);
        this._graphics = new PIXI.Graphics();
        this._background = this.setupBackground();
        this._marker = this.setupMarker();
        this._coords = this.setupText();
        this._viewport.addChild(this._background);
        this._viewport.addChild(this._marker);
        this._app.stage.addChild(this._coords);
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

        viewport.moveCenter(0, 0);

        viewport.on('moved', (_event) => {
            this.updateBackground();
        });

        viewport.on('zoomed', (_event) => {
            this.updateBackground({ isReplaceNeeded: true });
        });

        return viewport;
    }

    private setupBackground(): PIXI.TilingSprite {
        this._graphics.clear();

        this._graphics.beginFill(0xf0ead2);
        this._graphics.lineStyle({ width: CELL_LINE_WIDTH, color: 0xadc178 });
        this._graphics.drawRect(0, 0, CELL_SIZE, CELL_SIZE);
        this._graphics.endFill();

        const texture = this._app.renderer.generateTexture(this._graphics);

        const sprite = new PIXI.TilingSprite(
            texture,
            this._viewport.worldScreenWidth,
            this._viewport.worldScreenHeight
        );

        sprite.tilePosition.x = -this._viewport.left + texture.width / 2;
        sprite.tilePosition.y = -this._viewport.top + texture.height / 2;
        sprite.x = this._viewport.left;
        sprite.y = this._viewport.top;

        return sprite;
    }

    private setupMarker(): PIXI.Sprite {
        const graphics = new PIXI.Graphics();

        graphics.beginFill(0xbfd8bd);
        graphics.drawRect(0, 0, CELL_SIZE - CELL_LINE_WIDTH, CELL_SIZE - CELL_LINE_WIDTH);
        graphics.endFill();

        const texture = this._app.renderer.generateTexture(graphics);
        const sprite = new PIXI.Sprite(texture);
        sprite.pivot.x = sprite.texture.width / 2;
        sprite.pivot.y = sprite.texture.height / 2;

        return sprite;
    }

    private setupText(): PIXI.Text {
        const text = new PIXI.Text('(0,0)', { fontSize: 52, fill: 0x2F2F2F, fontFamily: 'monospace', letterSpacing: -5 });
        text.position.set(20, 15);
        return text;
    }

    private updateBackground(options: { isReplaceNeeded?: boolean } = {}) {
        if (options.isReplaceNeeded) {
            const index = this._viewport.getChildIndex(this._background);
            this._viewport.removeChildAt(index);
            this._background = this.setupBackground();
            this._viewport.addChild(this._background);
            this._viewport.setChildIndex(this._background, 0);
        }

        this._background.tilePosition.x = -this._viewport.left + CELL_HALF_SIZE;
        this._background.tilePosition.y = -this._viewport.top + CELL_HALF_SIZE;
        this._background.x = this._viewport.left;
        this._background.y = this._viewport.top;
    }

    private setupEvents() {
        window.addEventListener('resize', this.handleWindowResize);
        window.addEventListener('mousedown', this.handleWindowMouseDown);
        this._app.renderer.view.addEventListener('pointerdown', this.handleAppPointerDown);
        this._app.renderer.view.addEventListener('pointermove', this.handleAppPointerMove);
        this._app.renderer.view.addEventListener('pointerup', this.handleAppPointerUp);
    }

    private handleAppPointerDown = (_event: PointerEvent) => {
        this._marker.tint = 0xFF0000;
    };

    private handleAppPointerMove = (_event: PointerEvent) => {
        const worldPosition = this._viewport.toWorld({ x: _event.clientX, y: _event.clientY });
        this._coords.text = `Cursor: (${Math.trunc(worldPosition.x)},${Math.trunc(worldPosition.y)})\n`;

        worldPosition.x = Math.floor((worldPosition.x + CELL_HALF_SIZE) / CELL_FULL_SIZE) * CELL_FULL_SIZE;
        worldPosition.y = Math.floor((worldPosition.y + CELL_HALF_SIZE) / CELL_FULL_SIZE) * CELL_FULL_SIZE;

        this._coords.text += `Cell:   (${worldPosition.x / CELL_FULL_SIZE},${worldPosition.y / CELL_FULL_SIZE})`;
        this._marker.position.set(worldPosition.x, worldPosition.y);
        this._marker.x = worldPosition.x;
        this._marker.y = worldPosition.y;
    };

    private handleAppPointerUp = (_event: PointerEvent) => {
        this._marker.tint = 0xFFFFFF;
    };

    private handleWindowResize = () => {
        this._app?.resize();
        this._viewport?.resize(window.innerWidth, window.innerHeight);
        this.updateBackground({ isReplaceNeeded: true });
    };

    private handleWindowMouseDown = (event: MouseEvent) => {
        if (event.button === 1) {
            event.preventDefault();
            return false;
        }

        return true;
    };
}
