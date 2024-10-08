class Context {
}

export class Script {
  constructor(code) {
    this.code = code;
  }

  runInContext(context) {
    throw new Error('not yet supported');
  }

  runInThisContext() {
    return eval(this.code);
  }

  runInNewContext(context) {
    const ctx = createContext(context);
    const res = this.runInContext(ctx);

    if (context !== undefined) {
      for (const [key, value] of Object.entries(ctx))
        context[key] = value;
    }

    return res;
  }
}

export function runInContext(code, context) {
  const s = Script(code);
  return s.runInContext(context);
}

export function runInThisContext(code) {
  const s = Script(code);
  return s.runInThisContext();
}

export function runInNewContext(code, context) {
  const s = Script(code);
  return s.runInNewContext(context);
}

export function isContext(context) {
  return context instanceof Context;
}

export function createScript(code) {
  return new Script(code);
}

export function createContext(context) {
  const copy = new Context();

  if (context !== undefined) {
    for (const [key, value] of Object.entries(context))
      copy[key] = value;
  }

  return copy;
}

export default {
  Script,
  runInContext,
  runInThisContext,
  runInNewContext,
  isContext,
  createScript,
  createContext,
};
