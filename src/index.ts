import {css, eventPath, intersects, off, on, removeElement, selectAll, SelectAllSelectors, simplifyEvent} from '@utils';
import {AreaRect, ChangedElements, Coordinates, LooseCoordinates, SelectionEvents, SelectionOptions} from './types';

// Some var shorting for better compression and readability
const {abs, max, min, round, ceil} = Math;
const preventDefault = (e: Event) => e.preventDefault();

/* eslint-disable new-cap */
export default class Selection {
    public static version: VERSION;

    // Options
    public options: SelectionOptions;

    // Store for keepSelection
    private _stored: Array<Element> = [];
    private _selectables: Array<Element> = [];
    private _selected: Array<Element> = []; // Currently touched elements
    private _changed: ChangedElements = {
        added: [], // Added elements since last selection
        removed: [] // Removed elements since last selection
    };

    // Evenlistener name: [callbacks]
    private _eventListener: Record<keyof SelectionEvents, Array<Function>> = {
        beforestart: [],
        start: [],
        move: [],
        stop: []
    };

    // Create area element
    private _area: HTMLElement;
    private _areaDomRect?: DOMRect; // Caches the position of the selection-area
    private _clippingElement: HTMLElement;
    private _targetContainer?: Element;
    private _targetBoundary?: DOMRect;
    private _areaRect?: AreaRect;
    private _singleClick?: boolean;

    // Is getting set on movement. Varied.
    private _scrollAvailable: boolean = true;
    private _scrollSpeed: LooseCoordinates = {x: null, y: null};

    // Alternative way of creating an instance
    public static create(opt: Partial<SelectionOptions>): Selection {
        return new Selection(opt);
    }

    constructor(opt: Partial<SelectionOptions>) {
        this.options = Object.assign({
            class: 'selection-area',
            frame: document,
            mode: 'touch',
            tapMode: 'native',
            startThreshold: 10,
            singleClick: true,
            disableTouch: false,

            selectables: [],
            scrollSpeedDivider: 10,
            manualScrollSpeed: 750,

            startareas: ['html'],
            boundaries: ['html'],
            selectionAreaContainer: 'body'
        }, opt);

        // Bind locale functions to instance
        for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
            if (typeof (this as any)[key] === 'function') {
                (this as any)[key] = (this as any)[key].bind(this);
            }
        }

        const {frame} = this.options;
        this._area = frame.createElement('div');
        this._clippingElement = frame.createElement('div');
        this._clippingElement.appendChild(this._area);

        // Add class to the area element
        this._area.classList.add(this.options.class);

        // Apply basic styles to the area element
        css(this._area as HTMLElement, {
            willChange: 'top, left, bottom, right, width, height',
            top: 0,
            left: 0,
            position: 'fixed'
        });

        css(this._clippingElement as HTMLElement, {
            overflow: 'hidden',
            position: 'fixed',
            transform: 'translate3d(0, 0, 0)', // https://stackoverflow.com/a/38268846
            pointerEvents: 'none',
            zIndex: 1
        });

