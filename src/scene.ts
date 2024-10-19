import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { CELL_LINE_WIDTH, CELL_SIZE, WORLD_BACKGROUND_COLOR, WORLD_HEIGHT, WORLD_WIDTH } from './constants';

export class Scene {
    private readonly _viewport: Viewport;
    private readonly _app: PIXI.Application<HTMLCanvasElement>;
    private readonly _graphics: PIXI.Graphics;

    constructor() {
        this._app = this.setupApp(document.body);
        this._viewport = this.setupViewport(this._app);
        this._graphics = new PIXI.Graphics();
        this._viewport.addChild(this._graphics);
        this.setupEvents();
        this.drawGrid();
    }

    private setupApp(container: HTMLElement): PIXI.Application<HTMLCanvasElement> {
        const app = new PIXI.Application<HTMLCanvasElement>({
            resizeTo: window,
            antialias: true,
            autoDensity: true,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: WORLD_BACKGROUND_COLOR,
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
                minScale: 0.15,
                maxScale: 12.50,
            });

        viewport.fit();
        viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);


        viewport.on('zoomed', (e) => {
            this.drawGrid();
        });

        // viewport.on('moved', (e) => {
        //     this.drawGrid();
        // });

        return viewport;
    }

    private drawGrid() {
        const { top, right, bottom, left } = this._app.view.getBoundingClientRect();
        const tl = this._viewport.toWorld({ x: left, y: top });
        const br = this._viewport.toWorld({ x: right, y: bottom });

        // const rows = Math.ceil((right - left) / CELL_SIZE);
        // const cols = Math.ceil((bottom - top) / CELL_SIZE);

        const { x, y, width, height } = this._viewport.getBounds();
        const topLeft = { x, y };
        const bottomRight = { x: width - x, y: height - y };
        const rows = Math.trunc((width) / CELL_SIZE);
        const cols = Math.trunc((height) / CELL_SIZE);

        // console.log(topLeft, bottomRight);
        this._graphics.clear();
        this._graphics.lineStyle({ color: '#FF0000', width: CELL_LINE_WIDTH });

        this._graphics.drawCircle(tl.x, tl.y, CELL_SIZE);
        // for (let y = 0; y <= cols; y++) {
        //     this._graphics.moveTo(topLeft.x, topLeft.y + CELL_SIZE * y);
        //     this._graphics.lineTo(bottomRight.x, topLeft.y + CELL_SIZE * y);
        // }

        // for (let x = 0; x <= rows; x++) {
        //     this._graphics.moveTo(topLeft.x + CELL_SIZE * x, topLeft.y);
        //     this._graphics.lineTo(topLeft.x + CELL_SIZE * x, bottomRight.y);
        // }
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

    };

    private handleAppPointerUp = (_event: PointerEvent) => {

    };

    private handleWindowResize = () => {
        this._app?.resize();
        this._viewport?.resize(window.innerWidth, window.innerHeight);
    };

    private handleWindowMouseDown = (event: MouseEvent) => {
        if (event.button === 1) {
            event.preventDefault();
            return false;
        }

        return true;
    };
}
