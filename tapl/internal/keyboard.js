import { getTransformiceClass } from "../tapl.js";
import { assertType, assert } from "./utils.js";

function getClavier() {
    const clavier = getTransformiceClass("Clavier");

    if (!clavier.instance) {
        clavier.initialisation();
        const contexte = new (getTransformiceClass("ContexteClavier"));
        clavier.instance.ajouterContexte(contexte);
    }

    return clavier;
}

/**
 * Calls a function when the player presses a key.
 * @param {string} key 
 * @param {function} callback 
 */
export function bindKeyboard(key, callback) {
    assertType(key, "string",  "key");
    assertType(callback, "function", "callback");
    assert(!(callback !== undefined && callback.prototype && toString(callback.prototype.constructor).startsWith('class')), "callback must be a function, not a class.", TypeError);

    getClavier().instance.listeContexte[0].defAppuyerEmplacement(key, callback);
}

/**
 * Removes functions added to a key.
 * @param {string} key 
 */
export function unbindKeyBoard(key) {
    assertType(key, "string", "key");
    delete getClavier().instance.listeContexte[0].indexFonctionAppuiEmplacement[k];
}