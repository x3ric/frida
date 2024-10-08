// Modeled very closely on the AbortController implementation
// in https://github.com/mysticatea/abort-controller (MIT license)

import { codes as errorCodes } from '../errors.js';
import {
  defineEventHandler,
  EventTarget,
  Event,
  kTrustEvent
} from './event_target.js';

import { inspect } from 'util';

const {
  ERR_ILLEGAL_CONSTRUCTOR,
  ERR_INVALID_THIS,
} = errorCodes;

export const kAborted = Symbol('kAborted');

function customInspect(self, obj, depth, options) {
  if (depth < 0)
    return self;

  const opts = Object.assign({}, options, {
    depth: options.depth === null ? null : options.depth - 1
  });

  return `${self.constructor.name} ${inspect(obj, opts)}`;
}

function validateAbortSignal(obj) {
  if (obj?.[kAborted] === undefined)
    throw new ERR_INVALID_THIS('AbortSignal');
}

export class AbortSignal extends EventTarget {
  constructor() {
    throw new ERR_ILLEGAL_CONSTRUCTOR();
  }

  get aborted() {
    validateAbortSignal(this);
    return !!this[kAborted];
  }

  [inspect.custom](depth, options) {
    return customInspect(this, {
      aborted: this.aborted
    }, depth, options);
  }

  static abort() {
    return createAbortSignal(true);
  }
}

Object.defineProperties(AbortSignal.prototype, {
  aborted: { enumerable: true }
});

Object.defineProperty(AbortSignal.prototype, Symbol.toStringTag, {
  writable: false,
  enumerable: false,
  configurable: true,
  value: 'AbortSignal',
});

defineEventHandler(AbortSignal.prototype, 'abort');

function createAbortSignal(aborted = false) {
  const signal = new EventTarget();
  Object.setPrototypeOf(signal, AbortSignal.prototype);
  signal[kAborted] = aborted;
  return signal;
}

function abortSignal(signal) {
  if (signal[kAborted]) return;
  signal[kAborted] = true;
  const event = new Event('abort', {
    [kTrustEvent]: true
  });
  signal.dispatchEvent(event);
}

// TODO(joyeecheung): V8 snapshot does not support instance member
// initializers for now:
// https://bugs.chromium.org/p/v8/issues/detail?id=10704
const kSignal = Symbol('signal');

function validateAbortController(obj) {
  if (obj?.[kSignal] === undefined)
    throw new ERR_INVALID_THIS('AbortController');
}

export class AbortController {
  constructor() {
    this[kSignal] = createAbortSignal();
  }

  get signal() {
    validateAbortController(this);
    return this[kSignal];
  }

  abort() {
    validateAbortController(this);
    abortSignal(this[kSignal]);
  }

  [inspect.custom](depth, options) {
    return customInspect(this, {
      signal: this.signal
    }, depth, options);
  }
}

Object.defineProperties(AbortController.prototype, {
  signal: { enumerable: true },
  abort: { enumerable: true }
});

Object.defineProperty(AbortController.prototype, Symbol.toStringTag, {
  writable: false,
  enumerable: false,
  configurable: true,
  value: 'AbortController',
});
