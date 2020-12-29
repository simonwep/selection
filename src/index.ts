import {css, eventPath, intersects, off, on, removeElement, selectAll, SelectAllSelectors, simplifyEvent} from '@utils';
import {EventTarget} from './EventEmitter';
import {AreaRect, ChangedElements, Coordinates, ScrollEvent, SelectionOptions} from './types';

// Some var shorting for better compression and readability
const {abs, max, min, round, ceil} = Math;
const preventDefault = (e: Event) => e.preventDefault();

export default class SelectionArea extends EventTarget {
    public static version = VERSION;

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

    // Area element and clipping element
    private readonly _area: HTMLElement;
    private readonly _clippingElement: HTMLElement;

    // Caches the position of the selection-area
    private readonly _areaDomRect = new DOMRect();

    // Target container (element) and boundary (cached)
    private _targetContainer?: Element;
    private _targetBoundary?: DOMRect;

    // Dynamically constructed area rect
    private _areaRect: AreaRect = {y1: 0, x2: 0, y2: 0, x1: 0};

    // If a single click is being performed
    private _singleClick?: boolean;

    // Is getting set on movement. Varied.
    private _scrollAvailable = true;
    private _scrollSpeed: Coordinates = {x: 0, y: 0};

    constructor(opt: Partial<SelectionOptions>) {
        super();

        this.options = Object.assign({
            class: 'selection-area',
            document: window.document,
            intersect: 'touch',
            startThreshold: 10,
            singleClick: true,
            allowTouch: true,
            selectables: [],

            singleTap: {
                allow: true,
                intersect: 'native'
            },

            scrolling: {
                speedDivider: 10,
                manualSpeed: 750
            },

            startareas: ['html'],
            boundaries: ['html'],
            container: 'body'
        }, opt);

        // Bind locale functions to instance
        /* eslint-disable @typescript-eslint/no-explicit-any */
        for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
            if (typeof (this as any)[key] === 'function') {
                (this as any)[key] = (this as any)[key].bind(this);
            }
        }

        const {document} = this.options;
        this._area = document.createElement('div');
        this._clippingElement = document.createElement('div');
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

    _bindStartEvents(activate = true): void {
        const {document, allowTouch} = this.options;
        const fn = activate ? on : off;

        fn(document, 'mousedown', this._onTapStart);
        allowTouch && fn(document, 'touchstart', this._onTapStart, {
            passive: false
        });
    }

    _onTapStart(evt: MouseEvent | TouchEvent, silent = false): void {
        const {x, y, target} = simplifyEvent(evt);
        const {options} = this;
        const {document} = this.options;
        const targetBoundingClientRect = target.getBoundingClientRect();

        // Find start-areas and boundaries
        const startAreas = selectAll(options.startareas, options.document);
        const resolvedBoundaries = selectAll(options.boundaries, options.document);

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

        if (!silent && this.emit('beforestart', {event: evt}) === false) {
            return;
        }

        // Area rect
        this._areaRect = {x1: x, y1: y, x2: 0, y2: 0};

        // To detect single-click
        this._singleClick = true;
        this.clearSelection(false);

        // Prevent default select event
        on(document, 'selectstart', preventDefault);

        // Add listener
        on(document, ['touchmove', 'mousemove'], this._delayedTapMove, {passive: false});
        on(document, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);

        // Firefox will scroll down the page which would break the selection.
        evt.preventDefault();
    }

    _onSingleTap(evt: MouseEvent | TouchEvent): void {
        const {intersect} = this.options.singleTap;
        const spl = simplifyEvent(evt);
        let target = null;

        if (intersect === 'native') {
            target = spl.target;
        } else if (intersect === 'touch') {
            this.resolveSelectables();

            const {x, y} = spl;
            target = this._selectables.find(v => {
                const {right, left, top, bottom} = v.getBoundingClientRect();
                return x < right && x > left && y < bottom && y > top;
            });
        }

        if (!target) {
            return;
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

        this._emitStartEvent(evt);
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
            this._emitMoveEvent(evt);
            this.emit('stop', {event: evt});
        } else {

            if (this._stored.includes(target)) {
                this.deselect(target);
            } else {
                this.select(target);
            }

            this._emitMoveEvent(evt);
            this.emit('stop', {event: evt});
        }
    }

    _delayedTapMove(evt: MouseEvent | TouchEvent): void {
        const {startThreshold, document} = this.options;
        const {x1, y1} = this._areaRect; // Coordinates of first "tap"
        const {x, y} = simplifyEvent(evt);

        // Check pixel threshold
        const thresholdType = typeof startThreshold;
        if (

            // Single number
            (thresholdType === 'number' && abs((x + y) - (x1 + y1)) >= startThreshold) ||

            // Different x and y threshold
            (thresholdType === 'object' && abs(x - x1) >= (startThreshold as Coordinates).x || abs(y - y1) >= (startThreshold as Coordinates).y)
        ) {
            off(document, ['mousemove', 'touchmove'], this._delayedTapMove, {passive: false});
            on(document, ['mousemove', 'touchmove'], this._onTapMove, {passive: false});

            // Make area element visible
            css(this._area, 'display', 'block');

            // Apppend selection-area to the dom
            selectAll(this.options.container, document)[0].appendChild(this._clippingElement);

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
            this._emitStartEvent(evt);
            this._onTapMove(evt);
        }

        evt.preventDefault(); // Prevent swipe-down refresh
    }

