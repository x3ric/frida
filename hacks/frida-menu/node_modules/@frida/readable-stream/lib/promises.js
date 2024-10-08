import eos from './end-of-stream.js';
import { pipelineImpl as pl } from './pipeline.js';
import {
  isIterable,
  isNodeStream,
} from './utils.js';

export function pipeline(...streams) {
  return new Promise((resolve, reject) => {
    let signal;
    const lastArg = streams[streams.length - 1];
    if (lastArg && typeof lastArg === 'object' &&
        !isNodeStream(lastArg) && !isIterable(lastArg)) {
      const options = streams.pop();
      signal = options.signal;
    }

    pl(streams, (err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    }, { signal });
  });
}

export function finished(stream, opts) {
  return new Promise((resolve, reject) => {
    eos(stream, opts, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
