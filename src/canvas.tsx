import React from 'react';
import { Matrix, solve } from 'ml-matrix';
import { Splines, Point } from './spline';
import assert from 'assert';

function drawSine(ctx: CanvasRenderingContext2D, amplitude: number) {
    // http://steve.hollasch.net/cgindex/math/inccos.html
    const height = ctx.canvas.height;
    const width = ctx.canvas.width;
    const nslices = width;
    const theta_increment = (2 * Math.PI) / nslices;
    let Tcos = 1;   // Start from theta = zero.
    let Tsin = 0;

    let beta = Math.sin(theta_increment);
    let alpha = Math.sin(theta_increment / 2);
    alpha = 2 * alpha * alpha;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    let points = []
    for (let i = 0; i < nslices; ++i) {

        // Use Tcos and Tsin
        const x = i;
        const y = (height / 2) + (amplitude / 100 * height / 2) * Tsin;
        points.push([x, y])
        ctx.lineTo(x, y);

        let Ncos = (alpha * Tcos) + (beta * Tsin);
        let Nsin = (alpha * Tsin) - (beta * Tcos);
        Tcos -= Ncos;
        Tsin -= Nsin;

    }
    ctx.stroke();
    return points;
}

type CanvasState = {
    amplitude: number
}

class Canvas extends React.Component<CanvasState> {
    canvas: React.RefObject<HTMLCanvasElement>;
    ctx: CanvasRenderingContext2D | null = null;

    constructor(props: CanvasState) {
        super(props);
        this.canvas = React.createRef();
    }

    componentDidUpdate() {
        this.ctx = this.ctx || this.canvas?.current?.getContext("2d") as CanvasRenderingContext2D;
        if (this.ctx === null) {
            return null;
        }
        console.log(this.props.amplitude);
        // let points = drawSine(this.ctx, this.props.amplitude);
        // fit(this.ctx, points);
        let knots = [0, 0, 0, 0, 0.25, 0.5, 0.75, 1, 1, 1, 1];
        let order = 3;
        let splines = new Splines(knots, order);
        // console.log(splines.eval(10))
        let points: Point[] = []
        for (let i = 0; i < 10; i++) {
            points.push(new Point(Math.random(), Math.random()))
        }
        splines.setPoints(points)
        splines.fit()
        splines.draw(this.ctx);
        // splines.drawBases(this.ctx);
    }

    render() {
        return (
            <canvas ref={this.canvas} width={840} height={625} />
        )
    }
}
export default Canvas