        this.enable();
    }

    _bindStartEvents(type: 'on' | 'off') {
        const {frame} = this.options;
        const fn = type === 'on' ? on : off;
        fn(frame, 'mousedown', this._onTapStart);

        if (!this.options.disableTouch) {
            fn(frame, 'touchstart', this._onTapStart, {
                passive: false
            });
        }
    }

    _onTapStart(evt: MouseEvent | TouchEvent, silent = false) {
        const {x, y, target} = simplifyEvent(evt);
        const {options} = this;
        const {frame} = this.options;
        const targetBoundingClientRect = target.getBoundingClientRect();

        // Find start-areas and boundaries
        const startAreas = selectAll(options.startareas, options.frame);
        const resolvedBoundaries = selectAll(options.boundaries, options.frame);

        // Check in which container the user currently acts
        this._targetContainer = resolvedBoundaries.find(el =>
            intersects(el.getBoundingClientRect(), targetBoundingClientRect)
        );

        // Check if area starts in one of the start areas / boundaries
        const evtpath = eventPath(evt);
        if (!this._targetContainer ||
            !startAreas.find(el => evtpath.includes(el)) ||
            !resolvedBoundaries.find(el => evtpath.includes(el))) {
            return;
        }

        if (!silent && this._emit('beforestart', evt) === false) {
            return;
        }

        // Area rect
        this._areaRect = {x1: x, y1: y, x2: 0, y2: 0};

        // To detect single-click
        this._singleClick = true;
        this.clearSelection(false);

        // Prevent default select event
        on(frame, 'selectstart', preventDefault);

        // Add listener
        on(frame, ['touchmove', 'mousemove'], this._delayedTapMove, {passive: false});
        on(frame, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);

        // Firefox will scroll down the page which would break the selection.
        evt.preventDefault();
    }

    _onSingleTap(evt: MouseEvent | TouchEvent) {
        const {tapMode} = this.options;
        const spl = simplifyEvent(evt);
        let target = null;

        if (tapMode === 'native') {
            target = spl.target;
        } else if (tapMode === 'touch') {
            this.resolveSelectables();

            const {x, y} = spl;
            target = this._selectables.find(v => {
                const {right, left, top, bottom} = v.getBoundingClientRect();
                return x < right && x > left && y < bottom && y > top;
            });
        } else {
            throw new Error(`Unknown tapMode option: ${tapMode}`);
        }

        if (!target) {
            return false;
        }

        /**
         * Resolve selectables again.
         * If the user starded in a scrollable area they will be reduced
         * to the current area. Prevent the exclusion of these if a range-selection
         * gets performed.
         */
        this.resolveSelectables();

        // Traverse dom upwards to check if target is selectable
        while (!this._selectables.includes(target)) {
            if (!target.parentElement) {
                return;
            }

            target = target.parentElement;
        }

        this._emit('start', evt);
        const stored = this._stored;
        if (evt.shiftKey && stored.length) {
            const reference = stored[stored.length - 1];

            // Resolve correct range
            const [preceding, following] = reference.compareDocumentPosition(target) & 4 ? [target, reference] : [reference, target];

            const rangeItems = [...this._selectables.filter(el =>
                (el.compareDocumentPosition(preceding) & 4) &&
                (el.compareDocumentPosition(following) & 2)
            ), target];

            this.select(rangeItems);
            this._emit('move', evt);
            this._emit('stop', evt);
        } else {

            if (this._stored.includes(target)) {
                this.removeFromSelection(target);
            } else {
                this.select(target);
            }

            this._emit('move', evt);
            this._emit('stop', evt);
        }
    }

    _delayedTapMove(evt: MouseEvent | TouchEvent) {
        const {x, y} = simplifyEvent(evt);
        const {startThreshold, frame} = this.options;
        const {x1, y1} = this._areaRect as AreaRect; // Coordinates of first "tap"

        // Check pixel threshold
        const thresholdType = typeof startThreshold;
        if (
            // Single number
            (thresholdType === 'number' && abs((x + y) - (x1 + y1)) >= startThreshold) ||

            // Different x and y threshold
            (thresholdType === 'object' && abs(x - x1) >= (startThreshold as Coordinates).x || abs(y - y1) >= (startThreshold as Coordinates).y)
        ) {
            off(frame, ['mousemove', 'touchmove'], this._delayedTapMove, {passive: false});
            on(frame, ['mousemove', 'touchmove'], this._onTapMove, {passive: false});

            // Make area element visible
            css(this._area, 'display', 'block');

            // Apppend selection-area to the dom
            selectAll(this.options.selectionAreaContainer, frame)[0].appendChild(this._clippingElement);

            // Now after the threshold is reached resolve all selectables
            this.resolveSelectables();

            // An action is recognized as single-select until the user performed a mutli-selection
            this._singleClick = false;

            // Just saving the boundaries of this container for later
            const tb = this._targetBoundary = (this._targetContainer as HTMLElement).getBoundingClientRect();

            // Find container and check if it's scrollable
            if (round((this._targetContainer as HTMLElement).scrollHeight) !== round(tb.height) ||
                round((this._targetContainer as HTMLElement).scrollWidth) !== round(tb.width)) {

                // Indenticates if the user is currently in a scrollable area
                this._scrollAvailable = true;

                // Detect mouse scrolling
                on(window, 'wheel', this._manualScroll, {passive: false});

                /**
                 * The selection-area will also cover other element which are
                 * out of the current scrollable parent. So find all elements
                 * which are in the current scrollable element. Later these are
                 * the only selectables instead of all.
                 */
                this._selectables = this._selectables.filter(s => (this._targetContainer as HTMLElement).contains(s));

                /**
                 * To clip the area, the selection area has a parent
                 * which has exact the same dimensions as the scrollable elemeent.
                 * Now if the area exeeds these boundaries it will be cropped.
                 */
                css(this._clippingElement, {
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
                css(this._area, {
                    marginTop: -tb.top,
                    marginLeft: -tb.left
                });
            } else {
                this._scrollAvailable = false;

                /**
                 * Reset margin and clipping element dimensions.
                 */
                css(this._clippingElement, {
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                });

                css(this._area, {
                    marginTop: 0,
                    marginLeft: 0
                });
            }

            // Trigger recalc and fire event
            this._onTapMove(evt);
            this._emit('start', evt);
        }

        evt.preventDefault(); // Prevent swipe-down refresh
    }

    _onTapMove(evt: MouseEvent | TouchEvent) {
        const {x, y} = simplifyEvent(evt);
        const {scrollSpeedDivider} = this.options;
        const scon = this._targetContainer as Element;
        let ss = this._scrollSpeed;

        (this._areaRect as AreaRect).x2 = x;
        (this._areaRect as AreaRect).y2 = y;

        if (this._scrollAvailable && (ss.y !== null || ss.x !== null)) {
            const that = this;

            // Continous scrolling
            requestAnimationFrame(function scroll() {

                // Make sure this ss is not outdated
                ss = that._scrollSpeed;
                const scrollY = ss.y !== null;
                const scrollX = ss.x !== null;

                // Scrolling is not anymore required
                if (!scrollY && !scrollX) {
                    return;
                }

                /**
                 * If the value exeeds the scrollable area it will
                 * be set to the max / min value. So change only
                 */
                const {scrollTop, scrollLeft} = scon;

                // Reduce velocity, use ceil in both directions to scroll at least 1px per frame
                if (scrollY && ss.y) {
                    scon.scrollTop += ceil(ss.y / scrollSpeedDivider);
                    (that._areaRect as AreaRect).y1 -= scon.scrollTop - scrollTop;
                }

                if (scrollX && ss.x) {
                    scon.scrollLeft += ceil(ss.x / scrollSpeedDivider);
                    (that._areaRect as AreaRect).x1 -= scon.scrollLeft - scrollLeft;
                }

                /**
                 * We changed the start coordinates -> redraw the selectiona area
                 * We changed the dimensions of the area element -> re-calc selected elements
                 * The selected elements array has been changed -> fire event
                 */
                that._recalcAreaRect();
                that._updatedTouchingElements();
                that._emit('move', evt);
                that._redrawArea();

                // Keep scrolling even if the user stops to move his pointer
                requestAnimationFrame(scroll);
            });
        } else {

            /**
             * Perform redraw only if scrolling is not active.
             * If scrolling is active this area is getting re-dragwed by the
             * anonymized scroll function.
             */
            this._recalcAreaRect();
            this._updatedTouchingElements();
            this._emit('move', evt);
            this._redrawArea();
        }

        evt.preventDefault(); // Prevent swipe-down refresh
    }

    _manualScroll(evt: any) {
        const {manualScrollSpeed} = this.options;

        // Consistent scrolling speed on all browsers
        const deltaY = evt.deltaY ? (evt.deltaY > 0 ? 1 : -1) : 0;
        const deltaX = evt.deltaX ? (evt.deltaX > 0 ? 1 : -1) : 0;
        (this._scrollSpeed.y as number) += deltaY * manualScrollSpeed;
        (this._scrollSpeed.x as number) += deltaX * manualScrollSpeed;
        this._onTapMove(evt);

        // Prevent defaul scrolling behaviour, eg. page scrolling
        evt.preventDefault();
    }

    _recalcAreaRect() {
        const {scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth} = this._targetContainer as Element;
        const arect = this._areaRect as AreaRect;
        const brect = this._targetBoundary as DOMRect;
        const ss = this._scrollSpeed;
        let {x2, y2} = arect;

        if (x2 < brect.left) {
            ss.x = scrollLeft ? -abs(brect.left - x2) : null;
            x2 = brect.left;
        } else if (x2 > brect.left + brect.width) {
            ss.x = scrollWidth - scrollLeft - clientWidth ? abs(brect.left + brect.width - x2) : null;
            x2 = brect.left + brect.width;
        } else {
            ss.x = null;
        }

        if (y2 < brect.top) {
            ss.y = scrollTop ? -abs(brect.top - y2) : null;
            y2 = brect.top;
        } else if (y2 > brect.top + brect.height) {
            ss.y = scrollHeight - scrollTop - clientHeight ? abs(brect.top + brect.height - y2) : null;
            y2 = brect.top + brect.height;
        } else {
            ss.y = null;
        }

        const x3 = min(arect.x1, x2);
        const y3 = min(arect.y1, y2);
        const x4 = max(arect.x1, x2);
        const y4 = max(arect.y1, y2);
        this._areaDomRect = new DOMRect(x3, y3, x4 - x3, y4 - y3);
    }

    _redrawArea() {
        const {x, y, width, height} = this._areaDomRect as DOMRect;
        const areaStyle = this._area.style;

        // It's generally faster to not use es6-templates
        // It's also faster to manually change the properties instead of calling Object.assign
        /* eslint prefer-template: "off" */
        areaStyle.transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';
        areaStyle.width = width + 'px';
        areaStyle.height = height + 'px';
    }

    _onTapStop(evt: MouseEvent | TouchEvent | null, silent: boolean) {
        const {frame, singleClick} = this.options;

        // Remove event handlers
        off(frame, ['mousemove', 'touchmove'], this._delayedTapMove);
        off(frame, ['touchmove', 'mousemove'], this._onTapMove);
        off(frame, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);

        if (evt && this._singleClick && singleClick) {
            this._onSingleTap(evt);
        } else if (!this._singleClick && !silent) {
            this._updatedTouchingElements();
            this._emit('stop', evt);
        }

        // Reset scroll speed
        this._scrollSpeed = {x: null, y: null};

        // Unbind mouse scrolling listener
        off(window, 'wheel', this._manualScroll);

        // Remove selection-area from dom
        this._clippingElement.remove();

        // Enable default select event
        off(frame, 'selectstart', preventDefault);
        css(this._area, 'display', 'none');
    }

    _updatedTouchingElements() {
        const {_selected, _selectables, options, _areaDomRect} = this;
        const {mode} = options;

        // Update
        const touched = [];
        const added = [];
        const removed = [];

        // Itreate over the selectable elements
        for (let i = 0; i < _selectables.length; i++) {
            const node = _selectables[i];

            // Check if area intersects element
            if (intersects(_areaDomRect as DOMRect, node.getBoundingClientRect(), mode)) {

                // Check if the element wasn't present in the last selection.
                if (!_selected.includes(node)) {
                    added.push(node);
                }

                touched.push(node);
            }
        }

        // Check which elements where removed since last selection
        for (let i = 0; i < _selected.length; i++) {
            const el = _selected[i];
            if (!touched.includes(el)) {
                removed.push(el);
            }
        }

        // Save
        this._selected = touched;
        this._changed = {added, removed};
    }

    _emit(event: keyof SelectionEvents, evt: MouseEvent | TouchEvent | null) {
        let ok = true;

        for (const listener of this._eventListener[event]) {
            const res = listener({
                area: this._area,
                selected: this._selected.concat(this._stored),
                changed: this._changed,
                event: evt
            });

            if (typeof res === 'boolean') {
                ok = ok && res;
            }
        }

        return ok;
    }

    /**
     * Manually triggers the start of a selection
     * @param evt A MouseEvent / TouchEvent -like object
     * @param silent If beforestart should be fired,
     */
    trigger(evt: MouseEvent | TouchEvent, silent = true) {
        this._onTapStart(evt, silent);
    }

    /**
     * Adds an eventlistener
     * @param event
     * @param cb
     */
    on<Event extends keyof SelectionEvents>(event: Event, cb: SelectionEvents[Event]) {
        this._eventListener[event].push(cb);
        return this;
    }

    /**
     * Removes an event listener
     * @param event
     * @param cb
     */
    off<Event extends keyof SelectionEvents>(event: Event, cb: SelectionEvents[Event]) {
        const callBacks = this._eventListener[event];

        if (callBacks) {
            const index = callBacks.indexOf(cb);

            if (~index) {
                callBacks.splice(index, 1);
            }
        }

        return this;
    }

    /**
     * Can be used if during a selection elements have been added.
     * Will update everything which can be selected.
     */
    resolveSelectables() {

        // Resolve selectors
        this._selectables = selectAll(this.options.selectables, this.options.frame);
    }

    /**
     * Saves the current selection for the next selecion.
     * Allows multiple selections.
     */
    keepSelection() {
        const {_selected, _stored} = this;

        for (let i = 0; i < _selected.length; i++) {
            const el = _selected[i];
            if (!_stored.includes(el)) {
                _stored.push(el);
            }
        }
    }

    /**
     * Clear the elements which where saved by 'keepSelection()'.
     * @param store If the store should also get cleared
     */
    clearSelection(store = true) {
        store && (this._stored = []);
        this._selected = [];
        this._changed.added = [];
        this._changed.removed = [];
    }

    /**
     * Removes an particular element from the selection.
     */
    removeFromSelection(el: Element) {
        this._changed.removed.push(el);
        removeElement(this._stored, el);
        removeElement(this._selected, el);
    }

    /**
     * @returns {Array} Selected elements
     */
    getSelection() {
        return this._stored;
    }

    /**
     * Cancel the current selection process.
     * @param keepEvent {boolean} true to fire the onStop listener after cancel.
     */
    cancel(keepEvent = false) {
        this._onTapStop(null, !keepEvent);
    }

    /**
     * Disable the selection functinality.
     */
    disable() {
        this._bindStartEvents('off');
    }

    /**
     * Unbinds all events and removes the area-element
     */
    destroy() {
        this.disable();
        this._clippingElement.remove();
    }

    /**
     * Disable the selection functinality.
     */
    enable() {
        this._bindStartEvents('on');
    }

    /**
     * Manually select elements
     * @param query - CSS Query, can be an array of queries
     * @param quiet - If this should not trigger the move event
     */
    select(query: SelectAllSelectors, quiet = false) {
        const {_changed, _selected, _stored, options} = this;
        const elements = selectAll(query, options.frame).filter(el =>
            !_selected.includes(el) &&
            !_stored.includes(el)
        );

        // Update stores
        _selected.push(...elements);
        _changed.added.push(...elements);

        // Fire event
        this._emit('move', null);
        return elements;
    }
}
