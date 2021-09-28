import React from 'react';
import Canvas from './canvas';
import { Slider } from '@mui/material';
import './App.css';


function App() {
  const [numberOfKnots, setNumberOfKnots] = React.useState(5);
  const [degreeOfSpline, setDegreeOfSpline] = React.useState(3);
  return (
    <article>
      <header>
        <h1>Basis Splines Demo</h1>
        <div id="instructions">
          <p><a href="https://en.wikipedia.org/wiki/B-spline">Basis splines</a> are a powerful tool for expressing nonlinear statistical relationships.</p>
          <p><b>Click🖱️</b> to add data points and fit a basis spline using gradient descent.</p>
          <p><b>Use the sliders🎚️</b> to adjust the number of knots (polynomial pieces) and the degree (power) of the polynomials.</p>
        </div>
      </header>
      <main>
        <Canvas
          numberOfKnots={numberOfKnots}
          degreeOfSpline={degreeOfSpline}>
        </Canvas>
      </main>
      <footer>
        <div>Number of Knots: <b>{numberOfKnots}</b></div>
        <Slider
          onChange={(e: any) => setNumberOfKnots(e.target.value)}
          defaultValue={5}
          min={2}
          max={15}
        />
        <div>Degree of Spline: <b>{degreeOfSpline}</b></div>
        <Slider
          onChange={(e: any) => setDegreeOfSpline(e.target.value)}
          defaultValue={3}
          min={1}
          max={5}
        />
      </footer>
    </article>
  );
}

export default App;
