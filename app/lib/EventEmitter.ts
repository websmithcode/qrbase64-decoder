export default class EventEmitter {
  #callbacks: { [key: string]: Function[] } = {};

  static Event = class {
    type: string = "";
    target: EventEmitter = new EventEmitter();
    data: any = "";
  };

  addEventListener(eventType: string, callback: Function) {
    if (typeof callback !== "function") return;
    if (this.#callbacks[eventType] === undefined) {
      this.#callbacks[eventType] = [];
    }

    this.#callbacks[eventType].push(callback);
  }

  dispatchEvent(eventType: string, data: any) {
    if (this.#callbacks[eventType] === undefined) return;

    const event = new EventEmitter.Event();
    event.type = eventType;
    event.target = this;
    event.data = data;

    this.#callbacks[eventType].forEach(callback => {
      callback(event);
    })
  }
}
