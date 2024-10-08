import { format } from 'util';

const messages = new Map();
export const codes = {};

export function aggregateTwoErrors(innerError, outerError) {
  if (innerError && outerError && innerError !== outerError) {
    if (Array.isArray(outerError.errors)) {
      // If `outerError` is already an `AggregateError`.
      outerError.errors.push(innerError);
      return outerError;
    }
    // eslint-disable-next-line no-restricted-syntax
    const err = new AggregateError([
      outerError,
      innerError,
    ], outerError.message);
    err.code = outerError.code;
    return err;
  }
  return innerError || outerError;
}

function makeNodeErrorWithCode(Base, key) {
  return function NodeError(...args) {
    const error = new Base();
    const message = getMessage(key, args, error);
    Object.defineProperties(error, {
      message: {
        value: message,
        enumerable: false,
        writable: true,
        configurable: true,
      },
      toString: {
        value() {
          return `${this.name} [${key}]: ${this.message}`;
        },
        enumerable: false,
        writable: true,
        configurable: true,
      },
    });
    error.code = key;
    return error;
  };
}

function E(sym, val, def, ...otherClasses) {
  messages.set(sym, val);
  def = makeNodeErrorWithCode(def, sym);

  if (otherClasses.length !== 0) {
    otherClasses.forEach((clazz) => {
      def[clazz.name] = makeNodeErrorWithCode(clazz, sym);
    });
  }
  codes[sym] = def;
}

function getMessage(key, args, self) {
  const msg = messages.get(key);

  if (typeof msg === 'function') {
    return Reflect.apply(msg, self, args);
  }

  const expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
  if (args.length === 0)
    return msg;

  args.unshift(msg);
  return Reflect.apply(format, null, args);
}

export class AbortError extends Error {
  constructor() {
    super('The operation was aborted');
    this.code = 'ABORT_ERR';
    this.name = 'AbortError';
  }
}

E('ERR_EVENT_RECURSION', 'The event "%s" is already being dispatched', Error);
E('ERR_ILLEGAL_CONSTRUCTOR', 'Illegal constructor', TypeError);
E('ERR_INVALID_ARG_TYPE', 'Invalid argument type', TypeError);
E('ERR_INVALID_ARG_VALUE', 'Invalid argument value', TypeError, RangeError);
E('ERR_INVALID_RETURN_VALUE', 'Invalid return value', TypeError, RangeError);
E('ERR_INVALID_THIS', 'Value of "this" must be of type %s', TypeError);
E('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
E('ERR_MISSING_ARGS', 'Missing argument', TypeError);
E('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times', Error);
E('ERR_OUT_OF_RANGE', 'Out of range', RangeError);
E('ERR_STREAM_ALREADY_FINISHED',
  'Cannot call %s after a stream was finished',
  Error);
E('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
E('ERR_STREAM_DESTROYED', 'Cannot call %s after a stream was destroyed', Error);
E('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
E('ERR_STREAM_PREMATURE_CLOSE', 'Premature close', Error);
E('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF', Error);
E('ERR_STREAM_UNSHIFT_AFTER_END_EVENT',
  'stream.unshift() after end event', Error);
E('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);
E('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s', TypeError);
