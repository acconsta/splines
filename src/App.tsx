import React from 'react';
import Canvas from './canvas';
import { Slider } from '@mui/material';
import './App.css';


function App() {
  const [amplitude, setAmplitude] = React.useState(0);
  function handleSliderChange(e: any) {
    setAmplitude(e.target.value);
    // console.log(amplitude);
  }
  return (
    <div className="App">
      <Canvas amplitude={amplitude}></Canvas>
      <div>Amplitude</div>
      <Slider
        onChange={handleSliderChange}
      />
    </div>
  );
}

export default App;
