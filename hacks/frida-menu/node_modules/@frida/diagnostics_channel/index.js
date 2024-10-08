class ActiveChannel {
  subscribe(subscription) {
    this._subscribers.push(subscription);
  }

  unsubscribe(subscription) {
    const index = this._subscribers.indexOf(subscription);
    if (index >= 0) {
      this._subscribers.splice(index, 1);

      // When there are no more active subscribers, restore to fast prototype.
      if (!this._subscribers.length) {
        Object.setPrototypeOf(this, Channel.prototype);
      }
    }
  }

  get hasSubscribers() {
    return true;
  }

  publish(data) {
    for (let i = 0; i < this._subscribers.length; i++) {
      try {
        const onMessage = this._subscribers[i];
        onMessage(data, this.name);
      } catch (err) {
        process.nextTick(() => {
          throw err;
        });
      }
    }
  }
}

export class Channel {
  constructor(name) {
    this._subscribers = undefined;
    this.name = name;
  }

  static [Symbol.hasInstance](instance) {
    const prototype = Object.getPrototypeOf(instance);
    return prototype === Channel.prototype ||
           prototype === ActiveChannel.prototype;
  }

  subscribe(subscription) {
    Object.setPrototypeOf(this, ActiveChannel.prototype);
    this._subscribers = [];
    this.subscribe(subscription);
  }

  get hasSubscribers() {
    return false;
  }

  publish() {}
}

const channels = new Map();

export function channel(name) {
  let channel = channels.get(name);
  if (channel !== undefined) return channel;

  channel = new Channel(name);
  channels.set(name, channel);
  return channel;
}

export function hasSubscribers(name) {
  const channel = channels.get(name);
  if (channel === undefined) return false;

  return channel.hasSubscribers;
}

export default {
  channel,
  hasSubscribers,
  Channel
};
