// https://github.com/markwylde/infigrid

import '../styles/main.scss';
import { Scene } from './scene';

const scene = new Scene();
scene.mount('root');


function draw() {
    let canvas = document.querySelector("canvas");
    let ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpi = 4;

    let cellSize = 10;
    let backgroundColor = "white";
    let lineColor = "silver";

    let pressed = false;

    let scaleStep = 0.1;
    let scale = 1;
    let lastScale = scale;
    let maxScale = 10;
    let minScale = 1;

    let zoomPoint = {
        x: 0,
        y: 0,
    };
    let lastZoomPoint = zoomPoint;

    let rx = 0,
        ry = 0;

    let wx = 0,
        wy = 0;

    let left = 0,
        right = 0,
        _top = 0,
        bottom = 0;

    resizeCanvas();
    addEventListeners();
    calculate();
    draw();

    function resizeCanvas() {
        canvas.height = height * dpi;
        canvas.width = width * dpi;
        canvas.style.height = height + "px";
        canvas.style.width = width + "px";
    }

    function addEventListeners() {
        canvas.addEventListener("mousedown", (e) => mousedown(e));
        canvas.addEventListener("mouseup", (e) => mouseup(e));
        canvas.addEventListener("mousemove", (e) => mousemove(e));
        canvas.addEventListener("wheel", (e) => wheel(e));
    }

    function calculate() {
        calculateDistancesToCellBorders();
        calculateDrawingPositions();
    }

    function calculateDistancesToCellBorders() {
        let dx = zoomPoint.x - lastZoomPoint.x + rx * lastScale;
        rx = dx - Math.floor(dx / (lastScale * cellSize)) * lastScale * cellSize;
        rx /= lastScale;

        let dy = zoomPoint.y - lastZoomPoint.y + ry * lastScale;
        ry = dy - Math.floor(dy / (lastScale * cellSize)) * lastScale * cellSize;
        ry /= lastScale;
    }

    function calculateDrawingPositions() {
        let scaledCellSize = cellSize * scale;

        left = zoomPoint.x - rx * scale;
        right = left + scaledCellSize;
        _top = zoomPoint.y - ry * scale;
        bottom = _top + scaledCellSize;
    }

    function draw() {
        ctx.save();
        ctx.scale(dpi, dpi);

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        ctx.lineWidth = 1;
        ctx.strokeStyle = lineColor;
        ctx.translate(-0.5, -0.5);

        ctx.beginPath();

        let scaledCellSize = cellSize * scale;

        for (let x = left; x > 0; x -= scaledCellSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }

        for (let x = right; x < width; x += scaledCellSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }

        for (let y = _top; y > 0; y -= scaledCellSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }

        for (let y = bottom; y < height; y += scaledCellSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }

        ctx.stroke();

        /* Only for understanding */
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.moveTo(zoomPoint.x, zoomPoint.y);
        ctx.lineTo(left, zoomPoint.y);
        ctx.moveTo(zoomPoint.x, zoomPoint.y);
        ctx.lineTo(zoomPoint.x, _top);
        ctx.stroke();

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(zoomPoint.x, zoomPoint.y, 2, 0, 2 * Math.PI);
        ctx.fill();


        // World origin.
        ctx.beginPath();
        ctx?.rect(-wx, -wy, cellSize * scale, cellSize * scale);
        ctx?.fill();

        /* -----------------------*/
        ctx.restore();
    }

    function update() {
        ctx.clearRect(0, 0, width * dpi, height * dpi);
        draw();
    }

    function move(dx, dy) {
        zoomPoint.x += dx;
        zoomPoint.y += dy;
        wx -= dx;
        wy -= dy;

        console.log(wx, wy);
    }

    function zoom(amt, point) {
        lastScale = scale;
        scale += amt * scaleStep;

        if (scale < minScale) {
            scale = minScale;
        }

        if (scale > maxScale) {
            scale = maxScale;
        }

        let worldDx = (point.x - wx);
        let worldDy = (point.y - wy);

        wx = point.x - worldDx;
        wy = point.y - worldDy;

        lastZoomPoint = zoomPoint;
        zoomPoint = point;
    }

    function wheel(e) {
        zoom(e.deltaY > 0 ? -5 : 5, {
            x: e.offsetX,
            y: e.offsetY
        });

        calculate();
        update();
    }

    function mousedown(e) {
        pressed = true;
    }

    function mouseup(e) {
        pressed = false;
    }

    function mousemove(e) {
        if (!pressed) {
            return;
        }

        move(e.movementX, e.movementY);
        // do not recalculate the distances again, this wil lead to wronrg drawing
        calculateDrawingPositions();
        update();
    }

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        resizeCanvas();
        calculateDrawingPositions();
        update();
    });
};

draw();