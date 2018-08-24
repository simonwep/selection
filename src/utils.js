/**
 * Utils module for DOM-Actions.
 */

// Constants
const cssPrefixes = 'moz ms o webkit'.split(' ');

function eventListener(method, elements, events, fn, options = {}) {

    // Normalize array
    if (elements instanceof HTMLCollection || elements instanceof NodeList) {
        elements = Array.from(elements);
    } else if (!Array.isArray(elements)) {
        elements = [elements];
    }

    if (!Array.isArray(events)) events = [events];

    for (const element of elements) {
        for (const event of events) {
            element[method](event, fn, {capture: false, ...options});
        }
    }

    return Array.prototype.slice.call(arguments, 1);
}

/**
 * Add event(s) to element(s).
 * @param elements DOM-Elements
 * @param events Event names
 * @param fn Callback
 * @param options Optional options
 * @return Array passed arguments
 */
export const on = eventListener.bind(null, 'addEventListener');

/**
 * Remove event(s) from element(s).
 * @param elements DOM-Elements
 * @param events Event names
 * @param fn Callback
 * @param options Optional options
 * @return Array passed arguments
 */
export const off = eventListener.bind(null, 'removeEventListener');

/**
 * Binds all functions, wich starts with an underscord, of a es6 class to the class itself.
 * @param context The context
 */
export function bindClassUnderscoreFunctions(context) {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(context));
    for (const fn of methods) {
        if (fn.charAt(0) === '_' && typeof context[fn] === 'function') {
            context[fn] = context[fn].bind(context);
        }
    }
}

const unitify = (val, unit = 'px') =>
    typeof val === 'number' ? val + unit : '' + val;

/**
 * Add css to a DOM-Element or returns the current
 * value of a property.
 *
 * @param el The Element.
 * @param attr The attribute or a object which holds css key-properties.
 * @param val The value for a single attribute.
 * @returns {*}
 */
export function css(el, attr, val) {
    const style = el && el.style;
    if (!style) return;

    if (typeof attr === 'object') {

        for (const prop in attr) {
            const val = attr[prop];
            style[prop] = unitify(val);
        }

    } else if (val == null) {

        const dw = document.defaultView;
        if (dw && dw.getComputedStyle) {
            val = dw.getComputedStyle(el, null);
        } else if (el.currentStyle) {
            val = el.currentStyle;
        }

        return attr == null ? val : val[attr];
    } else {

        if (!(attr in style)) {
            for (const pref of cssPrefixes) {
                style[pref + attr] = unitify(val);
            }
        } else {
            style[attr] = unitify(val);
        }
    }
}

/**
 * Check if two DOM-Elements intersects each other.
 * @param ela First DOM-Element.
 * @param elb Second DOM-Element.
 * @param mode Options are center, cover or touch.
 * @returns {boolean} If both elements intersects each other.
 */
export function intersects(ela, elb, mode = 'touch') {
    const a = ela.getBoundingClientRect();
    const b = elb.getBoundingClientRect();

    if (mode === 'center') {
        const bxc = b.left + b.width / 2;
        const byc = b.top + b.height / 2;

        return bxc >= a.left
            && bxc <= a.left + a.width
            && byc >= a.top
            && byc <= a.top + a.height;
    } else if (mode === 'cover') {
        return b.left >= a.left
            && b.top >= a.top
            && b.left + b.width <= a.left + a.width
            && b.top + b.height <= a.top + a.height;
    } else if (mode === 'touch') {
        return a.left + a.width >= b.left
            && a.left <= b.left + b.width
            && a.top + a.height >= b.top
            && a.top <= b.top + b.height;
    }
}

/**
 * Takes a selector (or array of selectors) and returns the matched nodes.
 * @param selector The selector or an Array of selectors.
 * @returns {Array} Array of DOM-Nodes.
 */
export function selectAll(selector) {
    if (!Array.isArray(selector)) selector = [selector];

    const nodes = [];
    for (const sel of selector) {
        nodes.push(...document.querySelectorAll(sel));
    }

    return nodes;
}

/**
 * Polyfill for safari & firefox for the eventPath event property.
 * @param evt The event object.
 * @return [String] event path.
 */
export function eventPath(evt) {
    let path = evt.path || (evt.composedPath && evt.composedPath());
    if (path) return path;

    let el = evt.target.parentElement;
    path = [evt.target, el];
    while (el = el.parentElement) path.push(el);

    path.push(document, window);
    return path;
}

/**
 * Removes an element from an Array.
 */
export function removeElement(arr, el) {
    const index = arr.indexOf(el);
    if (~index) arr.splice(index, 1);
}

/**
 * Creates a new HTMLElement and, optionally, add it to another element.
 * @param tag
 * @param parent Optional parent element
 * @return {HTMLElement} The new HTMLElement
 *
 */
export function createElement(tag, parent) {
    const element = document.createElement(tag);

    if (parent instanceof Element) {
        parent.appendChild(element);
    }

    return element;
}
