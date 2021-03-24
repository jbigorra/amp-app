import { EMPTY, from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';

type ControllerConfig = {
  min: number,
  max: number,
  default: number,
};

type ControllersConfig = {
  volume: ControllerConfig,
  treble: ControllerConfig,
  mid: ControllerConfig,
  bass: ControllerConfig
};

const CONTROLLERS_CONFIG: ControllersConfig = {
  volume: {
    min: 0,
    max: 1,
    default: 0.5
  },
  treble: {
    min: -10,
    max: 10,
    default: 0
  },
  mid: {
    min: -10,
    max: 10,
    default: 0
  },
  bass: {
    min: -10,
    max: 10,
    default: 0
  },
}

interface IAudioAmp {
  turnOn(): void;
  turnOff(): void;
  getControllersConfig(): ControllersConfig;
  setVolumeTo(amount: number): void;
  setTrebleTo(amount: number): void;
  setMidTo(amount: number): void;
  setBassTo(amount: number): void;
  toggleDistortion(value: boolean): void
}

export class AudioAmp implements IAudioAmp {
  private _api: AudioAPI;

  constructor() {
    this._api = new AudioAPI();
  }

  getControllersConfig(): ControllersConfig {
    return this._api.controllersConfig;
  }

  setVolumeTo(amount: number): void {
    this._api.setVolumeTo(amount);
  }

  setTrebleTo(amount: number): void {
    throw new Error('Method not implemented.');
  }

  setMidTo(amount: number): void {
    throw new Error('Method not implemented.');
  }

  setBassTo(amount: number): void {
    throw new Error('Method not implemented.');
  }

  toggleDistortion(value: boolean): void {
    throw new Error('Method not implemented.');
  }

  turnOn(): void {
    this._api.turnOn();
  }

  turnOff(): void {
    this._api.turnOff();
  }
}

class AudioAPI {
  private _context: AudioContext;
  private _gainNode: GainNode;
  public readonly controllersConfig = CONTROLLERS_CONFIG;

  constructor() {
    this._context = new AudioContext();
    this._gainNode = new GainNode(this._context, { gain: this.controllersConfig.volume.default });
    this._init();
  }

  setVolumeTo(amount: number) {
    this._gainNode.gain.setTargetAtTime(amount, this._context.currentTime, .01);
    console.log(this._gainNode.gain.value, amount);
  }

  turnOn(): void {
    this._enableContextIfSuspended();
  }

  turnOff(): void {
    this._context.suspend();
  }

  private _init = () : void => {
    this._enableContextIfSuspended().pipe(
      tap(() => console.log('reaching')),
      mergeMap(() => this._getAudioSource()),
      map((audioSrc) => {
        console.log(audioSrc);
        const source = this._context.createMediaStreamSource(audioSrc);
        source
          .connect(this._gainNode)
          .connect(this._context.destination);
      }),
      catchError(e => {
        console.log(e);
        return EMPTY;
      })
    ).subscribe();
  }

  private _getAudioSource = () : Observable<MediaStream> => {
    return from(
      navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
          latency: 0
        }
      })
    );
  }

  private _enableContextIfSuspended = (): Observable<void> => {
    console.log("Context state is: " + this._context.state);
    return this._context.state === 'suspended'
      ? from(this._context.resume())
      : of();
  }
}
