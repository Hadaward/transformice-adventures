export class Dispatcher {
    constructor() {
        this.events = {};
    }

    addEventListener(event, handler, once = false) {
        if (!this.events.hasOwnProperty(event))
            this.events[event] = [];

        if (typeof handler !== 'function') {
            throw new TypeError(`addEventListener expected handler to be a function, not ${typeof handler}`);
        }

        this.events[event].push({
            handler,
            once
        });
    }

    removeEventListener(event, handler) {
        if (!this.events.hasOwnProperty(event))
            return;

        if (!handler) {
            this.events[event] = [];
            return;
        }

        if (typeof handler !== 'function') {
            throw new TypeError(`removeEventListener expected handler to be a function, not ${typeof handler}`);
        }

        this.events[event] = this.events[event].filter(data => data.handler !== handler);
    }

    dispatchEvent(event, ...args) {
        if (!this.events.hasOwnProperty(event))
            return;

        for (const data of this.events[event]) {
            data.handler(...args);

            if (data.once)
                this.removeEventListener(event, data.handler);
        }
    }
}