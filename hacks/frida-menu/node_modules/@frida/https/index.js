import EventEmitter from 'events';

export class Agent extends EventEmitter {
}

export const globalAgent = new Agent();

export class Server extends EventEmitter {
  constructor() {
    throw new Error('https.Server is not implemented');
  }
}

export function createServer() {
  throw new Error('https.createServer is not implemented');
}

export function request() {
  throw new Error('https.request is not implemented');
}

export function get() {
  throw new Error('https.get is not implemented');
}

export default {
  Agent,
  globalAgent,
  Server,
  createServer,
  request,
  get,
};
