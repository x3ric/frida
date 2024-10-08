class Timeout {
  constructor(id, clearFn) {
    this._id = id;
    this._clearFn = clearFn;
  }

  ref() {
  }

  unref() {
  }

  close() {
    this._clearFn(this._id);
    this._id = null;
  }
}

export function setTimeout(...args) {
  return new Timeout(globalThis.setTimeout(...args), globalThis.clearTimeout);
}

export function setInterval(...args) {
  return new Timeout(globalThis.setInterval(...args), globalThis.clearInterval);
}

export function clearTimeout(timeout) {
  timeout?.close();
}

export const clearInterval = clearTimeout;

export function enroll(item, msecs) {
  globalThis.clearTimeout(item._idleTimeoutId);
  item._idleTimeoutId = null;
  item._idleTimeout = msecs;
}

export function unenroll(item) {
  globalThis.clearTimeout(item._idleTimeoutId);
  item._idleTimeoutId = null;
  item._idleTimeout = -1;
}

export function active(item) {
  globalThis.clearTimeout(item._idleTimeoutId);
  item._idleTimeoutId = null;

  const msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = globalThis.setTimeout(() => { item._onTimeout(); }, msecs);
  }
}

export const _unrefActive = active;

export const setImmediate = globalThis.setImmediate;
export const clearImmediate = globalThis.clearImmediate;

export default {
  setTimeout,
  setInterval,
  clearTimeout,
  clearInterval,
  enroll,
  unenroll,
  active,
  _unrefActive,
  setImmediate,
  clearImmediate,
};
