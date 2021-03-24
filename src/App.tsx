
import * as React from 'react';
import { useState } from 'react';
import './app.scss';

import { AudioAmp } from './audio-api';

const audioAmp = new AudioAmp();

interface Props {
  name: string
}

function App(props: Props) {
  const [isOn, setIsOn] = useState(false);

  const turnOnOff = () => {
    if (!isOn) audioAmp.turnOn();
    else audioAmp.turnOff();
    setIsOn(!isOn);
  }

  const volumeHandler: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = parseFloat(e.target.value);
    audioAmp.setVolumeTo(value);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <button id="on-off" onClick={turnOnOff}>{isOn ? 'Turn OFF' : 'Turn ON'}</button>
        <div>
          <VerticalSlider onChange={volumeHandler} id="volume" txt="Volume" min={0} max={1} step={0.01} />
        </div>
        {/* <div>
          <VerticalSlider id="gain" txt ="Gain" min={-10} max={10} step={0.01} />
        </div>
        <div>
          <VerticalSlider id="bass" txt="Bass" min={0} max={1} step={0.01} />
        </div> */}
      </div>
    </>
  );
}

export default App;

type VerticalSliderProps = {
  id: string,
  txt: string,
  step: number,
  min: number,
  max: number,
  onChange: React.ChangeEventHandler<HTMLInputElement>;
} & typeof defaultProps;

const defaultProps = {
  txt: 'EMPTY',
  step: 0.01,
  min: 0,
  max: 1,
}

const VerticalSlider = (props: VerticalSliderProps) => {
  const { id, txt, max, min } = props;
  const defaultValue = (Math.abs(min) + Math.abs(max)) / 2;
  return (
    <div className="slider">
      <input className="slider--vertical" type="range" {...props} defaultValue={max/2}/>
      <label htmlFor={id}>{txt}</label>
    </div>
  );
}
