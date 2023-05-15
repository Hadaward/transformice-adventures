import { getSessionData, loadOrCreateSession } from "./internal/data.js";
import { T_MOD_INFO } from "./internal/templates.js";
import { assert, assertType, clone, protect, splitStringVersion, version2String } from "./internal/utils.js";
import { EventCollection } from "./tapl.js";
import { Events } from "./tapl.js";

export * from "./internal/events.js";
export * from "./internal/keyboard.js";

const loader = {
    classes: new Map(),
    info: {
        baseURL: new URL('..', import.meta.url).href,
        patched: false,
        patch: null,
        initialized: false
    },
    failedModLoads: new Map()
}

/**
 * Contains basic information about the loader
 */
export const LoaderInfo = new Proxy(loader.info, {
    set() { return false },
    get(self, property) {
        if (typeof self[property] === 'object' && self[property] !== null)
            return protect(self[property])

        return clone(self[property]);
    },
    deleteProperty() {
        return false;
    },
    defineProperty() {
        return false;
    },
    isExtensible() {
        return false;
    },
    setPrototypeOf() {
        return false;
    }
});

/**
 * Attempts to get the registered class with the name.
 * @see Recommended usage only by loader internal code. Use at your own risk.
 * @returns Transformice Class
 * @throws {ReferenceError|TypeError}  It can throw an exception in case of: *class not found* or *if the parameters do not have the expected types*.
 */
export function getTransformiceClass(name) {
    assertType(name, "string", "name");
    assert(loader.classes.has(name), `Could not find class ${name}`, ReferenceError);
    return loader.classes.get(name);    
}

/**
 * Adds a class to look for in the pre-init stage of the patch.
 * @see Only use it if you know what you're doing. Adding an invalid class will cause EVENT_INIT to never fire as the patch will be trying to find this class.
 * @param {object} data
 * @param {string} data.name
 * @param {string} data.path
 * @param {string} data.exports
 */
export function doFindTransformiceClass(data) {
    assertType(data, "object", "data");
    assertType(data.name, "string", "data.name");
    assertType(data.path, "string", "data.path");
    assertType(data.exports, "string", "data.exports");
    assert(!loader.info.initialized, "The EVENT_INIT event has already fired, it is no longer possible to search for classes.", Error);

    if (loader.info.patch.classes.find(classData => classData.name === data.name && classData.path === data.path && classData.exports === data.exports)) {
        return;
    }

    loader.info.patch.classes.push({
        name: data.name,
        path: data.path,
        exports: data.exports
    });
}

/**
 * Finds a Transformice class according to the modules loaded at the injection point.
 * @returns boolean indicating whether it has already finished looking for classes.
 * @fires EVENT_INIT
 */
export function findTransformiceClass([params, defargs]) {
    assertType(params, "object", "params");
    assert(Array.isArray(params), `(params) ${String(params)} expected to be a array of string but got ${typeof params}`, TypeError);
    params.forEach((property, index) => assertType(property, "string", `params[${index}]`));

    assertType(defargs, "object", "defargs");
    assert(Array.isArray(defargs), `(defargs) ${String(defargs)} expected to be a array of instances but got ${typeof defargs}`, TypeError);

    const lookingFor = loader.info.patch.classes.filter(classData => !loader.classes.has(classData.name));

    if (lookingFor.length === 0 && loader.classes.length > 0) {
        console.log("%cAll Transformice classes loaded!", "color:green");
        return false;
    }

    for (const classData of lookingFor) {
        const result = defargs[params.indexOf(params.find(p => p.endsWith(classData.path)))];

        if (result && result[classData.exports]) {
            loader.classes.set(classData.name, result[classData.exports]);
        }
    }

    if (loader.info.patch.classes.every(classData => loader.classes.has(classData.name))) {
        loader.info.initialized = true;
        console.log(`%cFound ${loader.classes.size} transformice classes:`, "color:green", [...loader.classes.keys()]);
        Events.dispatchEvent(EventCollection.EVENT_INIT);
        return false;
    }

    return true;
}

async function loadMod(mod) {
    assertType(mod, "object", "mod");
    assertType(mod.url, "string", "mod.url");
    assertType(mod.enabled, "boolean", "mod.enabled");

    const modURL = mod.url.replace(/\$baseURL\//g, loader.info.baseURL);

    if (!mod.enabled) {
        console.warn(`There was an attempt to load a disabled mod: ${modURL}`);
        return;
    }

    try {
        const infoResponse = await fetch(modURL);
        const info = Object.assign(T_MOD_INFO(), await infoResponse.json())['@unlocked'];

        if (info.loader) {
            if (info.loader.min_version) {
                const loaderVersion = loader.info.patch.version;
                const minLoaderVersion = splitStringVersion(info.loader.min_version);

                assert(loaderVersion.major >= minLoaderVersion.major && loaderVersion.minor >= minLoaderVersion.minor && loaderVersion.patch >= minLoaderVersion.patch, `Could not load mod '${info.name}' because it requires a patch version greater than or equal to ${info.loader.min_version} and the current version is ${version2String(loader.info.patch.version)}.`, Error)
            }

            if (info.loader.max_version) {
                const loaderVersion = loader.info.patch.version;
                const maxLoaderVersion = splitStringVersion(info.loader.max_version);

                assert(loaderVersion.major <= maxLoaderVersion.major && loaderVersion.minor <= maxLoaderVersion.minor && loaderVersion.patch <= maxLoaderVersion.patch, `Could not load mod '${info.name}' because it requires a patch version older than or equal to ${info.loader.max_version} and the current version is ${version2String(loader.info.patch.version)}.`, Error)
            }
        }

        await import(new URL(`./${info.entry_point}`, modURL));

        console.info(`%cLoaded mod %c${info.author} %c${info.name} %cv${info.version}`, "color:green", "color:magenta", "color:blue", "color:orange")
    } catch (error) {
        console.warn(`Mod error ${modURL}\n\t${error.stack}`)
        loader.failedModLoads.set(mod, error);
    }
}

/**
 * Starts loading patch information and mods.
 * @fires EVENT_PRE_INIT
 */
export async function initPatch() {
    if (loader.info.patched) {
        console.warn('patch has already been run previously, calling it again will do nothing.');
        return;
    }

    loader.info.patched = true;

    const infoResponse = await fetch(`${loader.info.baseURL}/patch-info.json?d=${Date.now()}`);
    loader.info.patch = await infoResponse.json();
    console.info("%cPatch info just loaded", "color:green");

    loadOrCreateSession({
        lastPatchVersion: loader.info.patch.version,
        mods: loader.info.patch.defaultMods.length > 0 && loader.info.patch.defaultMods.map(url => ({enabled: true, url})) || []
    });

    for (const mod of getSessionData("mods")) {
        await loadMod(mod);
    }

    Events.dispatchEvent(EventCollection.EVENT_PRE_INIT);
    Events.addEventListener(EventCollection.EVENT_INIT, function() {
        const TFMAdventure = getTransformiceClass("TFMAdventure");
        
        const authentification = TFMAdventure.prototype.authentification.bind(TFMAdventure.instance);
        TFMAdventure.prototype.authentification = (...args) => {
            authentification(...args);
            Events.dispatchEvent(EventCollection.EVENT_LOGIN, ...args);
        }

        console.info(`%cPatch v${version2String(loader.info.patch.version)} initialized.`, "color:green");
    });
}