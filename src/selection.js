/**
 * Selection, library to realize visual DOM-Selection like on your Desktop.
 *
 * @author  Simon Reinisch
 * @license MIT
 */

// Import utils
import * as _ from './utils';

// Some var shorting for better compression and readability
const {abs, max, min} = Math;
const doc = document;
const preventDefault = e => e.preventDefault();

function Selection(options = {}) {

    const that = {

        options: Object.assign({
            class: 'selection-area',

            mode: 'touch',
            startThreshold: 10,
            singleClick: true,
            disableTouch: false,

            validateStart: () => true,

            containers: [],
            selectables: [],

            startareas: ['html'],
            boundaries: ['html']
        }, options),

        // Store for keepSelection
        _selectedStore: [],

        // Create area element
        _areaElement: doc.createElement('div'),

        _init() {

            // Append area to body
            doc.body.appendChild(that._areaElement);

            // Apply basic styles to the area element
            _.css(that._areaElement, {
                top: 0,
                left: 0,
                position: 'fixed'
            });

            that.enable();
        },

        _bindStartEvents(type) {
            _[type](doc, 'mousedown', that._onTapStart);

            if (!that.options.disableTouch) {
                _[type](doc, 'touchstart', that._onTapStart, {
                    passive: false
                });
            }
        },

        _onTapStart(evt) {
            const {x, y, target} = _.simplifyEvent(evt);

            // Check mouse middleware
            if (!that.options.validateStart(evt)) {
                return;
            }

            // Find start-areas and boundaries
            const startAreas = _.selectAll(that.options.startareas);
            that._boundaries = _.selectAll(that.options.boundaries);

            // Check if area starts in one of the start areas / boundaries
            const evtpath = _.eventPath(evt);
            if (!startAreas.find(el => evtpath.includes(el)) ||
                !that._boundaries.find(el => evtpath.includes(el))) {
                return;
            }

            // Save start coordinates
            that._lastX = x;
            that._lastY = y;
            that._singleClick = true; // To detect single-click

            // Resolve selectors
            const containers = _.selectAll(that.options.containers);
            that._selectables = _.selectAll(that.options.selectables);
            containers.forEach(con => that._selectables.push(...con.getElementsByTagName('*')));

            // Save current boundary
            that._targetBoundary = that._boundaries.find(el => _.intersects(el, target)).getBoundingClientRect();
            that._touchedElements = [];
            that._changedElements = {
                added: [],
                removed: []
            };

            // Add class to the area element
            that._areaElement.classList.add(that.options.class);

            // Prevent default select event
            _.on(doc, 'selectstart', preventDefault);

            // Add listener
            _.on(doc, 'mousemove', that._delayedTapMove);
            _.on(doc, 'touchmove', that._delayedTapMove, {
                passive: false
            });

            _.on(doc, ['mouseup', 'touchcancel', 'touchend'], that._onTapStop);
            evt.preventDefault();
        },

        _onSingleTap(evt) {
            let {target} = _.simplifyEvent(evt);

            // Traferse dom upwards to check if target is selectable
            while (!that._selectables.includes(target)) {
                if (target.parentElement) {
                    target = target.parentElement;
                } else {
                    return;
                }
            }

            that._touchedElements.push(target);
            that._dispatchEvent('onSelect', evt, {
                target
            });
        },

        _delayedTapMove(evt) {
            const {x, y} = _.simplifyEvent(evt);

            // Check pixel threshold
            if (abs((x + y) - (that._lastX + that._lastY)) >= that.options.startThreshold) {

                _.off(doc, ['mousemove', 'touchmove'], that._delayedTapMove);
                _.on(doc, ['mousemove', 'touchmove'], that._onTapMove);
                _.css(that._areaElement, 'display', 'block');

                // New start position
                that._updateArea(evt);

                // Fire event
                that._dispatchEvent('onStart', evt);

                // An action is recognized as single-select until
                // the user performed a mutli-selection
                that._singleClick = false;
            }
        },

        _onTapMove(evt) {
            that._updateArea(evt);
            that._updatedTouchingElements();
            that._dispatchEvent('onMove', evt);
        },

        _updateArea(evt) {
            const brect = that._targetBoundary;
            let {x, y} = _.simplifyEvent(evt);

            if (x < brect.left) x = brect.left;
            if (y < brect.top) y = brect.top;
            if (x > brect.left + brect.width) x = brect.left + brect.width;
            if (y > brect.top + brect.height) y = brect.top + brect.height;

            const x3 = min(that._lastX, x);
            const y3 = min(that._lastY, y);
            const x4 = max(that._lastX, x);
            const y4 = max(that._lastY, y);

            _.css(that._areaElement, {
                top: y3,
                left: x3,
                width: x4 - x3,
                height: y4 - y3
            });
        },

        _onTapStop(evt, noevent) {

            // Remove event handlers
            _.off(doc, ['mousemove', 'touchmove'], that._delayedTapMove);
            _.off(doc, ['touchmove', 'mousemove'], that._onTapMove);
            _.off(doc, ['mouseup', 'touchcancel', 'touchend'], that._onTapStop);

            if (that._singleClick && that.options.singleClick) {
                that._onSingleTap(evt);
            } else if (!noevent) {
                that._updatedTouchingElements();
                that._dispatchEvent('onStop', evt);
            }

            // Enable default select event
            _.off(doc, 'selectstart', preventDefault);
            _.css(that._areaElement, 'display', 'none');
        },

        _updatedTouchingElements() {
            const touched = [];
            const changed = {added: [], removed: []};

            // Itreate over the selectable elements
            for (let i = 0, n = that._selectables.length; i < n; i++) {
                const node = that._selectables[i];

                // Check if area intersects element
                if (_.intersects(that._areaElement, node, that.options.mode)) {

                    // Fire filter event
                    if (that._dispatchFilterEvent('selectionFilter', node) !== false) {

                        // Check if the element wasn't present in the last selection.
                        if (!that._touchedElements.includes(node)) {
                            changed.added.push(node);
                        }

                        touched.push(node);
                    }
                }
            }

            // Check which elements where removed since last selection
            changed.removed = that._touchedElements.filter(el => !touched.includes(el));

            // Save
            that._touchedElements = touched;
            that._changedElements = changed;
        },

        _dispatchFilterEvent(eventName, element) {
            const event = that.options[eventName];

            // Validate function
            if (typeof event === 'function') {
                return event.call(that, {selection: that, eventName, element});
            }
        },

        _dispatchEvent(eventName, originalEvent, additional) {
            const event = that.options[eventName];

            // Validate function
            if (typeof event === 'function') {
                return event.call(that, {
                    selection: that,
                    areaElement: that._areaElement,
                    selectedElements: that._touchedElements.concat(that._selectedStore),
                    changedElements: that._changedElements,
                    eventName,
                    originalEvent,
                    ...additional
                });
            }
        },

        /**
         * Saves the current selection for the next selecion.
         * Allows multiple selections.
         */
        keepSelection() {
            const keep = that._touchedElements.filter(x => !that._selectedStore.includes(x));
            that._selectedStore = keep.concat(that._selectedStore);
        },

        /**
         * Clear the elements which where saved by 'keepSelection()'.
         */
        clearSelection() {
            that._selectedStore = [];
        },

        /**
         * Removes an particular element from the selection.
         */
        removeFromSelection(el) {
            _.removeElement(that._selectedStore, el);
            _.removeElement(that._touchedElements, el);
        },

        /**
         * @returns {Array} Selected elements
         */
        getSelection() {
            return that._selectedStore;
        },

        /**
         * Cancel the current selection process.
         * @param  {boolean} true to fire the onStop listener after cancel.
         */
        cancel(keepEvent) {
            that._onTapStop(null, !keepEvent);
        },

        /**
         * Set or get an option.
         * @param   {string} name
         * @param   {*}      value
         * @return  {*}      the new value
         */
        option(name, value) {
            const {options} = that;
            return value == null ? options[name] : (options[name] = value);
        },

        /**
         * Disable the selection functinality.
         */
        disable() {
            that._bindStartEvents('off');
        },

        /**
         * Unbinds all events and removes the area-element
         */
        destroy() {
            that.disable();
            doc.body.removeChild(that._areaElement);
        },

        /**
         * Disable the selection functinality.
         */
        enable() {
            that._bindStartEvents('on');
        }
    };

    // Initialize
    that._init();

    return that;
}

// Export utils
Selection.utils = {
    on: _.on,
    off: _.off,
    css: _.css,
    intersects: _.intersects,
    selectAll: _.selectAll,
    eventPath: _.eventPath,
    removeElement: _.removeElement
};

/**
 * Create selection instance
 * @param {Object} [options]
 */
Selection.create = options => new Selection(options);

// Set version
Selection.version = '0.1.4';

// Export API
module.exports = Selection;
