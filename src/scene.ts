export class Scene {
    private canvas: HTMLCanvasElement | null = null;
    private context: CanvasRenderingContext2D | null = null;

    public mount(canvasId: string) {
        const canvas = document.getElementById(canvasId);

        if (!canvas)
            throw new Error(`Canvas element with id "${canvasId} cannot be found."`);

        this.canvas = canvas as HTMLCanvasElement;

        if (this.canvas.getContext)
            this.context = this.canvas.getContext('2d', { alpha: false, });
        else throw Error('This browser does not support the canvas.');

        this.addEvents();
        this.resize(window.innerWidth, window.innerHeight);
        this.render();
    }

    public unmount() {
        if (this.canvas) {
            this.removeEvents();
            this.canvas = null;
        }
    }

    private render() {
    }

    private addEvents() {
        window.addEventListener('resize', this.handleResize);
    }

    private removeEvents() {
        window.removeEventListener('resize', this.handleResize);
    }

    private resize(width: number, height: number) {
        if (!this.canvas || !this.context)
            return;

        this.canvas.width = width;
        this.canvas.height = height;
        this.render();
    }

    private handleResize = (_event: Event) => {
        this.resize(window.innerWidth, window.innerHeight);
    };
}
