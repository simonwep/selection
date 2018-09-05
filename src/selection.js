/**
 * Selection, library to realize visual DOM-Selection like on your Desktop.
 *
 * @author  Simon Reinisch
 * @license MIT
 */

import * as _ from './utils';

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
        _areaElement: _.createElement('div', doc.body),

        _init() {
            _.css(that._areaElement, {
                top: 0,
                left: 0,
                position: 'fixed'
            });

            // Bind events
            _.on(doc, 'mousedown', that._onTapStart);

            // Check if touch is disabled
            if (!that.options.disableTouch) {
                _.on(doc, 'touchstart', that._onTapStart, {
                    passive: false
                });
            }
        },

        _onTapStart(evt) {

            // Check mouse middleware
            if (!that.options.validateStart(evt)) {
                return;
            }

            const touch = evt.touches && evt.touches[0];
            const target = (touch || evt).target;

            const startAreas = _.selectAll(that.options.startareas);
            that._boundaries = _.selectAll(that.options.boundaries);

            const evtpath = _.eventPath(evt);
            if (!startAreas.find(el => evtpath.includes(el)) ||
                !that._boundaries.find(el => evtpath.includes(el))) {
                return;
            }

            // Save start coordinates
            that._lastX = (touch || evt).clientX;
            that._lastY = (touch || evt).clientY;
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
            const touch = evt.touches && evt.touches[0];
            const target = (touch || evt).target;

            // Check if the element is selectable
            if (!that._selectables.includes(target)) return;

            that._touchedElements.push(target);
            const touched = that._selectedStore;
            const changed = that._changedElements;

            that._dispatchEvent('onSelect', that._areaElement, evt, touched, changed, {
                target
            });
        },

        _delayedTapMove(evt) {
            const touch = evt.touches && evt.touches[0];
            const x = (touch || evt).clientX;
            const y = (touch || evt).clientY;

            // Check pixel threshold
            if (abs((x + y) - (that._lastX + that._lastY)) >= that.options.startThreshold) {

                _.off(doc, ['mousemove', 'touchmove'], that._delayedTapMove);
                _.on(doc, ['mousemove', 'touchmove'], that._onTapMove);
                _.css(that._areaElement, 'display', 'block');

                // New start position
                that._updateArea(evt);

                // Fire event
                const touched = that._touchedElements.concat(that._selectedStore);
                const changed = that._changedElements;
                that._dispatchEvent('onStart', that._areaElement, evt, touched, changed);

                // An action is recognized as single-select until
                // the user performed an mutli-selection
                that._singleClick = false;
            }
        },

        _onTapMove(evt) {
            that._updateArea(evt);
            that._updatedTouchingElements();
            const touched = that._touchedElements.concat(that._selectedStore);
            const changed = that._changedElements;
            that._dispatchEvent('onMove', that._areaElement, evt, touched, changed);
        },

        _updateArea(evt) {
            const brect = that._targetBoundary;
            const touch = evt.touches && evt.touches[0];
            let x2 = (touch || evt).clientX;
            let y2 = (touch || evt).clientY;

            if (x2 < brect.left) x2 = brect.left;
            if (y2 < brect.top) y2 = brect.top;
            if (x2 > brect.left + brect.width) x2 = brect.left + brect.width;
            if (y2 > brect.top + brect.height) y2 = brect.top + brect.height;

            const x3 = min(that._lastX, x2);
            const y3 = min(that._lastY, y2);
            const x4 = max(that._lastX, x2);
            const y4 = max(that._lastY, y2);

            _.css(that._areaElement, {
                top: y3,
                left: x3,
                width: x4 - x3,
                height: y4 - y3
            });
        },

        _onTapStop(evt, noevent) {
            _.off(doc, ['mousemove', 'touchmove'], that._delayedTapMove);
            _.off(doc, ['touchmove', 'mousemove'], that._onTapMove);
            _.off(doc, ['mouseup', 'touchcancel', 'touchend'], that._onTapStop);

            if (that._singleClick) {
                that._onSingleTap(evt);
            } else if (!noevent) {

                that._updatedTouchingElements();
                const touched = that._touchedElements.concat(that._selectedStore);
                const changed = that._changedElements;
                that._dispatchEvent('onStop', that._areaElement, evt, touched, changed);
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

        _dispatchEvent(eventName, areaElement, originalEvent, selectedElements, changedElements, additional) {
            const event = that.options[eventName];

            // Validate function
            if (typeof event === 'function') {
                return event.call(that, {
                    selection: that,
                    eventName,
                    areaElement,
                    selectedElements,
                    changedElements,
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
            _.off(doc, 'mousedown', that._onTapStart);
        },

        /**
         * Disable the selection functinality.
         */
        enable() {
            _.on(doc, 'mousedown', that._onTapStart);
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
Selection.version = '0.1.2';

// Export API
module.exports = Selection;
