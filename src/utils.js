/**
 * Utils module for DOM-Actions.
 */

// Constants
const captureMode = false;
const cssPrefixes = ['-moz-', '-ms-', '-o-', '-webkit-'];

export function on(el, event, fn, options = {}) {
    el.addEventListener(event, fn, {
        capture: captureMode,
        ...options
    });
}

export function off(el, event, fn, options = {}) {
    el.removeEventListener(event, fn, {
        capture: captureMode,
        ...options
    });
}

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

export function intersects(ela, elb) {
    const a = ela.getBoundingClientRect();
    const b = elb.getBoundingClientRect();
    return a.left + a.width >= b.left && a.left <= b.left + b.width && a.top + a.height >= b.top && a.top <= b.top + b.height;
}

export function selectAll(selector) {
    if (!Array.isArray(selector))
        selector = [selector];

    const nodes = [];
    for (let sel of selector) {
        nodes.push(...document.querySelectorAll(sel));
    }

    return nodes;
}

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

export function removeElement(arr, el) {
    const index = arr.indexOf(el);
    if (~index) {
        arr.splice(index, 1);
    }
}