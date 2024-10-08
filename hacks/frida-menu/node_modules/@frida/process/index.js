export function nextTick(callback, ...args) {
  Script.nextTick(callback, ...args);
}

export const title = 'Frida';
export const browser = false;
export const platform = detectPlatform();
export const pid = Process.id;
export const env = {
  FRIDA_COMPILE: '1',
};
export const argv = [];
export const version = Frida.version;
export const versions = {};

function noop() {}

export const on = noop;
export const addListener = noop;
export const once = noop;
export const off = noop;
export const removeListener = noop;
export const removeAllListeners = noop;
export const emit = noop;
export const prependListener = noop;
export const prependOnceListener = noop;

export const listeners = function (name) { return []; }

export function binding(name) {
    throw new Error('process.binding is not supported');
}

export function cwd() {
    return (Process.platform === 'windows') ? 'C:\\' : '/';
}
export function chdir(dir) {
    throw new Error('process.chdir is not supported');
}
export function umask() { return 0; }

export default {
    nextTick,
    title,
    browser,
    platform,
    pid,
    env,
    argv,
    version,
    versions,
    on,
    addListener,
    once,
    off,
    removeListener,
    removeAllListeners,
    emit,
    prependListener,
    prependOnceListener,
    listeners,
    binding,
    cwd,
    chdir,
    umask,
};

function detectPlatform() {
    const platform = Process.platform;
    return (platform === 'windows') ? 'win32' : platform;
}
