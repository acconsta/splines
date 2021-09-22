import assert from "assert";
import { Matrix, solve } from "ml-matrix";

class Point {
    x: number = 0;
    y: number = 0;

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}


class Splines {
    knots: number[]
    order: number
    controls: number[] = []
    points: Point[] = []

    constructor(knots: number[], order: number) {
        assert(knots.length > 1)
        // TODO: pad knots
        console.log("knots", knots)
        console.log("order", order)
        this.knots = knots
        this.order = order
    }

    findInterval(x: number): number {
        for (let i = 0; i < this.knots.length; i++) {
            if (x < this.knots[i]) {
                return i - 1;
            }
        }
        assert(false);
    }

    eval(x: number, controls: number[]) {
        let k = this.findInterval(x);
        return this.deBoor(k, x, controls)
    }

    setPoints(points: Point[]) {
        this.points = points
    }

    fit() {
        let xarr: number[][] = [];
        let yarr: number[] = [];
        for (let point of this.points) {
            let controls = new Array(this.numBasis()).fill(0);
            xarr.push([])
            yarr.push(point.y);
            for (let i = 0; i < controls.length; i++) {
                controls[i] = 1;
                let yhat = this.eval(point.x, controls);
                xarr[xarr.length - 1].push(yhat);
                controls[i] = 0;
            }
        }
        const xmat = new Matrix(xarr);
        const ymat = new Matrix([yarr]).transpose();
        const lambda = 0.0001
        // Ridge regression estimator
        const left = xmat.transpose().mmul(xmat).add(Matrix.identity(xmat.columns).mul(lambda))
        const right = xmat.transpose().mmul(ymat)
        const beta = solve(left, right).to1DArray()
        this.controls = beta;
    }

    fitIter() {

    }

    deBoor(k: number, x: number, controls: number[]) {
        // Evaluates S(x).

        // Arguments
        // ---------
        // k: Index of knot interval that contains x.
        // x: Position.
        // c: Array of control points.
        let d = new Array(this.order + 1)
        for (let j = 0; j <= this.order; j++) {
            d[j] = controls[j + k - this.order]
        }

        for (let r = 1; r <= this.order; r++) {
            for (let j = this.order; j >= r; j--) {
                const alpha = (x - this.knots[j + k - this.order]) / (this.knots[j + 1 + k - r] - this.knots[j + k - this.order])
                d[j] = (1.0 - alpha) * d[j - 1] + alpha * d[j]
            }
        }

        return d[this.order]
    }

    numBasis() {
        return this.knots.length - this.order - 1
    }

    drawBases(ctx: CanvasRenderingContext2D) {
        let started = false;
        let controls = new Array(this.numBasis()).fill(0);
        const height = ctx.canvas.height
        const width = ctx.canvas.width
        const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
        ctx.clearRect(0, 0, width, height)
        for (let control = 0; control < controls.length; control++) {
            ctx.strokeStyle = colors[control];
            ctx.beginPath()
            controls[control] = 1;
            for (let x = 0; x <= 1; x += (1 / 400)) {
                let y = this.eval(x, controls);
                y = height - (y * height);
                if (!started) {
                    ctx.moveTo(x * width, y);
                    started = true;
                }
                ctx.lineTo(x * width, y);
            }
            controls[control] = 0;
            ctx.stroke()
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        let started = false;
        const height = ctx.canvas.height
        const width = ctx.canvas.width
        const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
        ctx.clearRect(0, 0, width, height)
        ctx.strokeStyle = 'red';
        ctx.beginPath()
        for (let x = 0; x <= 1; x += (1 / 400)) {
            let y = this.eval(x, this.controls);
            y = (y * height);
            if (!started) {
                ctx.moveTo(x * width, y);
                started = true;
            }
            ctx.lineTo(x * width, y);
        }
        ctx.stroke()

        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'black';
        for (let point of this.points) {
            ctx.beginPath()
            ctx.arc((point.x) * width, point.y * height, 5, 0, 2 * Math.PI)
            ctx.fill();
            ctx.stroke()
        }
    }
}

export { Splines, Point }