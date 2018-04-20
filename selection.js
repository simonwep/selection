/**
 * Selection
 * @author	Simon Reinisch
 * @license MIT
 */

(function selectionModule(factory) {
    'use strict';

    if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
        module.exports = factory();
    } else if (typeof window !== 'undefined' && window.document) {
        window['Selection'] = factory();
    } else {
        throw new Error('selection.js requires a window with a document');
    }

})(function selectionFactory() {
    'use strict';

    // Constants
    const captureMode = false;

    let areaElement = (() => {
            const ae = document.createElement('div');
            ae.style.position = 'absolute';

            _css(ae, {
                top: 0,
                left: 0,
                position: 'fixed'
            });

            document.body.appendChild(ae);
            return ae;
        })(),
        abs = Math.abs,
        max = Math.max,
        min = Math.min;

    function Selection(options) {
        this.options = options ? options : {};

        // Default options
        let defaults = {
            class: 'selection-area',
            startThreshold: 0,
            disableTouch: false,
            containers: [],
            selectables: []
        };

        // Set default options
        for (let name in defaults) {
            !(name in options) && (options[name] = defaults[name]);
        }

        // Bind all private methods
        for (let fn in this) {
            if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
                this[fn] = this[fn].bind(this);
            }
        }


        // Bind events
        _on(document, 'mousedown', this._onTapStart);

        if (!this.options.disableTouch) {
            _on(document, 'touchstart', this._onTapStart);
        }
    }

    Selection.prototype = {
        constructor: Selection,

        _onTapStart(evt) {
            const touch = evt.touches && evt.touches[0];
            const target = (touch || evt).target;

            if (_dispatchFilterEvent(this, 'startFilter', target) === false) {
                return;
            }

            // Save start coordinates
            this._lastX = (touch || evt).clientX;
            this._lastY = (touch || evt).clientY;

            this._containers = _selectAll(this.options.containers);
            this._selectables = _selectAll(this.options.selectables);

            this._touchedElements = [];
            this._changedElements = {
                added: [],
                removed: []
            };


            // Add class to the area element
            areaElement.classList.add(this.options.class);

            this._updatePosition(evt);
            _on(document, 'mousemove', this._delayedTapMove);
            _on(document, 'touchmove', this._delayedTapMove);

            _on(document, 'mouseup', this._onTapStop);
            _on(document, 'touchcancel', this._onTapStop);
            _on(document, 'touchend', this._onTapStop);

            _dispatchEvent(this, 'onStart', areaElement, evt, this._touchedElements, this._changedElements);
        },

        _delayedTapMove(evt) {
            const touch = evt.touches && evt.touches[0];
            const x = (touch || evt).clientX;
            const y = (touch || evt).clientY;

            if (abs((x + y) - (this._lastX + this._lastY)) >= this.options.startThreshold) {

                _off(document, 'mousemove', this._delayedTapMove);
                _off(document, 'touchmove', this._delayedTapMove);

                _on(document, 'mousemove', this._onTapMove);
                _on(document, 'touchmove', this._onTapMove);

                _css(areaElement, 'display', 'block');
            }
        },

        _onTapMove(evt) {
            this._updatePosition(evt);
            this._updatedTouchingElements();
            const touched = this._touchedElements;
            const changed = this._changedElements;
            _dispatchEvent(this, 'onMove', areaElement, evt, touched, changed);
        },

        _updatePosition(evt) {
            const touch = evt.touches && evt.touches[0];
            const x2 = (touch || evt).clientX;
            const y2 = (touch || evt).clientY;

            const x3 = min(this._lastX, x2);
            const y3 = min(this._lastY, y2);
            const x4 = max(this._lastX, x2);
            const y4 = max(this._lastY, y2);

            _css(areaElement, {
                top: y3,
                left: x3,
                width: x4 - x3,
                height: y4 - y3
            });
        },

        _onTapStop(evt, noevent) {
            _css(areaElement, 'display', 'none');

            _off(document, 'mousemove', this._delayedTapMove);
            _off(document, 'touchmove', this._delayedTapMove);

            _off(document, 'mouseup', this._onTapStop);
            _off(document, 'touchcancel', this._onTapStop);
            _off(document, 'touchend', this._onTapStop);


            if (!noevent) {
                this._updatedTouchingElements();
                const touched = this._touchedElements;
                const changed = this._changedElements;
                _dispatchEvent(this, 'onStop', areaElement, evt, touched, changed);
            }
        },

        _updatedTouchingElements() {
            const touched = [];
            const changed = {
                added: [],
                removed: []
            };

            const check = ((node) => {
                if (_dispatchFilterEvent(this, 'selectionFilter', node) !== false) {

                    if (_intersects(areaElement, node)) {

                        // Check if the element wasn't present in the last selection.
                        if (!this._touchedElements.includes(node)) {
                            changed.added.push(node);
                        }

                        touched.push(node);
                    }

                }
            }).bind(this);

            // Traverse trought the containers
            _traverseNode(this._containers, check);

            // Itreate over the selectable elements
            this._selectables.forEach(check);

            // Check which elements where removed since lase selection
            const touchedElements = this._touchedElements;
            for (let i = touchedElements.length - 1; i >= 0; i--) {
                let el = touchedElements[i];
                if (!touched.includes(el)) {
                    changed.removed.push(el);
                }
            }

            // Save 
            this._touchedElements = touched;
            this._changedElements = changed;
        },

        _nulling() {

        },

        /**
         * Cancel the current selection process.
         * @param   {boolean} true to fire the onStop listener after cancel
         */
        cancel(keepEvent) {
            this._onTapStop(null, !keepEvent);
        },

        /**
         * Set or get an option.
         * @param   {string} name
         * @param   {*}      value
         * @return  {*}      the new value
         */
        option(name, value) {
            const options = this.options;

            if (value === void 0)
                return options[name];

            return options[name] = value;
        },

        /**
         * Disable the selection functinality.
         */
        disable() {
            _off(document, 'mousedown', this._onTapStart);
        },

        /**
         * Disable the selection functinality.
         */
        enable() {
            _on(document, 'mousedown', this._onTapStart);
        }
    }

    function _on(el, event, fn) {
        el.addEventListener(event, fn, captureMode);
    }

    function _off(el, event, fn) {
        el.removeEventListener(event, fn, captureMode);
    }

    function _css(el, attr, val) {
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
                    attr = `-webkit-${attr}`;
                }

                style[attr] = val + (typeof val === 'string' ? '' : 'px');
            }
        }
    }

    function _traverseNode(node, fn) {
        if (!Array.isArray(node))
            node = [node];

        for (let n of node) {
            traverse(n);
        }

        function traverse(n) {
            for (let child of n.children) {
                fn(child);
                traverse(child, fn);
            }
        }
    }

    function _intersects(ela, elb) {
        const a = ela.getBoundingClientRect();
        const b = elb.getBoundingClientRect();
        return a.x + a.width >= b.x && a.x <= b.x + b.width && a.y + a.height >= b.y && a.y <= b.y + b.height;
    }

    function _dispatchFilterEvent(selection, name, node) {
        const event = selection.options[name];

        if (typeof event === 'function') {

            const evt = {
                selection: selection,
                eventName: name,
                element: node
            };

            return event.call(selection, evt);
        }
    }

    function _dispatchEvent(selection, name, ae, originalEvt, selected, changed) {
        const event = selection.options[name];

        if (typeof event === 'function') {
            const evt = {
                selection: selection,
                eventName: name,
                areaElement: ae,
                selectedElements: selected,
                changedElements: changed,
                originalEvent: originalEvt
            };

            return event.call(selection, evt);
        }
    }

    function _selectAll(selector) {
        if (!Array.isArray(selector))
            selector = [selector];

        const nodes = [];
        for (let sel of selector) {
            nodes.push(...document.querySelectorAll(sel));
        }

        return nodes;
    }

    // Export utils
    Selection.utils = {
        on: _on,
        off: _off,
        css: _css,
        intersects: _intersects,
        traverseNode: _traverseNode,
        selectAll: _selectAll
    };

    /**
     * Create selection instance
     * @param {Object} [options]
     */
    Selection.create = (options) => new Selection(options);

    // Export
    Selection.version = '0.0.1';
    return Selection;
});
