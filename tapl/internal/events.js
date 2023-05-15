import { assert, assertType } from "./utils.js";

/**
 * Collection of all valid events.
 */
export const EventCollection = Object.freeze({
    /**
     * Registers a new callback to the event.
     * @param {Symbol} event A symbol registered in the EventCollection object
     * @throws {ReferenceError|TypeError} It can throw an exception in case of: *Receiving an invalid event* or *if the parameters do not have the expected types*.
     * @returns the name of the event
     */
    getStringName(event) {
        assertType(event, "symbol", "event");
        assert(Object.values(this).includes(event), `Expected a valid event to add the callback but got: ${event.toString()}`, ReferenceError);
        return Object.entries(this).find(entry => entry[1] === event)[0];
    },

    /**
     * Fired during the transformice class patching process. It is not recommended to use game-related functions at this stage.
     */
    EVENT_PRE_INIT: Symbol("Fired during the transformice class patching process. It is not recommended to use game-related functions at this stage."),
    /**
     * Fired when the login screen is added to the main stage.
     */
    EVENT_POST_INIT: Symbol("Fired when the login screen is added to the main stage."),
    /**
     * Fired when all transformice classes necessary for the loader to work have been found.
     */
    EVENT_INIT: Symbol("Fired when all transformice classes necessary for the loader to work have been found."),
    /**
     * Fired when the player logs in.
     * @param id number
     * @param nickname string
     * @param gameTime number
     * @param community object
     */
    EVENT_LOGIN: Symbol("Fired when the player logs in."),
    /**
     * Fired when a message is sent in the chat.
     * @param nickname string
     * @param message string
     */
    EVENT_CHAT_MESSAGE: Symbol("Fired when a message is sent in the chat.")
});

const eventsRegistered = new Map();

export const Events = Object.freeze({
    /**
     * Registers a new callback to the event.
     * @param {Symbol} event A symbol registered in the EventCollection object
     * @param {Function} callback A (async) callback that can take N parameters.
     * @param {boolean} once If true the callback is removed instantly after the first call.
     * @throws {ReferenceError|TypeError} It can throw an exception in case of: *Receiving an invalid event* or *if the parameters do not have the expected types*.
     */
    addEventListener(event, callback, once = false) {
        assertType(event, "symbol", "event");
        assertType(callback, "function", "callback");
        assertType(once, "boolean", "once");
        assert(!(callback !== undefined && callback.prototype && toString(callback.prototype.constructor).startsWith('class')), "callback must be a function, not a class.", TypeError);
        assert(Object.values(EventCollection).includes(event), `Expected a valid event to add the callback but got: ${event.toString()}`, ReferenceError);

        if (!eventsRegistered.has(event))
            eventsRegistered.set(event, []);

        eventsRegistered.get(event).push({
            callback,
            once
        });
    },

    /**
     * Use not recommended for events that return more than one parameter.
     * @param {Symbol} event A symbol registered in the EventCollection object
     * @throws {ReferenceError|TypeError} It can throw an exception in case of: *Receiving an invalid event* or *if the parameters do not have the expected types*.
     * @returns Returns a promise that resolves, with the event value, when the event fires.
     */
    waitEventDispatch(event) {
        assertType(event, "symbol", "event");
        assert(Object.values(EventCollection).includes(event), `Expected a valid event to add the callback but got: ${event.toString()}`, ReferenceError);
        return new Promise(resolve => this.addEventListener(event, resolve, true));
    },

    /**
     * Removes a callback registered in the event.
     * @param {Symbol} event A symbol registered in the EventCollection object
     * @param {Function} callback A (async) callback that can take N parameters.
     * @throws {ReferenceError|TypeError} It can throw an exception in case of: *Receiving an invalid event* or *if the parameters do not have the expected types*.
     */
    removeEventListener(event, callback) {
        assertType(event, "symbol", "event");
        assertType(callback, "function", "callback");
        assert(!(callback !== undefined && callback.prototype && toString(callback.prototype.constructor).startsWith('class')), "callback must be a function, not a class.", TypeError);
        assert(Object.values(EventCollection).includes(event), `Expected a valid event to remove the callback but got: ${event.toString()}`, ReferenceError);

        if (eventsRegistered.has(event)) {
            const infos = eventsRegistered.get(event);
            infos.splice(infos.indexOf(callback), 1);

            if (infos.length === 0)
                eventsRegistered.delete(event);
        }
    },

    /**
     * Triggers the callbacks registered in the event passing args as a parameter (vararg).
     * @param {Symbol} event 
     * @param {...any} args 
     * @throws {ReferenceError|TypeError} It can throw an exception if *received an invalid event*
     */
    dispatchEvent(event, ...args) {
        assertType(event, "symbol", "event");
        assert(Object.values(EventCollection).includes(event), `Expected a valid event to remove the callback but got: ${event.toString()}`, ReferenceError);

        if (eventsRegistered.has(event)) {
            const infos = eventsRegistered.get(event);

            for (const eventInfo of Object.values(infos)) {
                try {
                    const ret = eventInfo.callback(...args);

                    if (ret instanceof Promise) {
                        ret.catch(error => {
                            const err = new Error(`There was an error executing [async] '${eventInfo.callback.name || 'anonymous'}' callback from event ${EventCollection.getStringName(event)}.${event.toString()}:\n\t${error.message}`);
                            err.stack = error.stack;
                            console.error(err);
                        });
                    }
                } catch (error) {
                    const err = new Error(`There was an error executing '${eventInfo.callback.name || 'anonymous'}' callback from event ${EventCollection.getStringName(event)}.${event.toString()}:\n\t${error.message}`);
                    err.stack = error.stack;
                    console.error(err);
                }

                if (eventInfo.once)
                    infos.splice(infos.indexOf(eventInfo), 1);
            }
        }
    }
});