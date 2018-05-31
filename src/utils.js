/**
 * Utils module for DOM-Actions.
 */

// Constants
const captureMode = false;
const cssPrefixes = ['-moz-', '-ms-', '-o-', '-webkit-'];

/**
 * Attach a event listener to a DOM-Element.
 * @param el The DOM-Element.
 * @param event The event name.
 * @param fn Callback function.
 * @param options Optional options.
 */
export function on(el, event, fn, options = {}) {
    el.addEventListener(event, fn, {
        capture: captureMode,
        ...options
    });
}

/**
 * Remove a event listener from a DOM-Element.
 * @param el The DOM-Element.
 * @param event The event name.
 * @param fn Callback function.
 * @param options Optional options.
 */
export function off(el, event, fn, options = {}) {
    el.removeEventListener(event, fn, {
        capture: captureMode,
        ...options
    });
}

/**
 * Add css to a DOM-Element or returns the current
 * value of a property.
 *
 * @param el The DOM-Element.
 * @param attr The attribute or a object which holds css key-properties.
 * @param val The value for a single attribute.
 * @returns {*}
 */
export function css(el, attr, val) {
    const style = el && el.style;

    if (style) {

        if (typeof attr === 'object') {

            const props = Object.getOwnPropertyNames(attr);

            for (let prop of props) {
                let val = attr[prop];
                style[prop] = val + (typeof val === 'string' ? '' : 'px');
            }

        } else if (val === void 0) {

            if (document.defaultView && document.defaultView.getComputedStyle) {
                val = document.defaultView.getComputedStyle(el, null);
            } else if (el.currentStyle) {
                val = el.currentStyle;
            }

            return prop === void 0 ? val : val[attr];
        } else {

            if (!(attr in style)) {
                for (let pref of cssPrefixes) {
                    style[pref + attr] = val + (typeof val === 'string' ? '' : 'px');
                }
            } else {
                style[attr] = val + (typeof val === 'string' ? '' : 'px');
            }
        }
    }
}

/**
 * Check if two DOM-Elements intersects each other.
 * @param ela First DOM-Element.
 * @param elb Second DOM-Element.
 * @returns {boolean} If both elements intersects each other.
 */
export function intersects(ela, elb) {
    const a = ela.getBoundingClientRect();
    const b = elb.getBoundingClientRect();
    return a.left + a.width >= b.left && a.left <= b.left + b.width && a.top + a.height >= b.top && a.top <= b.top + b.height;
}

/**
 * Takes a selector (or array of selectors) and returns the matched nodes.
 * @param selector The selector or an Array of selectors.
 * @returns {Array} Array of DOM-Nodes.
 */
export function selectAll(selector) {
    if (!Array.isArray(selector))
        selector = [selector];

    const nodes = [];
    for (let sel of selector) {
        nodes.push(...document.querySelectorAll(sel));
    }

    return nodes;
}

/**
 * Polyfill for safari & firefox for the eventPath event property.
 */
export function eventPath(evt) {
    let path = evt.path || (evt.composedPath && evt.composedPath());
    if (path) return path;

    let el = evt.target.parentElement;

    for (path = [evt.target]; el; el = el.parentElement) {
        path.push(el);
    }

    path.push(document, window);
    return path;
}

/**
 * Removes an element from an Array.
 */
export function removeElement(arr, el) {
    const index = arr.indexOf(el);
    if (~index) {
        arr.splice(index, 1);
    }
}