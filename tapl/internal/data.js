import { assert, assertType } from "./utils.js";

let sessionData;

/**
 * Load or create a new session. Optionally it is possible to pass the default data of a new session.
 * @param {object} defaultData 
 */
export function loadOrCreateSession(defaultData) {
    if (defaultData !== undefined)
        assertType(defaultData, "object", "defaultData");

    const jsonData = localStorage.getItem(import.meta.url);

    if (jsonData === null) {
        sessionData = defaultData || {};
        localStorage.setItem(import.meta.url, JSON.stringify(sessionData));
    } else {
        try {
            sessionData = JSON.parse(jsonData);
        } catch (error) {
            console.warn(`Rebuilding session due to ${error.message} ${error.stack}`);

            clearSession();
            loadOrCreateSession(defaultData);
            return;
        }
    }

    console.info("%cSession started", "color:green");
}

/**
 * Erases all session data
 */
export function clearSession() {
    localStorage.removeItem(import.meta.url);
    sessionData = undefined;
}

/**
 * Creates or sets the value of a key in the loaded session. Value cannot be a function or class.
 * @param {string} key 
 * @param {any} value 
 */
export function setSessionData(key, value) {
    assertType(key, "string", "key");
    assert(typeof value !== 'function', `(value) ${String(value)} must not be a function.`, TypeError);
    assert(typeof sessionData === 'object', 'The session must be loaded in order to save data.', ReferenceError);

    sessionData[key] = value;
    localStorage.setItem(import.meta.url, JSON.stringify(sessionData));
}

/**
 * Gets a value of a key in the loaded session.
 * @param {string} key 
 * @returns {any} If the key exists, it returns its value otherwise it returns undefined.
 */
export function getSessionData(key) {
    assertType(key, "string", "key");
    assert(typeof sessionData === 'object', 'The session must be loaded in order to load data.', ReferenceError);
    return sessionData[key];
}