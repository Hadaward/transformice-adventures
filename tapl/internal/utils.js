/**
 * @param {string} version 
 * @returns a object representing the string object
 * @example
 * const objVersion = splitStringVersion("0.1.2")
 * console.log(objVersion); // {major: 0, minor: 1, patch: 2}
 */
export function splitStringVersion(version) {
    assertType(version, "string", "version");
    const splited = version.split(".");

    return {
        major: Number(splited[0] || 0),
        minor: Number(splited[1] || 0),
        patch: Number(splited[2] || 0)
    }
}

/**
 * @param {object} version 
 * @property {number} version.major
 * @property {number} version.minor
 * @property {number} version.patch
 * @returns a string representing the version object
 * @example
 * const strVersion = version2String({major: 0, minor: 1, patch: 2})
 * console.log(strVersion); // 0.1.2
 */
export function version2String(version) {
    assertType(version, "object", "version");
    assert(version !== null, `object must not be null`, TypeError);
    return `${version.major||0}.${version.minor||0}.${version.patch||0}`;
}

/**
 * Asserts a condition, generating an error if it is not met.
 * @param {boolean} condition 
 * @param {string} message 
 * @param {Error} errorConstructor 
 * @example
 * assert(false, "This sould throw an reference error", ReferenceError);
 */
export function assert(condition, message, errorConstructor) {
    if (typeof condition !== "boolean")
        throw new TypeError(`(condition) ${String(condition)} expected to be boolean but got ${typeof condition}`);
    else if (typeof message !== "string")
        throw new TypeError(`(message) ${String(message)} expected to be a string but got ${typeof message}`);
    else if (typeof errorConstructor !== "function" || (errorConstructor !== Error && errorConstructor.__proto__ !== Error)) {
        throw new TypeError(`(errorConstructor) ${String(errorConstructor)} expected to be a instance of Exception but got ${typeof errorConstructor}`);
    }

    if (!condition)
        throw new errorConstructor(message);
}

/**
 * Asserts a type, generating a type error if the type is not the expected one.
 * @param {any} value 
 * @param {string} expectedType
 * @example
 * assertType("1", "number", "myNumber"); // should throw TypeError('(myNumber) 1 expected to be number but got string');
 */
export function assertType(value, expectedType, valueName = "value") {
    assert(typeof expectedType === "string", `(expectedType) ${String(expectedType)} expected to be a string but got ${typeof expectedType}`, TypeError);
    assert(typeof valueName === "string", `(valueName) ${String(valueName)} expected to be a string but got ${typeof valueName}`, TypeError);
    assert(typeof value === expectedType, `(${valueName}) ${String(value)} expected to be ${expectedType} but got ${typeof value}`, TypeError);
}

/**
 * Use structuredClone if available, otherwise use JSON for cloning.
 * @param {any} value 
 * @returns the clone of some value
 */
export function clone(value) {
    if (window.structuredClone !== undefined)
        return structuredClone(value);
    else
        return JSON.parse(JSON.stringify(value));
}

/**
 * Creates an accessibility object from the original object. This object does not allow creating new properties as well as it is not possible to delete properties, only change or read them. Properties are also type-safe, i.e. they will not be changed to a different type. To get the original object from an accessibility object, access the **@unlocked** property.
 * @param {object} object 
 * @returns an accessibility object
 */
export function lock(object) {
    assertType(object, "object", "object");
    assert(object !== null, `object must not be null`, TypeError);

    const locked = new Proxy(object, {
        set(target, property, value) {
            if (target.hasOwnProperty(property) && typeof target[property] === typeof value) {
                target[property] = value;
            }

            return true;
        },
        get(target, property) {
            if (property === '@unlocked')
                return target;
            return target[property];
        },
        deleteProperty() {
            return false;
        },
        defineProperty() {
            return false;
        },
        getPrototypeOf(target) {
            return target;
        }
    })

    return locked;
}

/**
 * Creates a protected object that does not inherit methods from prototypes or the original object and is intended to provide a clone of owned properties and their values.
 * @param {Object} object 
 * @returns a new object without a prototype and containing only a clone of the internal values.
 */
export function protect(object) {
    assertType(object, "object", "object");
    assert(object !== null, `object must not be null`, TypeError);

    const obj = Object.create(null);
    const iteratable = object[Symbol.iterator] && object[Symbol.iterator]() || Object.entries(object);

    for (const [key, value] of iteratable) {
        if (typeof value !== 'function')
            obj[key] = (typeof value === 'object' && value !== null) && protect(value) || clone(value);
    }
        
    return obj;
}

/**
 * Optional chaining operator polyfill (?.) takes a list of properties and chains until the last property or until it encounters undefined.
 * @param {Array<string>} chain 
 * @param {object} object 
 * @param {function} callback 
 * @returns If the final result is not undefined and a callback is passed as a parameter, the callback is called returning the value returned from the callback, otherwise the value found is returned, whether undefined or not.
 * @example
 * const root = {
 *  foo = {
 *    bar = { value: "Hello world" }
 *  }
 * }
 * console.log(optionalChain(["foo", "bar", "value"], root)); // "Hello world"
 * console.log(optionalChain(["foo", "baz", "value"], root)); // undefined
 * console.log(
 *  optionalChain(["foo", "bar", "value"], root, value => {
 *      assertType(value, "string", "root.foo.bar.value");
 *      return value.split(" ")[0];
 *  })
 * ); // "Hello"
 */
export function optionalChain(chain, object, callback) {
    assertType(chain, "object", "chain");

    assert(Array.isArray(chain), `(chain) ${String(chain)} expected to be a array of string but got ${typeof chain}`, TypeError);
    chain.forEach((property, index) => assertType(property, "string", `chain[${index}]`));

    if (object === undefined)
        return;

    assertType(object, "object", "object");
    assert(object !== null, `object must not be null.`, TypeError);

    assert(["undefined", "function"].includes(typeof callback), `(callback) ${String(callback)} expected to be a function or undefined but got ${typeof callback}`, TypeError);

    if (callback !== undefined && callback.prototype && String(callback.prototype.constructor).startsWith('class'))
        throw new TypeError('callback must be a function, not a class.');
        
    for (const prop of chain) {
        object = object[prop];

        if (typeof object === 'undefined')
            break;
    }
    return typeof callback === 'function' && typeof object !== 'undefined' ? callback(object) : object;
}