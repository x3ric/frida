// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9

const ObjectToString = uncurryThis(Object.prototype.toString);

const numberValue = uncurryThis(Number.prototype.valueOf);
const stringValue = uncurryThis(String.prototype.valueOf);
const booleanValue = uncurryThis(Boolean.prototype.valueOf);

const bigIntValue = uncurryThis(BigInt.prototype.valueOf);

const symbolValue = uncurryThis(Symbol.prototype.valueOf);

const generatorPrototype = Object.getPrototypeOf(function* () {});
const typedArrayPrototype = Object.getPrototypeOf(Int8Array);

export function isArgumentsObject(value) {
  if (value !== null && typeof value === 'object' && Symbol.toStringTag in value) {
    return false;
  }
  return ObjectToString(value) === '[object Arguments]';
}

export function isGeneratorFunction(value) {
  return Object.getPrototypeOf(value) === generatorPrototype;
}

export function isTypedArray(value) {
  return value instanceof typedArrayPrototype;
}

export function isPromise(input) {
  return input instanceof Promise;
}

export function isArrayBufferView(value) {
  return ArrayBuffer.isView(value);
}

export function isUint8Array(value) {
  return value instanceof Uint8Array;
}

export function isUint8ClampedArray(value) {
  return value instanceof Uint8ClampedArray;
}

export function isUint16Array(value) {
  return value instanceof Uint16Array;
}

export function isUint32Array(value) {
  return value instanceof Uint32Array;
}

export function isInt8Array(value) {
  return value instanceof Int8Array;
}

export function isInt16Array(value) {
  return value instanceof Int16Array;
}

export function isInt32Array(value) {
  return value instanceof Int32Array;
}

export function isFloat32Array(value) {
  return value instanceof Float32Array;
}

export function isFloat64Array(value) {
  return value instanceof Float64Array;
}

export function isBigInt64Array(value) {
  return value instanceof BigInt64Array;
}

export function isBigUint64Array(value) {
  return value instanceof BigUint64Array;
}

export function isMap(value) {
  return ObjectToString(value) === '[object Map]';
}

export function isSet(value) {
  return ObjectToString(value) === '[object Set]';
}

export function isWeakMap(value) {
  return ObjectToString(value) === '[object WeakMap]';
}

export function isWeakSet(value) {
  return ObjectToString(value) === '[object WeakSet]';
}

export function isArrayBuffer(value) {
  return ObjectToString(value) === '[object ArrayBuffer]';
}

export function isDataView(value) {
  return ObjectToString(value) === '[object DataView]';
}

export function isSharedArrayBuffer(value) {
  return ObjectToString(value) === '[object SharedArrayBuffer]';
}

export function isAsyncFunction(value) {
  return ObjectToString(value) === '[object AsyncFunction]';
}

export function isMapIterator(value) {
  return ObjectToString(value) === '[object Map Iterator]';
}

export function isSetIterator(value) {
  return ObjectToString(value) === '[object Set Iterator]';
}

export function isGeneratorObject(value) {
  return ObjectToString(value) === '[object Generator]';
}

export function isWebAssemblyCompiledModule(value) {
  return ObjectToString(value) === '[object WebAssembly.Module]';
}

export function isNumberObject(value) {
  return checkBoxedPrimitive(value, numberValue);
}

export function isStringObject(value) {
  return checkBoxedPrimitive(value, stringValue);
}

export function isBooleanObject(value) {
  return checkBoxedPrimitive(value, booleanValue);
}

export function isBigIntObject(value) {
  return checkBoxedPrimitive(value, bigIntValue);
}

export function isSymbolObject(value) {
  return checkBoxedPrimitive(value, symbolValue);
}

function checkBoxedPrimitive(value, prototypeValueOf) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    prototypeValueOf(value);
    return true;
  } catch(e) {
    return false;
  }
}

export function isBoxedPrimitive(value) {
  return (
    isNumberObject(value) ||
    isStringObject(value) ||
    isBooleanObject(value) ||
    isBigIntObject(value) ||
    isSymbolObject(value)
  );
}

export function isAnyArrayBuffer(value) {
  return isArrayBuffer(value) || isSharedArrayBuffer(value);
}

export function isProxy(value) {
  throwNotSupported('isProxy');
}

export function isExternal(value) {
  throwNotSupported('isExternal');
}

export function isModuleNamespaceObject(value) {
  throwNotSupported('isModuleNamespaceObject');
}

function throwNotSupported(method) {
  throw new Error(`${method} is not supported in userland`);
}

function uncurryThis(f) {
  return f.call.bind(f);
}