    _onTapMove(evt: MouseEvent | TouchEvent): void {
        const {x, y} = simplifyEvent(evt);
        const {speedDivider} = this.options.scrolling;
        const scon = this._targetContainer as Element;
        let scrollSpeed = this._scrollSpeed;

        this._areaRect.x2 = x;
        this._areaRect.y2 = y;

        if (this._scrollAvailable && scrollSpeed.y && scrollSpeed.x) {
            const scroll = () => {

                // Make sure this ss is not outdated
                scrollSpeed = this._scrollSpeed;

                if (!scrollSpeed.x && !scrollSpeed.y) {
                    return;
                }

                /**
                 * If the value exeeds the scrollable area it will
                 * be set to the max / min value. So change only
                 */
                const {scrollTop, scrollLeft} = scon;

                // Reduce velocity, use ceil in both directions to scroll at least 1px per frame
                if (scrollSpeed.y) {
                    scon.scrollTop += ceil(scrollSpeed.y / speedDivider);
                    this._areaRect.y1 -= scon.scrollTop - scrollTop;
                }

                if (scrollSpeed.x) {
                    scon.scrollLeft += ceil(scrollSpeed.x / speedDivider);
                    this._areaRect.x1 -= scon.scrollLeft - scrollLeft;
                }

                /**
                 * We changed the start coordinates -> redraw the selectiona area
                 * We changed the dimensions of the area element -> re-calc selected elements
                 * The selected elements array has been changed -> fire event
                 */
                this._recalcAreaRect();
                this._updatedTouchingElements();
                this._emitMoveEvent(evt);
                this._redrawArea();

                // Keep scrolling even if the user stops to move his pointer
                requestAnimationFrame(scroll);
            };

            // Continous scrolling
            requestAnimationFrame(scroll);
        } else {

            /**
             * Perform redraw only if scrolling is not active.
             * If scrolling is active this area is getting re-dragwed by the
             * anonymized scroll function.
             */
            this._recalcAreaRect();
            this._updatedTouchingElements();
            this._emitMoveEvent(evt);
            this._redrawArea();
        }

        evt.preventDefault(); // Prevent swipe-down refresh
    }

    _manualScroll(evt: ScrollEvent): void {
        const {manualSpeed} = this.options.scrolling;

        // Consistent scrolling speed on all browsers
        const deltaY = evt.deltaY ? (evt.deltaY > 0 ? 1 : -1) : 0;
        const deltaX = evt.deltaX ? (evt.deltaX > 0 ? 1 : -1) : 0;
        this._scrollSpeed.y += deltaY * manualSpeed;
        this._scrollSpeed.x += deltaX * manualSpeed;
        this._onTapMove(evt);

        // Prevent defaul scrolling behaviour, eg. page scrolling
        evt.preventDefault();
    }

    _recalcAreaRect(): void {
        const {scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth} = this._targetContainer as Element;
        const arect = this._areaRect;
        const brect = this._targetBoundary as DOMRect;
        const ss = this._scrollSpeed;
        let {x2, y2} = arect;

        if (x2 < brect.left) {
            ss.x = scrollLeft ? -abs(brect.left - x2) : 0;
            x2 = brect.left;
        } else if (x2 > brect.left + brect.width) {
            ss.x = scrollWidth - scrollLeft - clientWidth ? abs(brect.left + brect.width - x2) : 0;
            x2 = brect.left + brect.width;
        } else {
            ss.x = 0;
        }

        if (y2 < brect.top) {
            ss.y = scrollTop ? -abs(brect.top - y2) : 0;
            y2 = brect.top;
        } else if (y2 > brect.top + brect.height) {
            ss.y = scrollHeight - scrollTop - clientHeight ? abs(brect.top + brect.height - y2) : 0;
            y2 = brect.top + brect.height;
        } else {
            ss.y = 0;
        }

        const x3 = min(arect.x1, x2);
        const y3 = min(arect.y1, y2);
        const x4 = max(arect.x1, x2);
        const y4 = max(arect.y1, y2);

        this._areaDomRect.x = x3;
        this._areaDomRect.y = y3;
        this._areaDomRect.width = x4 - x3;
        this._areaDomRect.height = y4 - y3;
    }

