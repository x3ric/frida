import { codes as errorCodes } from '../errors.js';

import EventEmitter from 'events';
import process from 'process';
import { inspect } from 'util';

const {
  ERR_INVALID_ARG_TYPE,
  ERR_EVENT_RECURSION,
  ERR_MISSING_ARGS,
  ERR_INVALID_THIS,
} = errorCodes;

const kIsEventTarget = Symbol.for('nodejs.event_target');
const kIsNodeEventTarget = Symbol('kIsNodeEventTarget');

const {
  kMaxEventTargetListeners,
  kMaxEventTargetListenersWarned,
} = EventEmitter;

export const kEvents = Symbol('kEvents');
const kIsBeingDispatched = Symbol('kIsBeingDispatched');
const kStop = Symbol('kStop');
const kTarget = Symbol('kTarget');
const kHandlers = Symbol('khandlers');
export const kWeakHandler = Symbol('kWeak');

const kHybridDispatch = Symbol.for('nodejs.internal.kHybridDispatch');
export const kCreateEvent = Symbol('kCreateEvent');
export const kNewListener = Symbol('kNewListener');
export const kRemoveListener = Symbol('kRemoveListener');
const kIsNodeStyleListener = Symbol('kIsNodeStyleListener');
export const kTrustEvent = Symbol('kTrustEvent');

// TODO(joyeecheung): V8 snapshot does not support instance member
// initializers for now:
// https://bugs.chromium.org/p/v8/issues/detail?id=10704
const kType = Symbol('type');
const kDefaultPrevented = Symbol('defaultPrevented');
const kCancelable = Symbol('cancelable');
const kTimestamp = Symbol('timestamp');
const kBubbles = Symbol('bubbles');
const kComposed = Symbol('composed');
const kPropagationStopped = Symbol('propagationStopped');

const isTrustedSet = new WeakSet();
const isTrusted = Object.getOwnPropertyDescriptor({
  get isTrusted() {
    return isTrustedSet.has(this);
  }
}, 'isTrusted').get;

function isEvent(value) {
  return typeof value?.[kType] === 'string';
}

export class Event {
  constructor(type, options = null) {
    if (arguments.length === 0)
      throw new ERR_MISSING_ARGS('type');
    const { cancelable, bubbles, composed } = { ...options };
    this[kCancelable] = !!cancelable;
    this[kBubbles] = !!bubbles;
    this[kComposed] = !!composed;
    this[kType] = `${type}`;
    this[kDefaultPrevented] = false;
    this[kTimestamp] = Date.now();
    this[kPropagationStopped] = false;
    if (options?.[kTrustEvent]) {
      isTrustedSet.add(this);
    }

    // isTrusted is special (LegacyUnforgeable)
    Object.defineProperty(this, 'isTrusted', {
      get: isTrusted,
      enumerable: true,
      configurable: false
    });
    this[kTarget] = null;
    this[kIsBeingDispatched] = false;
  }

  [inspect.custom](depth, options) {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    const name = this.constructor.name;
    if (depth < 0)
      return name;

    const opts = Object.assign({}, options, {
      depth: Number.isInteger(options.depth) ? options.depth - 1 : options.depth
    });

    return `${name} ${inspect({
      type: this[kType],
      defaultPrevented: this[kDefaultPrevented],
      cancelable: this[kCancelable],
      timeStamp: this[kTimestamp],
    }, opts)}`;
  }

  stopImmediatePropagation() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    this[kStop] = true;
  }

  preventDefault() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    this[kDefaultPrevented] = true;
  }

  get target() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return this[kTarget];
  }

  get currentTarget() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return this[kTarget];
  }

  get srcElement() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return this[kTarget];
  }

  get type() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return this[kType];
  }

  get cancelable() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return this[kCancelable];
  }

  get defaultPrevented() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return this[kCancelable] && this[kDefaultPrevented];
  }

  get timeStamp() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return this[kTimestamp];
  }


  // The following are non-op and unused properties/methods from Web API Event.
  // These are not supported in Node.js and are provided purely for
  // API completeness.

  composedPath() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return this[kIsBeingDispatched] ? [this[kTarget]] : [];
  }

  get returnValue() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return !this.defaultPrevented;
  }

  get bubbles() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return this[kBubbles];
  }

  get composed() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return this[kComposed];
  }

  get eventPhase() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return this[kIsBeingDispatched] ? Event.AT_TARGET : Event.NONE;
  }

  get cancelBubble() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    return this[kPropagationStopped];
  }

  set cancelBubble(value) {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    if (value) {
      this.stopPropagation();
    }
  }

  stopPropagation() {
    if (!isEvent(this))
      throw new ERR_INVALID_THIS('Event');
    this[kPropagationStopped] = true;
  }

  static NONE = 0;
  static CAPTURING_PHASE = 1;
  static AT_TARGET = 2;
  static BUBBLING_PHASE = 3;
}

