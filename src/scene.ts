export class Scene {
    static CELL_SIZE = 30;

    private canvas: HTMLCanvasElement | null = null;
    private context: CanvasRenderingContext2D | null = null;
    private isDragging: boolean = false;
    private dragStart: { x: number, y: number } = { x: 0, y: 0, };
    private dragOffset: { x: number, y: number } = { x: 0, y: 0, };
    private offset: { x: number, y: number } = { x: 0, y: 0, };

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
    }

    public unmount() {
        if (this.canvas) {
            this.removeEvents();
            this.canvas = null;
        }
    }

    private render(offset: { x: number, y: number } = { x: 0, y: 0, }) {
        if (!this.canvas || !this.context)
            return;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.save();
        this.context.strokeStyle = 'lightgrey';
        this.context.beginPath();
        this.context.translate(this.canvas.width / 2 + offset.x, this.canvas.height / 2 + offset.y);

        const rows = Math.ceil(this.canvas.width / Scene.CELL_SIZE);
        const cols = Math.ceil(this.canvas.height / Scene.CELL_SIZE);

        for (let x = -1; x < rows; x++) {
            for (let y = -1; y < cols; y++) {
                this.context.moveTo(x * Scene.CELL_SIZE, y * Scene.CELL_SIZE);
                this.context.lineTo((x + 1) * Scene.CELL_SIZE, y * Scene.CELL_SIZE);
                this.context.lineTo((x + 1) * Scene.CELL_SIZE, (y + 1) * Scene.CELL_SIZE);
            }
        }

        this.context.stroke();
        this.context.restore();
    }

    private addEvents() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    private removeEvents() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
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

    private handleMouseDown = (event: MouseEvent) => {
        this.isDragging = true;
        this.dragStart = { x: event.clientX, y: event.clientY, };
    };

    private handleMouseMove = (event: MouseEvent) => {
        if (!this.isDragging)
            return;

        const delta = { x: event.clientX - this.dragStart.x, y: event.clientY - this.dragStart.y, };
        this.dragOffset = { x: this.offset.y + delta.x, y: this.offset.y + delta.y, };

        // console.log(nextPosition);
        this.render(this.dragOffset);
    };

    private handleMouseUp = (_event: MouseEvent) => {
        this.isDragging = false;
        this.offset = { x: this.dragOffset.x + this.offset.x, y: this.dragOffset.y + this.offset.y, };
    };
}
