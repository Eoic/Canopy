export class Vector {
    private _x: number = 0;
    private _y: number = 0;

    public get x() {
        return this._x;
    }

    public get y() {
        return this._y;
    }

    private set x(value: number) {
        this._x = value;
    }

    private set y(value: number) {
        this._y = value;
    }

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public set(x: number, y: number): Vector {
        this.x = x;
        this.y = y;

        return this;
    }

    public copy(other: Vector): Vector {
        this.x = other.x;
        this.y = other.y;

        return this;
    }

    public add(other: Vector): Vector {
        this.x += other.x;
        this.y += other.y;

        return this;
    }

    public subtract(other: Vector): Vector {
        this.x -= other.x;
        this.y -= other.y;

        return this;
    }

    public scale(value: number): Vector {
        this.x *= value;
        this.y *= value;

        return this;
    }

    public magnitude(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    public normalized(): Vector {
        const magnitude = this.magnitude();

        if (magnitude === 0)
            return this.clone();

        return new Vector(this.x / magnitude, this.y / magnitude);
    }

    public isEqual(other: Vector): boolean {
        return (this.x === other.x && this.y === other.y);
    }

    public clone() {
        return new Vector(this.x, this.y);
    }
}