    _redrawArea(): void {
        const {x, y, width, height} = this._areaDomRect as DOMRect;
        const areaStyle = this._area.style;

        // Using transform will make the area's borders look blurry
        areaStyle.left = `${x}px`;
        areaStyle.top = `${y}px`;
        areaStyle.width = `${width}px`;
        areaStyle.height = `${height}px`;
    }

    _onTapStop(evt: MouseEvent | TouchEvent | null, silent: boolean): void {
        const {document, singleTap} = this.options;

        // Remove event handlers
        off(document, ['mousemove', 'touchmove'], this._delayedTapMove);
        off(document, ['touchmove', 'mousemove'], this._onTapMove);
        off(document, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);

        if (evt && this._singleClick && singleTap.allow) {
            this._onSingleTap(evt);
        } else if (!this._singleClick && !silent) {
            this._updatedTouchingElements();
            this.emit('stop', {event: evt});
        }

        // Reset scroll speed
        this._scrollSpeed = {x: 0, y: 0};

        // Unbind mouse scrolling listener
        off(window, 'wheel', this._manualScroll);

        // Remove selection-area from dom
        this._clippingElement.remove();

        // Enable default select event
        off(document, 'selectstart', preventDefault);
        css(this._area, 'display', 'none');
    }

    _updatedTouchingElements(): void {
        const {_selected, _selectables, options, _areaDomRect} = this;
        const {intersect} = options;

        // Update
        const touched = [];
        const added = [];
        const removed = [];

        // Itreate over the selectable elements
        for (let i = 0; i < _selectables.length; i++) {
            const node = _selectables[i];

            // Check if area intersects element
            if (intersects(_areaDomRect as DOMRect, node.getBoundingClientRect(), intersect)) {

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

    _emitMoveEvent(evt: MouseEvent | TouchEvent | null): void {
        this.emit('move', {
            event: evt,
            changed: this._changed,
            selected: this._selected
        });
    }

    _emitStartEvent(evt: MouseEvent | TouchEvent): void {
        this.emit('start', {
            event: evt,
            stored: this._stored
        });
    }

    /**
     * Manually triggers the start of a selection
     * @param evt A MouseEvent / TouchEvent -like object
     * @param silent If beforestart should be fired,
     */
    trigger(evt: MouseEvent | TouchEvent, silent = true): void {
        this._onTapStart(evt, silent);
    }

    /**
     * Can be used if during a selection elements have been added.
     * Will update everything which can be selected.
     */
    resolveSelectables(): void {

        // Resolve selectors
        this._selectables = selectAll(this.options.selectables, this.options.document);
    }

    /**
     * Saves the current selection for the next selecion.
     * Allows multiple selections.
     */
    keepSelection(): void {
        const {_selected, _stored} = this;
        _stored.push(
            ..._selected.filter(el => !_stored.includes(el))
        );
    }

    /**
     * Clear the elements which where saved by 'keepSelection()'.
     * @param store If the store should also get cleared
     */
    clearSelection(store = true): void {
        store && (this._stored = []);
        this._selected = [];
        this._changed = {added: [], removed: []};
    }

    /**
     * @returns {Array} Selected elements
     */
    getSelection(): Array<Element> {
        return this._stored;
    }

    /**
     * @returns {HTMLElement} The selection area element
     */
    getSelectionArea(): HTMLElement {
        return this._area;
    }

    /**
     * Cancel the current selection process.
     * @param keepEvent {boolean} true to fire the onStop listener after cancel.
     */
    cancel(keepEvent = false): void {
        this._onTapStop(null, !keepEvent);
    }

    /**
     * Unbinds all events and removes the area-element
     */
    destroy(): void {
        this.disable();
        this._clippingElement.remove();
    }

    /**
     * Disable the selection functinality.
     */
    /* eslint-disable no-invalid-this */
    disable = this._bindStartEvents.bind(this, false);

    /**
     * Disable the selection functinality.
     */
    /* eslint-disable no-invalid-this */
    enable = this._bindStartEvents;

    /**
     * Adds elements to the selection
     * @param query - CSS Query, can be an array of queries
     * @param quiet - If this should not trigger the move event
     */
    select(query: SelectAllSelectors, quiet = false): Array<Element> {
        const {_changed, _selected, _stored, options} = this;
        const elements = selectAll(query, options.document).filter(el =>
            !_selected.includes(el) &&
            !_stored.includes(el)
        );

        // Update stores
        _selected.push(...elements);
        _changed.added.push(...elements);

        !quiet && this._emitMoveEvent(null);
        return elements;
    }

    /**
     * Removes an particular element from the selection.
     * @param el - Element to remove.
     * @param quiet - If this should not trigger the move event
     * @returns boolean - true if the element was successfully removed
     */
    deselect(el: Element, quiet = false): boolean {
        if (this._selected.includes(el)) {
            this._changed.removed.push(el);
            removeElement(this._stored, el);
            removeElement(this._selected, el);

            // Fire event
            !quiet && this._emitMoveEvent(null);
            return true;
        }

        return false;
    }
}
