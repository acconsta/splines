import assert from "assert";

class Point {
    x: number = 0;
    y: number = 0;
}


class Splines {
    knots: number[]
    order: number

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
                return i-1;
            }
        }
        assert(false);
    }

    eval(x: number, controls: number[]) {
        let k = this.findInterval(x);
        return this.deBoor(k, x, controls)
    }

    fit(y: Point[]) {

    }

    fitIter(y: Point[]) {

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

    draw(ctx: CanvasRenderingContext2D) {
        let started = false;
        let controls = new Array(this.knots.length - this.order).fill(0);
        const height = ctx.canvas.height
        const width = ctx.canvas.width
        const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
        for (let control = 0; control < controls.length; control++) {
            ctx.strokeStyle = colors[control];
            console.log(ctx.fillStyle)
            ctx.beginPath()
            controls[control] = 1;
            for (let x = 0; x <= 1; x+=(1/400)) {
                let y = this.eval(x, controls);
                y = height - (y * height);
                if (!started) {
                    ctx.moveTo(x*width, y);
                    started = true;
                }
                ctx.lineTo(x*width, y);
            }
            controls[control] = 0;
            ctx.stroke()
        }
    }
}

export default Splines