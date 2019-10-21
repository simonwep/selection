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

const unitify = (val, unit = 'px') => typeof val === 'number' ? val + unit : val;

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
    if (style) {
        if (typeof attr === 'object') {

            for (const [key, value] of Object.entries(attr)) {
                style[key] = unitify(value);
            }

        } else if (val && typeof attr === 'string') {
            style[attr] = unitify(val);
        }
    }
}

/**
 * Check if two DOM-Elements intersects each other.
 * @param a BoundingClientRect of the first element.
 * @param b BoundingClientRect of the second element.
 * @param mode Options are center, cover or touch.
 * @returns {boolean} If both elements intersects each other.
 */
export function intersects(a, b, mode) {
    switch (mode || 'touch') {
        case 'center': {
            const bxc = b.left + b.width / 2;
            const byc = b.top + b.height / 2;

            return bxc >= a.left
                && bxc <= a.right
                && byc >= a.top
                && byc <= a.bottom;
        }
        case 'cover': {
            return b.left >= a.left
                && b.top >= a.top
                && b.right <= a.right
                && b.bottom <= a.bottom;
        }
        case 'touch': {
            return a.right >= b.left
                && a.left <= b.right
                && a.bottom >= b.top
                && a.top <= b.bottom;
        }
        default: {
            throw `Unkown intersection mode: ${mode}`;
        }
    }
}

/**
 * Takes a selector (or array of selectors) and returns the matched nodes.
 * @param selector The selector or an Array of selectors.
 * @returns {Array} Array of DOM-Nodes.
 */
export function selectAll(selector) {
    if (!Array.isArray(selector)) {
        selector = [selector];
    }

    const nodes = [];
    for (let i = 0, l = selector.length; i < l; i++) {
        const item = selector[i];

        if (typeof item === 'string') {
            nodes.push(...document.querySelectorAll(item));
        } else if (item instanceof HTMLElement) {
            nodes.push(item);
        }
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

    if (path) {
        return path;
    }

    let el = evt.target;
    for (path = [el]; (el = el.parentElement);) {
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

export function simplifyEvent(evt) {
    const tap = (evt.touches && evt.touches[0] || evt);
    return {
        tap,
        x: tap.clientX,
        y: tap.clientY,
        target: tap.target
    };
}
