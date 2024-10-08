import { addAbortSignal } from './lib/add-abort-signal.js';
import compose from './lib/compose.js';
import { destroyer } from './lib/destroy.js';
import Duplex from './lib/duplex.js';
import eos from './lib/end-of-stream.js';
import { Stream as LegacyStream } from './lib/legacy.js';
import PassThrough from './lib/passthrough.js';
import pipeline from './lib/pipeline.js';
import * as promises from './lib/promises.js';
import Readable from './lib/readable.js';
import Transform from './lib/transform.js';
import { isDisturbed } from './lib/utils.js';
import Writable from './lib/writable.js';

import { Buffer } from 'buffer';
import { promisify, types } from 'util';

export default Readable;
export {
  isDisturbed,
  Readable as Stream,
  LegacyStream,
  Readable,
  Writable,
  Duplex,
  Transform,
  PassThrough,
  pipeline,
  addAbortSignal,
  eos as finished,
  destroyer as destroy,
  compose,
  promises,
};

LegacyStream.isDisturbed = isDisturbed;
LegacyStream.Readable = Readable;
LegacyStream.Writable = Writable;
LegacyStream.Duplex = Duplex;
LegacyStream.Transform = Transform;
LegacyStream.PassThrough = PassThrough;
LegacyStream.pipeline = pipeline;
LegacyStream.addAbortSignal = addAbortSignal;
LegacyStream.finished = eos;
LegacyStream.destroy = destroyer;
LegacyStream.compose = compose;

Object.defineProperty(LegacyStream, 'promises', {
  configurable: true,
  enumerable: true,
  get() {
    return promises;
  }
});

Object.defineProperty(pipeline, promisify.custom, {
  enumerable: true,
  get() {
    return promises.pipeline;
  }
});

Object.defineProperty(eos, promisify.custom, {
  enumerable: true,
  get() {
    return promises.finished;
  }
});

// Backwards-compat with node 0.4.x
LegacyStream.Stream = LegacyStream;

LegacyStream._isUint8Array = types.isUint8Array;
LegacyStream._uint8ArrayToBuffer = Buffer.from;