const kEnumerableProperty = Object.create(null);
kEnumerableProperty.enumerable = true;

Object.defineProperties(
  Event.prototype, {
    [Symbol.toStringTag]: {
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'Event',
    },
    stopImmediatePropagation: kEnumerableProperty,
    preventDefault: kEnumerableProperty,
    target: kEnumerableProperty,
    currentTarget: kEnumerableProperty,
    srcElement: kEnumerableProperty,
    type: kEnumerableProperty,
    cancelable: kEnumerableProperty,
    defaultPrevented: kEnumerableProperty,
    timeStamp: kEnumerableProperty,
    composedPath: kEnumerableProperty,
    returnValue: kEnumerableProperty,
    bubbles: kEnumerableProperty,
    composed: kEnumerableProperty,
    eventPhase: kEnumerableProperty,
    cancelBubble: kEnumerableProperty,
    stopPropagation: kEnumerableProperty,
  });

class NodeCustomEvent extends Event {
  constructor(type, options) {
    super(type, options);
    if (options?.detail) {
      this.detail = options.detail;
    }
  }
}

// Weak listener cleanup
// This has to be lazy for snapshots to work
let weakListenersState = null;
// The resource needs to retain the callback so that it doesn't
// get garbage collected now that it's weak.
let objectToWeakListenerMap = null;
function weakListeners() {
  if (weakListenersState === null) {
    weakListenersState = new FinalizationRegistry(
      (listener) => listener.remove()
    );
  }
  if (objectToWeakListenerMap === null) {
    objectToWeakListenerMap = new WeakMap();
  }
  return { registry: weakListenersState, map: objectToWeakListenerMap };
}

// The listeners for an EventTarget are maintained as a linked list.
// Unfortunately, the way EventTarget is defined, listeners are accounted
// using the tuple [handler,capture], and even if we don't actually make
// use of capture or bubbling, in order to be spec compliant we have to
// take on the additional complexity of supporting it. Fortunately, using
// the linked list makes dispatching faster, even if adding/removing is
// slower.
class Listener {
  constructor(previous, listener, once, capture, passive,
              isNodeStyleListener, weak) {
    this.next = undefined;
    if (previous !== undefined)
      previous.next = this;
    this.previous = previous;
    this.listener = listener;
    // TODO(benjamingr) these 4 can be 'flags' to save 3 slots
    this.once = once;
    this.capture = capture;
    this.passive = passive;
    this.isNodeStyleListener = isNodeStyleListener;
    this.removed = false;
    this.weak = Boolean(weak); // Don't retain the object

    if (this.weak) {
      this.callback = new WeakRef(listener);
      weakListeners().registry.register(listener, this, this);
      // Make the retainer retain the listener in a WeakMap
      weakListeners().map.set(weak, listener);
      this.listener = this.callback;
    } else if (typeof listener === 'function') {
      this.callback = listener;
      this.listener = listener;
    } else {
      this.callback = listener.handleEvent.bind(listener);
      this.listener = listener;
    }
  }

  same(listener, capture) {
    const myListener = this.weak ? this.listener.deref() : this.listener;
    return myListener === listener && this.capture === capture;
  }

  remove() {
    if (this.previous !== undefined)
      this.previous.next = this.next;
    if (this.next !== undefined)
      this.next.previous = this.previous;
    this.removed = true;
    if (this.weak)
      weakListeners().registry.unregister(this);
  }
}

export function initEventTarget(self) {
  self[kEvents] = new Map();
  self[kMaxEventTargetListeners] = EventEmitter.defaultMaxListeners;
  self[kMaxEventTargetListenersWarned] = false;
}

export class EventTarget {
  // Used in checking whether an object is an EventTarget. This is a well-known
  // symbol as EventTarget may be used cross-realm.
  // Ref: https://github.com/nodejs/node/pull/33661
  static [kIsEventTarget] = true;

  constructor() {
    initEventTarget(this);
  }

