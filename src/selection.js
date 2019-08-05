import {on, off, css, selectAll, eventPath, intersects, simplifyEvent, removeElement} from './utils';

// Some var shorting for better compression and readability
const {abs, max, min, round, ceil} = Math;
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

            selectables: [],
            scrollSpeedDivider: 10,

            startareas: ['html'],
            boundaries: ['html'],
            selectionAreaContainer: 'body'
        }, options),

        // Store for keepSelection
        _selectedStore: [],
        _selectables: [],
        _touchedElements: [], // Currently touched elements
        _changedElements: {
            added: [],  // Added elements since last selection
            removed: [] // Removed elements since last selection
        },

        // Evenlistener name: [callbacks]
        _eventListener: {
            init: [],
            beforestart: [],
            start: [],
            move: [],
            stop: [],
            select: []
        },

        // Create area element
        _areaElement: doc.createElement('div'),
        _clippingElement: doc.createElement('div'),

        // Is getting set on movement. Varied.
        _scrollAvailable: true,
        _scrollSpeed: {x: null, y: null},

        _init() {
            that._clippingElement.appendChild(that._areaElement);

            // Add class to the area element
            that._areaElement.classList.add(that.options.class);

            // Apply basic styles to the area element
            css(that._areaElement, {
                willChange: 'top, left, bottom, right, width, height',
                top: 0,
                left: 0,
                position: 'fixed'
            });

            css(that._clippingElement, {
                overflow: 'hidden',
                position: 'fixed',
                transform: 'translate3d(0, 0, 0)', // https://stackoverflow.com/a/38268846
                pointerEvents: 'none',
                zIndex: 1
            });

            that.enable();
            that._emit('init');
        },

        _bindStartEvents(type) {
            const fn = type === 'on' ? on : off;
            fn(doc, 'mousedown', that._onTapStart);

            if (!that.options.disableTouch) {
                fn(doc, 'touchstart', that._onTapStart, {
                    passive: false
                });
            }
        },

        _onTapStart(evt) {
            const {x, y, target} = simplifyEvent(evt);
            const targetBoundingClientRect = target.getBoundingClientRect();

            // Find start-areas and boundaries
            const startAreas = selectAll(that.options.startareas);
            that._boundaries = selectAll(that.options.boundaries);

            // Check in which container the user currently acts
            that._targetContainer = that._boundaries.find(el =>
                intersects(el.getBoundingClientRect(), targetBoundingClientRect)
            );

            // Check if area starts in one of the start areas / boundaries
            const evtpath = eventPath(evt);
            if (!that._targetContainer ||
                !startAreas.find(el => evtpath.includes(el)) ||
                !that._boundaries.find(el => evtpath.includes(el))) {
                return;
            }

            if (that._emit('beforestart', {oe: evt}) === false) {
                return;
            }

            // Area start point
            that._ax1 = x;
            that._ay1 = y;

            // Area end point
            that._ax2 = 0;
            that._ay2 = 0;

            // To detect single-click
            that._singleClick = true;

            // Prevent default select event
            on(doc, 'selectstart', preventDefault);

            // Add listener
            on(doc, ['touchmove', 'mousemove'], that._delayedTapMove, {passive: false});
            on(doc, ['mouseup', 'touchcancel', 'touchend'], that._onTapStop);
        },

        _onSingleTap(evt) {
            let {target} = simplifyEvent(evt);

            /**
             * Resolve selectables again.
             * If the user starded in a scrollable area they will be reduced
             * to the current area. Prevent the exclusion of these if a range-selection
             * gets performed.
             */
            that.resolveSelectables();

            // Traverse dom upwards to check if target is selectable
            while (!that._selectables.includes(target)) {
                if (!target.parentElement) {
                    return;
                }

                target = target.parentElement;
            }

            const stored = that._selectedStore;
            if (evt.shiftKey && stored.length) {
                const reference = stored[stored.length - 1];

                // Resolve correct range
                const [preceding, following] = reference.compareDocumentPosition(target) & 4 ? [target, reference] : [reference, target];

                const rangeItems = [...that._selectables.filter(el =>
                    !stored.includes(el) &&
                    (el.compareDocumentPosition(preceding) & 4) &&
                    (el.compareDocumentPosition(following) & 2)
                ), target];

                that.select(rangeItems);
            } else {
                that._touchedElements.push(target);
                that._emit('select', {
                    oe: evt,
                    target
                });
            }
        },

        _delayedTapMove(evt) {
            const {x, y} = simplifyEvent(evt);

            // Check pixel threshold
            if (abs((x + y) - (that._ax1 + that._ay1)) >= that.options.startThreshold) {
                off(doc, ['mousemove', 'touchmove'], that._delayedTapMove, {passive: false});
                on(doc, ['mousemove', 'touchmove'], that._onTapMove, {passive: false});

                // Make area element visible
                css(that._areaElement, 'display', 'block');

                // Apppend selection-area to the dom
                selectAll(that.options.selectionAreaContainer)[0].appendChild(that._clippingElement);

                // Now after the threshold is reached resolve all selectables
                that.resolveSelectables();

                // An action is recognized as single-select until
                // the user performed a mutli-selection
                that._singleClick = false;

                // Just saving the boundaries of this container for later
                const tb = that._targetBoundary = that._targetContainer.getBoundingClientRect();
                that._touchedElements = [];
                that._changedElements = {
                    added: [],
                    removed: []
                };

                // Find container and check if it's scrollable
                if (round(that._targetContainer.scrollHeight) !== round(tb.height) ||
                    round(that._targetContainer.scrollWidth) !== round(tb.width)) {

                    // Indenticates if the user is currently in a scrollable area
                    that._scrollAvailable = true;

                    // Detect mouse scrolling
                    on(window, 'wheel', that._manualScroll, {passive: false});

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
                    css(that._clippingElement, {
                        top: tb.top,
                        left: tb.left,
                        width: tb.width,
                        height: tb.height
                    });

                    /**
                     * The area element is relative to the clipping element,
                     * but when this is moved or transformed we need to correct
                     * the positions via a negative margin.
                     */
                    css(that._areaElement, {
                        marginTop: -tb.top,
                        marginLeft: -tb.left
                    });
                } else {
                    that._scrollAvailable = false;

                    /**
                     * Reset margin and clipping element dimensions.
                     */
                    css(that._clippingElement, {
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    });

                    css(that._areaElement, {
                        marginTop: 0,
                        marginLeft: 0
                    });
                }

                // Trigger recalc and fire event
                that._onTapMove(evt);
                that._emit('start', {oe: evt});
            }

            evt.preventDefault(); // Prevent swipe-down refresh
        },

        _onTapMove(evt) {
            const {x, y} = simplifyEvent(evt);
            const scon = that._targetContainer;
            const ss = that._scrollSpeed;
            that._ax2 = x;
            that._ay2 = y;

            if (that._scrollAvailable && (ss.y !== null || ss.x !== null)) {

                // Continous scrolling
                requestAnimationFrame(function scroll() {

                    // Scrolling is not anymore required
                    if (ss.y === null && ss.x === null) {
                        return;
                    }

                    /**
                     * If the value exeeds the scrollable area it will
                     * be set to the max / min value. So change only
                     */
                    const {scrollTop, scrollLeft} = scon;

                    // Reduce velocity, use ceil in both directions to scroll at least 1px per frame
                    if (ss.y !== null) {
                        scon.scrollTop += ceil(ss.y / that.options.scrollSpeedDivider);
                        that._ay1 -= scon.scrollTop - scrollTop;
                    }

                    if (ss.x !== null) {
                        scon.scrollLeft += ceil(ss.x / that.options.scrollSpeedDivider);
                        that._ax1 -= scon.scrollLeft - scrollLeft;
                    }

                    /**
                     * We changed the start coordinates ->  redraw the selectiona area
                     * We changed the dimensions of the area element -> re-calc selected elements
                     * The selected elements array has been changed -> fire event
                     */
                    that._redrawArea();
                    that._updatedTouchingElements();
                    that._emit('move', {oe: evt});

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
                that._emit('move', {oe: evt});
            }

            evt.preventDefault(); // Prevent swipe-down refresh
        },

        _manualScroll(evt) {
            const {scrollSpeedDivider} = that.options;
            that._scrollSpeed.y += scrollSpeedDivider * (evt.wheelDeltaY * -1);
            that._scrollSpeed.x += scrollSpeedDivider * (evt.wheelDeltaX * -1);
            that._onTapMove(evt);

            // Prevent defaul scrolling behaviour, eg. page scrolling
            evt.preventDefault();
        },

        _redrawArea() {
            const {scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth} = that._targetContainer;
            const brect = that._targetBoundary;
            const ss = that._scrollSpeed;
            let x = that._ax2;
            let y = that._ay2;

            if (x < brect.left) {
                ss.x = scrollLeft ? -abs(brect.left - x) : null;
                x = brect.left;
            } else if (x > brect.left + brect.width) {
                ss.x = scrollWidth - scrollLeft - clientWidth ? abs(brect.left + brect.width - x) : null;
                x = brect.left + brect.width;
            } else {
                ss.x = null;
            }

            if (y < brect.top) {
                ss.y = scrollTop ? -abs(brect.top - y) : null;
                y = brect.top;
            } else if (y > brect.top + brect.height) {
                ss.y = scrollHeight - scrollTop - clientHeight ? abs(brect.top + brect.height - y) : null;
                y = brect.top + brect.height;
            } else {
                ss.y = null;
            }

            const x3 = min(that._ax1, x);
            const y3 = min(that._ay1, y);
            const x4 = max(that._ax1, x);
            const y4 = max(that._ay1, y);

            Object.assign(that._areaElement.style, {
                top: `${y3}px`,
                left: `${x3}px`,
                width: `${x4 - x3}px`,
                height: `${y4 - y3}px`
            });
        },

        _onTapStop(evt, noevent) {

            // Remove event handlers
            off(doc, ['mousemove', 'touchmove'], that._delayedTapMove);
            off(doc, ['touchmove', 'mousemove'], that._onTapMove);
            off(doc, ['mouseup', 'touchcancel', 'touchend'], that._onTapStop);

            if (evt && that._singleClick && that.options.singleClick) {
                that._onSingleTap(evt);
            } else if (!that._singleClick && !noevent) {
                that._updatedTouchingElements();
                that._emit('stop', {oe: evt});
            }

            // Reset scroll speed
            that._scrollSpeed = {x: null, y: null};

            // Unbind mouse scrolling listener
            off(window, 'wheel', that._manualScroll);

            // Remove selection-area from dom
            that._clippingElement.remove();

            // Enable default select event
            off(doc, 'selectstart', preventDefault);
            css(that._areaElement, 'display', 'none');
        },

        _updatedTouchingElements() {
            const {_touchedElements, _selectables, _areaElement, options} = that;
            const {mode} = options;
            const areaRect = _areaElement.getBoundingClientRect();

            // Update
            const touched = [];
            const added = [];
            const removed = [];

            // Itreate over the selectable elements
            for (let i = 0, n = _selectables.length, node; node = _selectables[i], i < n; i++) {

                // Check if area intersects element
                if (intersects(areaRect, node.getBoundingClientRect(), mode)) {

                    // Check if the element wasn't present in the last selection.
                    if (!_touchedElements.includes(node)) {
                        added.push(node);
                    }

                    touched.push(node);
                }
            }

            // Check which elements where removed since last selection
            for (let i = 0, n = _touchedElements.length, el; el = _touchedElements[i], i < n; i++) {
                if (!touched.includes(el)) {
                    removed.push(el);
                }
            }

            // Save
            that._touchedElements = touched;
            that._changedElements = {added, removed};
        },

        _emit(event, args = {}) {
            for (const listener of that._eventListener[event]) {
                listener.call(that, {
                    inst: that,
                    area: that._areaElement,
                    selected: that._touchedElements.concat(that._selectedStore),
                    changed: that._changedElements,
                    event,
                    ...args
                });
            }
        },

        /**
         * Adds an eventlistener
         * @param event
         * @param cb
         */
        on(event, cb) {
            that._eventListener[event].push(cb);
            return that;
        },

        /**
         * Removes an event listener
         * @param event
         * @param cb
         */
        off(event, cb) {
            const callBacks = that._eventListener[event];

            if (callBacks) {
                const index = callBacks.indexOf(cb);

                if (~index) {
                    callBacks.splice(index, 1);
                }
            }

            return that;
        },

        /**
         * Can be used if during a selection elements have been added.
         * Will update everything which can be selected.
         */
        resolveSelectables() {

            // Resolve selectors
            that._selectables = selectAll(that.options.selectables);
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
            removeElement(that._selectedStore, el);
            removeElement(that._touchedElements, el);
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
            return value === null ? options[name] : (options[name] = value);
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
            that._clippingElement.remove();
        },

        /**
         * Disable the selection functinality.
         */
        enable() {
            that._bindStartEvents('on');
        },

        /**
         * Manually select elements
         * @param query - CSS Query, can be an array of queries
         */
        select(query) {
            const {_touchedElements, _selectedStore} = that;
            const elements = selectAll(query).filter(el =>
                !_touchedElements.includes(el) &&
                !_selectedStore.includes(el)
            );

            that._changedElements.added = elements;
            that._selectedStore.push(...elements);
            this._emit('move');

            this._updatedTouchingElements();
            this._emit('stop');
            return that;
        }
    };

    // Initialize
    that._init();

    return that;
}

// Export utils
Selection.utils = {
    on,
    off,
    css,
    intersects,
    selectAll,
    eventPath,
    removeElement
};

/**
 * Create selection instance
 * @param {Object} [options]
 */
Selection.create = options => new Selection(options);

// Set version
Selection.version = '1.1.1';

// Export API
export default Selection;
