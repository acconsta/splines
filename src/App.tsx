import React from 'react';
import Canvas from './canvas';
import { Slider } from '@mui/material';
import './App.css';


function App() {
  const [numberOfKnots, setNumberOfKnots] = React.useState(5);
  const [degreeOfSpline, setDegreeOfSpline] = React.useState(3);
  return (
    <div className="App">
      <h1>Regression Splines Demo</h1>
      <Canvas numberOfKnots={numberOfKnots}></Canvas>
      <div>Number of Knots: {numberOfKnots}</div>
      <Slider
        onChange={(e: any) => setNumberOfKnots(e.target.value)}
        defaultValue={5}
        min={2}
        max={10}
      />
      <div>Degree of Spline: {degreeOfSpline}</div>
      <Slider
        onChange={(e: any) => setDegreeOfSpline(e.target.value)}
        defaultValue={2}
        min={1}
        max={5}
      />
    </div>
  );
}

export default App;