  [kNewListener](size, type, listener, once, capture, passive) {
    if (this[kMaxEventTargetListeners] > 0 &&
        size > this[kMaxEventTargetListeners] &&
        !this[kMaxEventTargetListenersWarned]) {
      this[kMaxEventTargetListenersWarned] = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      const w = new Error('Possible EventTarget memory leak detected. ' +
                          `${size} ${type} listeners ` +
                          `added to ${inspect(this, { depth: -1 })}. Use ` +
                          'events.setMaxListeners() to increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.target = this;
      w.type = type;
      w.count = size;
      process.emitWarning(w);
    }
  }
  [kRemoveListener](size, type, listener, capture) {}

  addEventListener(type, listener, options = {}) {
    if (!isEventTarget(this))
      throw new ERR_INVALID_THIS('EventTarget');
    if (arguments.length < 2)
      throw new ERR_MISSING_ARGS('type', 'listener');

    // We validateOptions before the shouldAddListeners check because the spec
    // requires us to hit getters.
    const {
      once,
      capture,
      passive,
      signal,
      isNodeStyleListener,
      weak,
    } = validateEventListenerOptions(options);

    if (!shouldAddListener(listener)) {
      // The DOM silently allows passing undefined as a second argument
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      const w = new Error(`addEventListener called with ${listener}` +
                          ' which has no effect.');
      w.name = 'AddEventListenerArgumentTypeWarning';
      w.target = this;
      w.type = type;
      process.emitWarning(w);
      return;
    }
    type = String(type);

    if (signal) {
      if (signal.aborted) {
        return;
      }
      // TODO(benjamingr) make this weak somehow? ideally the signal would
      // not prevent the event target from GC.
      signal.addEventListener('abort', () => {
        this.removeEventListener(type, listener, options);
      }, { once: true, [kWeakHandler]: this });
    }

    let root = this[kEvents].get(type);

    if (root === undefined) {
      root = { size: 1, next: undefined };
      // This is the first handler in our linked list.
      new Listener(root, listener, once, capture, passive,
                   isNodeStyleListener, weak);
      this[kNewListener](root.size, type, listener, once, capture, passive);
      this[kEvents].set(type, root);
      return;
    }

    let handler = root.next;
    let previous = root;

    // We have to walk the linked list to see if we have a match
    while (handler !== undefined && !handler.same(listener, capture)) {
      previous = handler;
      handler = handler.next;
    }

    if (handler !== undefined) { // Duplicate! Ignore
      return;
    }

    new Listener(previous, listener, once, capture, passive,
                 isNodeStyleListener, weak);
    root.size++;
    this[kNewListener](root.size, type, listener, once, capture, passive);
  }

  removeEventListener(type, listener, options = {}) {
    if (!isEventTarget(this))
      throw new ERR_INVALID_THIS('EventTarget');
    if (!shouldAddListener(listener))
      return;

    type = String(type);
    const capture = options?.capture === true;

    const root = this[kEvents].get(type);
    if (root === undefined || root.next === undefined)
      return;

    let handler = root.next;
    while (handler !== undefined) {
      if (handler.same(listener, capture)) {
        handler.remove();
        root.size--;
        if (root.size === 0)
          this[kEvents].delete(type);
        this[kRemoveListener](root.size, type, listener, capture);
        break;
      }
      handler = handler.next;
    }
  }

  dispatchEvent(event) {
    if (!isEventTarget(this))
      throw new ERR_INVALID_THIS('EventTarget');

    if (!(event instanceof Event))
      throw new ERR_INVALID_ARG_TYPE('event', 'Event', event);

    if (event[kIsBeingDispatched])
      throw new ERR_EVENT_RECURSION(event.type);

    this[kHybridDispatch](event, event.type, event);

    return event.defaultPrevented !== true;
  }

  [kHybridDispatch](nodeValue, type, event) {
    const createEvent = () => {
      if (event === undefined) {
        event = this[kCreateEvent](nodeValue, type);
        event[kTarget] = this;
        event[kIsBeingDispatched] = true;
      }
      return event;
    };
    if (event !== undefined) {
      event[kTarget] = this;
      event[kIsBeingDispatched] = true;
    }

    const root = this[kEvents].get(type);
    if (root === undefined || root.next === undefined) {
      if (event !== undefined)
        event[kIsBeingDispatched] = false;
      return true;
    }

    let handler = root.next;
    let next;

    while (handler !== undefined &&
           (handler.passive || event?.[kStop] !== true)) {
      // Cache the next item in case this iteration removes the current one
      next = handler.next;

      if (handler.removed) {
        // Deal with the case an event is removed while event handlers are
        // Being processed (removeEventListener called from a listener)
        handler = next;
        continue;
      }
      if (handler.once) {
        handler.remove();
        root.size--;
        const { listener, capture } = handler;
        this[kRemoveListener](root.size, type, listener, capture);
      }

      try {
        let arg;
        if (handler.isNodeStyleListener) {
          arg = nodeValue;
        } else {
          arg = createEvent();
        }
        const callback = handler.weak ?
          handler.callback.deref() : handler.callback;
        let result;
        if (callback) {
          result = callback.call(this, arg);
          if (!handler.isNodeStyleListener) {
            arg[kIsBeingDispatched] = false;
          }
        }
        if (result !== undefined && result !== null)
          addCatch(result);
      } catch (err) {
        emitUncaughtException(err);
      }

      handler = next;
    }

    if (event !== undefined)
      event[kIsBeingDispatched] = false;
  }

  [kCreateEvent](nodeValue, type) {
    return new NodeCustomEvent(type, { detail: nodeValue });
  }
  [inspect.custom](depth, options) {
    if (!isEventTarget(this))
      throw new ERR_INVALID_THIS('EventTarget');
    const name = this.constructor.name;
    if (depth < 0)
      return name;

    const opts = Object.assign({}, options, {
      depth: Number.isInteger(options.depth) ? options.depth - 1 : options.depth
    });

    return `${name} ${inspect({}, opts)}`;
  }
}

Object.defineProperties(EventTarget.prototype, {
  addEventListener: kEnumerableProperty,
  removeEventListener: kEnumerableProperty,
  dispatchEvent: kEnumerableProperty,
  [Symbol.toStringTag]: {
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'EventTarget',
  }
});

export function initNodeEventTarget(self) {
  initEventTarget(self);
}

export class NodeEventTarget extends EventTarget {
  static [kIsNodeEventTarget] = true;
  static defaultMaxListeners = 10;

