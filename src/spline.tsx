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
    lambda: number = 0.0001
    learning_rate: number = 0.05
    xmat: Matrix = new Matrix(0, 0)
    ymat: Matrix = new Matrix(0, 0)

    constructor(numKnots: number, order: number) {
        assert(numKnots > 1)
        console.log("knots", numKnots)
        console.log("order", order)
        let knots = []
        for (let i = 0; i < numKnots; i++) {
            knots.push(i / (numKnots - 1))
        }
        knots = new Array(order).fill(0).concat(knots, new Array(order).fill(1))
        this.knots = knots
        console.log(knots)
        this.order = order
        this.controls = Matrix.zeros(this.numBasis(), 1).to1DArray()
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
        this.xmat = new Matrix(xarr);
        this.ymat = new Matrix([yarr]).transpose();
    }

    fit() {
        // Ridge regression estimator
        const left = this.xmat.transpose().mmul(this.xmat).add(Matrix.identity(this.xmat.columns).mul(this.lambda))
        const right = this.xmat.transpose().mmul(this.ymat)
        const beta = solve(left, right).to1DArray()
        this.controls = beta;
    }

    fitIter() {
        const xmat = this.xmat
        const ymat = this.ymat
        let beta = new Matrix([this.controls]).transpose()
        const grad = xmat.transpose().mmul(ymat).mul(-2).add(xmat.transpose().mmul(xmat).mmul(beta).mul(2))
        const update = grad.mul(this.learning_rate * -1)
        this.controls = beta.add(update).to1DArray()
        const step_size = update.transpose().mmul(update).get(0, 0)
        return step_size
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
        ctx.strokeStyle = '#1976d2';
        ctx.lineWidth = 3
        ctx.beginPath()
        const transformX = (x: number) => x * width
        const transformY = (y: number) => y * height

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
            ctx.arc(transformX(point.x), transformY(point.y), 5, 0, 2 * Math.PI)
            ctx.fill();
            ctx.stroke()
        }
    }
}

export { Splines, Point }