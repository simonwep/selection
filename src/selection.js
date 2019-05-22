/**
 * Selection, library to realize visual DOM-Selection like on your Desktop.
 *
 * @author  Simon Reinisch
 * @license MIT
 */

// Import utils
import * as _ from './utils';

// Some var shorting for better compression and readability
const {abs, max, min, round} = Math;
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

            selectables: [],

            scrollSpeedDivider: 10,

            startareas: ['html'],
            boundaries: ['html'],

            selectionAreaContainer: 'body'
        }, options),

        // Store for keepSelection
        _selectedStore: [],

        // Create area element
        _areaElement: doc.createElement('div'),
        _clippingElement: doc.createElement('div'),

        // Is getting set on movement. Varied.
        _scrollAvailable: true,
        _scrollSpeed: {x: null, y: null},

        // Selection-area parent
        _selectionAreaContainer: null,

        _init() {

            // Append area to container
            if (_.isElement(that.options.selectionAreaContainer)) {
                that._selectionAreaContainer = that.options.selectionAreaContainer;
            } else {
                that._selectionAreaContainer = doc.querySelector(that.options.selectionAreaContainer);
            }

            that._clippingElement.appendChild(that._areaElement);
            that._selectionAreaContainer.appendChild(that._clippingElement);

            // Apply basic styles to the area element
            _.css(that._areaElement, {
                willChange: 'top, left, bottom, right, width, height',
                top: 0,
                left: 0,
                position: 'fixed'
            });

            _.css(that._clippingElement, {
                overflow: 'hidden',
                position: 'fixed',
                transform: 'translate3d(0, 0, 0)', // https://stackoverflow.com/a/38268846
                pointerEvents: 'none',
                zIndex: 1
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
            const targetBoundingClientRect = target.getBoundingClientRect();

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

            // Area start point
            that._areaX1 = x;
            that._areaY1 = y;

            // Area end point
            that._areaX2 = 0;
            that._areaY2 = 0;

            that._singleClick = true; // To detect single-click

            // Check in which container the user currently acts
            that._targetContainer = that._boundaries.find(el =>
                _.intersects(el.getBoundingClientRect(), targetBoundingClientRect)
            );

            if (!that._targetContainer) {
                return;
            }

            that.resolveSelectables();

            // Just saving the boundaries of this container for later
            that._targetBoundary = that._targetContainer.getBoundingClientRect();
            that._touchedElements = [];
            that._changedElements = {
                added: [],
                removed: []
            };

            // Find container and check if it's scrollable
            if (round(that._targetContainer.scrollHeight) !== round(that._targetBoundary.height) ||
                round(that._targetContainer.scrollWidth) !== round(that._targetBoundary.width)) {

                // Indenticates if the user is currently in a scrollable area
                that._scrollAvailable = true;

                // Detect mouse scrolling
                _.on(window, 'wheel', that._manualScroll, {passive: false});

                /**
                 * The selection-area will also cover other element which are
                 * out of the current scrollable parent. So find all elements
                 * which are in the current scrollable element. Later these are
                 * the only selectables instead of all.
                 */
                that._selectables = that._selectables.filter(s => that._targetContainer.contains(s));

                /**
                 * To clip the area, the selection area has a parent
                 * which has exact the same dimensions as the scrollable elemeent.
                 * Now if the area exeeds these boundaries it will be cropped.
                 */
                _.css(that._clippingElement, {
                    top: that._targetBoundary.top,
                    left: that._targetBoundary.left,
                    width: that._targetBoundary.width,
                    height: that._targetBoundary.height
                });

                /**
                 * The area element is relative to the clipping element,
                 * but when this is moved or transformed we need to correct
                 * the positions via a negative margin.
                 */
                _.css(that._areaElement, {
                    marginTop: -that._targetBoundary.top,
                    marginLeft: -that._targetBoundary.left
                });
            } else {
                that._scrollAvailable = false;

                /**
                 * Reset margin and clipping element dimensions.
                 */
                _.css(that._clippingElement, {
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                });

                _.css(that._areaElement, {
                    'margin-top': 0,
                    'margin-left': 0
                });
            }

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

            // Traverse dom upwards to check if target is selectable
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
            if (abs((x + y) - (that._areaX1 + that._areaY1)) >= that.options.startThreshold) {

                _.off(doc, ['mousemove', 'touchmove'], that._delayedTapMove);
                _.on(doc, ['mousemove', 'touchmove'], that._onTapMove);
                _.css(that._areaElement, 'display', 'block');

                // New start position
                that._onTapMove(evt);

                // Fire event
                that._dispatchEvent('onStart', evt);

                // An action is recognized as single-select until
                // the user performed a mutli-selection
                that._singleClick = false;
            }
        },

        _onTapMove(evt) {
            const {x, y} = _.simplifyEvent(evt);
            that._areaX2 = x;
            that._areaY2 = y;

            if (that._scrollAvailable && (that._scrollSpeed.y !== null || that._scrollSpeed.x !== null)) {
                const scon = that._targetContainer;

                // Continous scrolling
                requestAnimationFrame(function scroll() {

                    // Scrolling is not anymore required
                    if (that._scrollSpeed.y === null && that._scrollSpeed.x === null) {
                        return;
                    }

                    /**
                     * If the value exeeds the scrollable area it will
                     * be set to the max / min value. So change only
                     */
                    const {scrollTop, scrollLeft} = scon;

                    // Reduce velocity, use ceil in both directions to scroll at least 1px per frame
                    if (that._scrollSpeed.y !== null) {
                        scon.scrollTop += Math.ceil(that._scrollSpeed.y / that.options.scrollSpeedDivider);
                        that._areaY1 -= scon.scrollTop - scrollTop;
                    }

                    if (that._scrollSpeed.x !== null) {
                        scon.scrollLeft += Math.ceil(that._scrollSpeed.x / that.options.scrollSpeedDivider);
                        that._areaX1 -= scon.scrollLeft - scrollLeft;
                    }

                    /**
                     * We changed the start coordinates ->  redraw the selectiona area
                     * We changed the dimensions of the area element -> re-calc selected elements
                     * The selected elements array has been changed -> fire event
                     */
                    that._redrawArea();
                    that._updatedTouchingElements();
                    that._dispatchEvent('onMove', evt);

                    // Keep scrolling even if the user stops to move his pointer
                    requestAnimationFrame(scroll);
                });
            } else {

                /**
                 * Perform redraw only if scrolling is not active.
                 * If scrolling is active this area is getting re-dragwed by the
                 * anonymized scroll function.
                 */
                that._redrawArea();
                that._updatedTouchingElements();
                that._dispatchEvent('onMove', evt);
            }
        },

        _manualScroll(evt) {
            that._scrollSpeed.y += that.options.scrollSpeedDivider * (evt.wheelDeltaY * -1);
            that._scrollSpeed.x += that.options.scrollSpeedDivider * (evt.wheelDeltaX * -1);
            that._onTapMove(evt);

            // Prevent defaul scrolling behaviour, eg. page scrolling
            evt.preventDefault();
        },

        _redrawArea() {
            const {scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth} = that._targetContainer;
            const brect = that._targetBoundary;
            let x = that._areaX2;
            let y = that._areaY2;

            if (x < brect.left) {
                that._scrollSpeed.x = scrollLeft ? -Math.abs(brect.left - x) : null;
                x = brect.left;
            } else if (x > brect.left + brect.width) {
                that._scrollSpeed.x = scrollWidth - scrollLeft - clientWidth ? Math.abs(brect.left + brect.width - x) : null;
                x = brect.left + brect.width;
            } else {
                that._scrollSpeed.x = null;
            }

            if (y < brect.top) {
                that._scrollSpeed.y = scrollTop ? -Math.abs(brect.top - y) : null;
                y = brect.top;
            } else if (y > brect.top + brect.height) {
                that._scrollSpeed.y = scrollHeight - scrollTop - clientHeight ? Math.abs(brect.top + brect.height - y) : null;
                y = brect.top + brect.height;
            } else {
                that._scrollSpeed.y = null;
            }

            const x3 = min(that._areaX1, x);
            const y3 = min(that._areaY1, y);
            const x4 = max(that._areaX1, x);
            const y4 = max(that._areaY1, y);

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
            } else if (!that._singleClick && !noevent) {
                that._updatedTouchingElements();
                that._dispatchEvent('onStop', evt);
            }

            // Reset scroll speed
            that._scrollSpeed = {x: null, y: null};

            // Unbind mouse scrolling listener
            _.off(window, 'wheel', that._manualScroll);

            // Enable default select event
            _.off(doc, 'selectstart', preventDefault);
            _.css(that._areaElement, 'display', 'none');
        },

        _updatedTouchingElements() {
            const touched = [];
            const changed = {added: [], removed: []};

            const mode = that.options.mode;
            const selectables = that._selectables;
            const areaRect = that._areaElement.getBoundingClientRect();

            // Itreate over the selectable elements
            for (let i = 0, n = selectables.length, node; node = selectables[i], i < n; i++) {

                // Check if area intersects element
                if (_.intersects(areaRect, node.getBoundingClientRect(), mode)) {

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
            for (let i = 0, n = that._touchedElements.length, el; el = that._touchedElements[i], i < n; i++) {
                if (!touched.includes(el)) {
                    changed.removed.push(el);
                }
            }

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
         * Can be used if during a selection elements have been added.
         * Will update everything which can be selected.
         */
        resolveSelectables() {

            // Resolve selectors
            that._selectables = _.selectAll(that.options.selectables);
        },

        /**
         * Saves the current selection for the next selecion.
         * Allows multiple selections.
         */
        keepSelection() {
            for (let i = 0, n = that._touchedElements.length, el; el = that._touchedElements[i], i < n; i++) {
                if (!that._selectedStore.includes(el)) {
                    that._selectedStore.push(el);
                }
            }
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
         * @param keepEvent {boolean} true to fire the onStop listener after cancel.
         */
        cancel(keepEvent = false) {
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
            that._selectionAreaContainer.removeChild(that._clippingElement);
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
Selection.version = '0.2.3';

// Export API
export default Selection;