  constructor() {
    super();
    initNodeEventTarget(this);
  }

  setMaxListeners(n) {
    if (!isNodeEventTarget(this))
      throw new ERR_INVALID_THIS('NodeEventTarget');
    EventEmitter.setMaxListeners(n, this);
  }

  getMaxListeners() {
    if (!isNodeEventTarget(this))
      throw new ERR_INVALID_THIS('NodeEventTarget');
    return this[kMaxEventTargetListeners];
  }

  eventNames() {
    if (!isNodeEventTarget(this))
      throw new ERR_INVALID_THIS('NodeEventTarget');
    return Array.from(this[kEvents].keys());
  }

  listenerCount(type) {
    if (!isNodeEventTarget(this))
      throw new ERR_INVALID_THIS('NodeEventTarget');
    const root = this[kEvents].get(String(type));
    return root !== undefined ? root.size : 0;
  }

  off(type, listener, options) {
    if (!isNodeEventTarget(this))
      throw new ERR_INVALID_THIS('NodeEventTarget');
    this.removeEventListener(type, listener, options);
    return this;
  }

  removeListener(type, listener, options) {
    if (!isNodeEventTarget(this))
      throw new ERR_INVALID_THIS('NodeEventTarget');
    this.removeEventListener(type, listener, options);
    return this;
  }

  on(type, listener) {
    if (!isNodeEventTarget(this))
      throw new ERR_INVALID_THIS('NodeEventTarget');
    this.addEventListener(type, listener, { [kIsNodeStyleListener]: true });
    return this;
  }

  addListener(type, listener) {
    if (!isNodeEventTarget(this))
      throw new ERR_INVALID_THIS('NodeEventTarget');
    this.addEventListener(type, listener, { [kIsNodeStyleListener]: true });
    return this;
  }
  emit(type, arg) {
    if (!isNodeEventTarget(this))
      throw new ERR_INVALID_THIS('NodeEventTarget');
    const hadListeners = this.listenerCount(type) > 0;
    this[kHybridDispatch](arg, type);
    return hadListeners;
  }

  once(type, listener) {
    if (!isNodeEventTarget(this))
      throw new ERR_INVALID_THIS('NodeEventTarget');
    this.addEventListener(type, listener,
                          { once: true, [kIsNodeStyleListener]: true });
    return this;
  }

