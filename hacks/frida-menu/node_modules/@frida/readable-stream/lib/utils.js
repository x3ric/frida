export const kDestroyed = Symbol('kDestroyed');
export const kIsDisturbed = Symbol('kIsDisturbed');

export function isReadableNodeStream(obj) {
  return !!(
    obj &&
    typeof obj.pipe === 'function' &&
    typeof obj.on === 'function' &&
    (!obj._writableState || obj._readableState?.readable !== false) && // Duplex
    (!obj._writableState || obj._readableState) // Writable has .pipe.
  );
}

export function isWritableNodeStream(obj) {
  return !!(
    obj &&
    typeof obj.write === 'function' &&
    typeof obj.on === 'function' &&
    (!obj._readableState || obj._writableState?.writable !== false) // Duplex
  );
}

export function isDuplexNodeStream(obj) {
  return !!(
    obj &&
    (typeof obj.pipe === 'function' && obj._readableState) &&
    typeof obj.on === 'function' &&
    typeof obj.write === 'function'
  );
}

export function isNodeStream(obj) {
  return (
    obj &&
    (
      obj._readableState ||
      obj._writableState ||
      (typeof obj.write === 'function' && typeof obj.on === 'function') ||
      (typeof obj.pipe === 'function' && typeof obj.on === 'function')
    )
  );
}

export function isIterable(obj, isAsync) {
  if (obj == null) return false;
  if (isAsync === true) return typeof obj[Symbol.asyncIterator] === 'function';
  if (isAsync === false) return typeof obj[Symbol.iterator] === 'function';
  return typeof obj[Symbol.asyncIterator] === 'function' ||
    typeof obj[Symbol.iterator] === 'function';
}

export function isDestroyed(stream) {
  if (!isNodeStream(stream)) return null;
  const wState = stream._writableState;
  const rState = stream._readableState;
  const state = wState || rState;
  return !!(stream.destroyed || stream[kDestroyed] || state?.destroyed);
}

// Have been end():d.
export function isWritableEnded(stream) {
  if (!isWritableNodeStream(stream)) return null;
  if (stream.writableEnded === true) return true;
  const wState = stream._writableState;
  if (wState?.errored) return false;
  if (typeof wState?.ended !== 'boolean') return null;
  return wState.ended;
}

// Have emitted 'finish'.
export function isWritableFinished(stream, strict) {
  if (!isWritableNodeStream(stream)) return null;
  if (stream.writableFinished === true) return true;
  const wState = stream._writableState;
  if (wState?.errored) return false;
  if (typeof wState?.finished !== 'boolean') return null;
  return !!(
    wState.finished ||
    (strict === false && wState.ended === true && wState.length === 0)
  );
}

// Have been push(null):d.
export function isReadableEnded(stream) {
  if (!isReadableNodeStream(stream)) return null;
  if (stream.readableEnded === true) return true;
  const rState = stream._readableState;
  if (!rState || rState.errored) return false;
  if (typeof rState?.ended !== 'boolean') return null;
  return rState.ended;
}

// Have emitted 'end'.
export function isReadableFinished(stream, strict) {
  if (!isReadableNodeStream(stream)) return null;
  const rState = stream._readableState;
  if (rState?.errored) return false;
  if (typeof rState?.endEmitted !== 'boolean') return null;
  return !!(
    rState.endEmitted ||
    (strict === false && rState.ended === true && rState.length === 0)
  );
}

export function isReadable(stream) {
  const r = isReadableNodeStream(stream);
  if (r === null || typeof stream?.readable !== 'boolean') return null;
  if (isDestroyed(stream)) return false;
  return r && stream.readable && !isReadableFinished(stream);
}

export function isWritable(stream) {
  const r = isWritableNodeStream(stream);
  if (r === null || typeof stream?.writable !== 'boolean') return null;
  if (isDestroyed(stream)) return false;
  return r && stream.writable && !isWritableEnded(stream);
}

export function isFinished(stream, opts) {
  if (!isNodeStream(stream)) {
    return null;
  }

  if (isDestroyed(stream)) {
    return true;
  }

  if (opts?.readable !== false && isReadable(stream)) {
    return false;
  }

  if (opts?.writable !== false && isWritable(stream)) {
    return false;
  }

  return true;
}

export function isClosed(stream) {
  if (!isNodeStream(stream)) {
    return null;
  }

  const wState = stream._writableState;
  const rState = stream._readableState;

  if (
    typeof wState?.closed === 'boolean' ||
    typeof rState?.closed === 'boolean'
  ) {
    return wState?.closed || rState?.closed;
  }

  if (typeof stream._closed === 'boolean' && isOutgoingMessage(stream)) {
    return stream._closed;
  }

  return null;
}

function isOutgoingMessage(stream) {
  return (
    typeof stream._closed === 'boolean' &&
    typeof stream._defaultKeepAlive === 'boolean' &&
    typeof stream._removedConnection === 'boolean' &&
    typeof stream._removedContLen === 'boolean'
  );
}

export function isServerResponse(stream) {
  return (
    typeof stream._sent100 === 'boolean' &&
    isOutgoingMessage(stream)
  );
}

export function isServerRequest(stream) {
  return (
    typeof stream._consuming === 'boolean' &&
    typeof stream._dumped === 'boolean' &&
    stream.req?.upgradeOrConnect === undefined
  );
}

export function willEmitClose(stream) {
  if (!isNodeStream(stream)) return null;

  const wState = stream._writableState;
  const rState = stream._readableState;
  const state = wState || rState;

  return (!state && isServerResponse(stream)) || !!(
    state &&
    state.autoDestroy &&
    state.emitClose &&
    state.closed === false
  );
}

export function isDisturbed(stream) {
  return !!(stream && (
    stream.readableDidRead ||
    stream.readableAborted ||
    stream[kIsDisturbed]
  ));
}
