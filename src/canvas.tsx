import React from 'react';
import { Splines, Point } from './spline';

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
    numberOfKnots: number
    degreeOfSpline: number
}

class Canvas extends React.Component<CanvasState> {
    canvas: React.RefObject<HTMLCanvasElement>
    ctx: CanvasRenderingContext2D | null = null
    points: Point[] = []
    splines: Splines

    constructor(props: CanvasState) {
        super(props);
        this.canvas = React.createRef();
        this.splines = new Splines(props.numberOfKnots, props.degreeOfSpline);
    }

    componentDidMount() {
        if (this.canvas.current) {
            const main = document.getElementsByTagName("main")[0]
            console.log(main)
            this.canvas.current.height = main.clientHeight - 20
            this.canvas.current.width = main.clientWidth - 5
        }
        this.componentDidUpdate()
        if (this.ctx) {
            let hue = 0;
            let drawClickMeText = () => {
                if (!this.ctx || this.splines.points.length) {
                    return
                }
                this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
                this.ctx.font = 'bold 36px sans-serif';
                this.ctx.textAlign = 'center'
                this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, 1)`
                hue += 0.5
                this.ctx.fillText("Click Me", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2)
                window.requestAnimationFrame(drawClickMeText)
            }
            window.requestAnimationFrame(drawClickMeText)
        }
    }

    componentDidUpdate() {
        this.ctx = this.ctx || this.canvas?.current?.getContext("2d") as CanvasRenderingContext2D;
        if (this.ctx === null) {
            return null;
        }
        this.ctx.canvas.onclick = ev => {
            const canvas = this.ctx?.canvas
            if (!canvas) {
                return;
            }
            const [height, width] = [canvas.height, canvas.width]
            this.points.push(new Point(ev.offsetX / width, ev.offsetY / height))
            this.splines.setPoints(this.points)
            if (this.ctx) {
                this.splines.drawLoop(this.ctx);
            }
        }
    }

    render() {
        this.splines.setKnotsAndOrder(this.props.numberOfKnots, this.props.degreeOfSpline)
        if (this.ctx) {
            this.splines.drawLoop(this.ctx)
        }
        return (
            <canvas
                ref={this.canvas}
                width={1}
                height={1}
            />
        )
    }
}
export default Canvas