  removeAllListeners(type) {
    if (!isNodeEventTarget(this))
      throw new ERR_INVALID_THIS('NodeEventTarget');
    if (type !== undefined) {
      this[kEvents].delete(String(type));
    } else {
      this[kEvents].clear();
    }

    return this;
  }
}

Object.defineProperties(NodeEventTarget.prototype, {
  setMaxListeners: kEnumerableProperty,
  getMaxListeners: kEnumerableProperty,
  eventNames: kEnumerableProperty,
  listenerCount: kEnumerableProperty,
  off: kEnumerableProperty,
  removeListener: kEnumerableProperty,
  on: kEnumerableProperty,
  addListener: kEnumerableProperty,
  once: kEnumerableProperty,
  emit: kEnumerableProperty,
  removeAllListeners: kEnumerableProperty,
});

// EventTarget API

function shouldAddListener(listener) {
  if (typeof listener === 'function' ||
      typeof listener?.handleEvent === 'function') {
    return true;
  }

  if (listener == null)
    return false;

  throw new ERR_INVALID_ARG_TYPE('listener', 'EventListener', listener);
}

function validateEventListenerOptions(options) {
  if (typeof options === 'boolean')
    return { capture: options };

  if (options === null)
    return {};
  return {
    once: Boolean(options.once),
    capture: Boolean(options.capture),
    passive: Boolean(options.passive),
    signal: options.signal,
    weak: options[kWeakHandler],
    isNodeStyleListener: Boolean(options[kIsNodeStyleListener])
  };
}

// Test whether the argument is an event object. This is far from a fool-proof
// test, for example this input will result in a false positive:
// > isEventTarget({ constructor: EventTarget })
// It stands in its current implementation as a compromise.
// Ref: https://github.com/nodejs/node/pull/33661
export function isEventTarget(obj) {
  return obj?.constructor?.[kIsEventTarget];
}

function isNodeEventTarget(obj) {
  return obj?.constructor?.[kIsNodeEventTarget];
}

function addCatch(promise) {
  const then = promise.then;
  if (typeof then === 'function') {
    then.call(promise, undefined, function(err) {
      // The callback is called with nextTick to avoid a follow-up
      // rejection from this promise.
      emitUncaughtException(err);
    });
  }
}

function emitUncaughtException(err) {
  process.nextTick(() => { throw err; });
}

function makeEventHandler(handler) {
  // Event handlers are dispatched in the order they were first set
  // See https://github.com/nodejs/node/pull/35949#issuecomment-722496598
  function eventHandler(...args) {
    if (typeof eventHandler.handler !== 'function') {
      return;
    }
    return Reflect.apply(eventHandler.handler, this, args);
  }
  eventHandler.handler = handler;
  return eventHandler;
}

export function defineEventHandler(emitter, name) {
  // 8.1.5.1 Event handlers - basically `on[eventName]` attributes
  Object.defineProperty(emitter, `on${name}`, {
    get() {
      return this[kHandlers]?.get(name)?.handler;
    },
    set(value) {
      if (!this[kHandlers]) {
        this[kHandlers] = new Map();
      }
      let wrappedHandler = this[kHandlers]?.get(name);
      if (wrappedHandler) {
        if (typeof wrappedHandler.handler === 'function') {
          this[kEvents].get(name).size--;
          const size = this[kEvents].get(name).size;
          this[kRemoveListener](size, name, wrappedHandler.handler, false);
        }
        wrappedHandler.handler = value;
        if (typeof wrappedHandler.handler === 'function') {
          this[kEvents].get(name).size++;
          const size = this[kEvents].get(name).size;
          this[kNewListener](size, name, value, false, false, false);
        }
      } else {
        wrappedHandler = makeEventHandler(value);
        this.addEventListener(name, wrappedHandler);
      }
      this[kHandlers].set(name, wrappedHandler);
    },
    configurable: true,
    enumerable: true
  });
}

export const EventEmitterMixin = (Superclass) => {
  class MixedEventEmitter extends Superclass {
    constructor(...args) {
      super(...args);
      EventEmitter.call(this);
    }
  }
  const protoProps = Object.getOwnPropertyDescriptors(EventEmitter.prototype);
  delete protoProps.constructor;
  Object.defineProperties(MixedEventEmitter.prototype, protoProps);
  return MixedEventEmitter;
};
