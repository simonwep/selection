import {css, eventPath, intersects, off, on, removeElement, selectAll, SelectAllSelectors, simplifyEvent} from '@utils';
import {EventTarget} from './EventEmitter';
import {AreaLocation, Coordinates, ScrollEvent, SelectionEvents, SelectionOptions, SelectionStore} from './types';

// Re-export types
export * from './types';

// Some var shorting for better compression and readability
const {abs, max, min, ceil} = Math;

// Likely want to move this to utils
// Determines if the device's primary input supports touch
// See this article: https://css-tricks.com/touch-devices-not-judged-size/
const isTouchEnabled = window.matchMedia('(hover: none), (pointer: coarse)').matches;

export default class SelectionArea extends EventTarget<SelectionEvents> {
    public static version = VERSION;

    // Options
    private readonly _options: SelectionOptions;

    // Selection store
    private _selection: SelectionStore = {
        touched: [],
        stored: [],
        selected: [],
        changed: {
            added: [], // Added elements since last selection
            removed: [] // Removed elements since last selection
        }
    };

    // Area element and clipping element
    private readonly _area: HTMLElement;
    private readonly _clippingElement: HTMLElement;

    // Target container (element) and boundary (cached)
    private _targetElement?: Element;
    private _targetRect?: DOMRect;
    private _selectables: Array<Element> = [];

    // Caches the position of the selection-area
    private readonly _areaRect = new DOMRect();

    // Dynamically constructed area rect
    private _areaLocation: AreaLocation = {y1: 0, x2: 0, y2: 0, x1: 0};

    // If a single click is being performed.
    // It's a single-click until the user dragged the mouse.
    private _singleClick = true;

    // Is getting set on movement. Varied.
    private _scrollAvailable = true;
    private _scrollSpeed: Coordinates = {x: 0, y: 0};
    private _scrollDelta: Coordinates = {x: 0, y: 0};

    constructor(opt: Partial<SelectionOptions>) {
        super();

        this._options = Object.assign({
            class: 'selection-area',
            document: window.document,
            intersect: 'touch',
            startThreshold: 10,
            singleClick: true,
            allowTouch: true,
            overlap: 'invert',
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

        const {document} = this._options;
        this._area = document.createElement('div');
        this._clippingElement = document.createElement('div');
        this._clippingElement.appendChild(this._area);

        // Add class to the area element
        this._area.classList.add(this._options.class);

        // Apply basic styles to the area element
        css(this._area, {
            willChange: 'top, left, bottom, right, width, height',
            top: 0,
            left: 0,
            position: 'fixed'
        });

        css(this._clippingElement, {
            overflow: 'hidden',
            position: 'fixed',
            transform: 'translate3d(0, 0, 0)', // https://stackoverflow.com/a/38268846
            pointerEvents: 'none',
            zIndex: 1
        });

        this.enable();
    }

    _bindStartEvents(activate = true): void {
        const {document, allowTouch} = this._options;
        const fn = activate ? on : off;

        fn(document, 'mousedown', this._onTapStart);
        allowTouch && fn(document, 'touchstart', this._onTapStart, {
            passive: false
        });
    }

    _onTapStart(evt: MouseEvent | TouchEvent, silent = false): void {
        const {x, y, target} = simplifyEvent(evt);
        const {_options} = this;
        const {document} = this._options;
        const targetBoundingClientRect = target.getBoundingClientRect();

        // Find start-areas and boundaries
        const startAreas = selectAll(_options.startareas, _options.document);
        const resolvedBoundaries = selectAll(_options.boundaries, _options.document);

        // Check in which container the user currently acts
        this._targetElement = resolvedBoundaries.find(el =>
            intersects(el.getBoundingClientRect(), targetBoundingClientRect)
        );

        // Check if area starts in one of the start areas / boundaries
        const evtpath = eventPath(evt);
        if (!this._targetElement ||
            !startAreas.find(el => evtpath.includes(el)) ||
            !resolvedBoundaries.find(el => evtpath.includes(el))) {
            return;
        }

        if (!silent && this._emitEvent('beforestart', evt) === false) {
            return;
        }

        // Area rect
        this._areaLocation = {x1: x, y1: y, x2: 0, y2: 0};

        // Lock scrolling in target container
        // Solution to preventing scrolling taken fr
        const scrollElement = document.scrollingElement || document.body;
        this._scrollDelta = {x: scrollElement.scrollLeft, y: scrollElement.scrollTop};

        // To detect single-click
        this._singleClick = true;
        this.clearSelection(false);

        // Add listener
        on(document, ['touchmove', 'mousemove'], this._delayedTapMove, {passive: false});
        on(document, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);
        on(document, 'scroll', this._onScroll);
    }

    _onSingleTap(evt: MouseEvent | TouchEvent): void {
        const {intersect} = this._options.singleTap;
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

        // Grab current store first in case it gets resetted
        const {stored} = this._selection;

        // Emit event and process element
        this._emitEvent('start', evt);
        if (evt.shiftKey && stored.length) {
            const reference = stored[stored.length - 1];

            // Resolve correct range
            const [preceding, following] = reference.compareDocumentPosition(target) & 4 ? [target, reference] : [reference, target];

            const rangeItems = [...this._selectables.filter(el =>
                (el.compareDocumentPosition(preceding) & 4) &&
                (el.compareDocumentPosition(following) & 2)
            ), target];

            this.select(rangeItems);
        } else if (stored.includes(target)) {
            this.deselect(target);
        } else {
            this.select(target);
        }

        this._emitEvent('stop', evt);
    }

    _delayedTapMove(evt: MouseEvent | TouchEvent): void {
        const {startThreshold, container, document, allowTouch} = this._options;
        const {x1, y1} = this._areaLocation; // Coordinates of first "tap"
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
            selectAll(container, document)[0].appendChild(this._clippingElement);

            // Now after the threshold is reached resolve all selectables
            this.resolveSelectables();

            // An action is recognized as single-select until the user performed a mutli-selection
            this._singleClick = false;

            // Just saving the boundaries of this container for later
            this._targetRect = this._targetElement!.getBoundingClientRect();

            // Find container and check if it's scrollable
            this._scrollAvailable =
                this._targetElement!.scrollHeight !== this._targetElement!.clientHeight ||
                this._targetElement!.scrollWidth !== this._targetElement!.clientWidth;

            if (this._scrollAvailable) {

                // Detect mouse scrolling
                on(document, 'wheel', this._manualScroll, {passive: false});

                /**
                 * The selection-area will also cover other element which are
                 * out of the current scrollable parent. So find all elements
                 * which are in the current scrollable element. Later these are
                 * the only selectables instead of all.
                 */
                this._selectables = this._selectables.filter(s => this._targetElement!.contains(s));
            }

            // Trigger recalc and fire event
            this._prepareSelectionArea();
            this._emitEvent('start', evt);
            this._onTapMove(evt);
        }

        if (allowTouch && isTouchEnabled) {
            evt.preventDefault(); // Prevent swipe-down refresh
        }
    }

    _prepareSelectionArea(): void {
        const {_clippingElement, _targetElement, _area} = this;
        const tr = this._targetRect = _targetElement!.getBoundingClientRect();

        if (this._scrollAvailable) {

            /**
             * To clip the area, the selection area has a parent
             * which has exact the same dimensions as the scrollable elemeent.
             * Now if the area exeeds these boundaries it will be cropped.
             */
            css(_clippingElement, {
                top: tr.top,
                left: tr.left,
                width: tr.width,
                height: tr.height
            });

            /**
             * The area element is relative to the clipping element,
             * but when this is moved or transformed we need to correct
             * the positions via a negative margin.
             */
            css(_area, {
                marginTop: -tr.top,
                marginLeft: -tr.left
            });
        } else {

            /**
             * Reset margin and clipping element dimensions.
             */
            css(_clippingElement, {
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
            });

            css(_area, {
                marginTop: 0,
                marginLeft: 0
            });
        }
    }

    _onTapMove(evt: MouseEvent | TouchEvent): void {
        const {x, y} = simplifyEvent(evt);
        const {_scrollSpeed, _areaLocation, _options} = this;
        const {allowTouch} = _options;
        const {speedDivider} = _options.scrolling;
        const scon = this._targetElement as Element;

        _areaLocation.x2 = x;
        _areaLocation.y2 = y;

        if (this._scrollAvailable && (_scrollSpeed.y || _scrollSpeed.x)) {
            const scroll = () => {
                if (!_scrollSpeed.x && !_scrollSpeed.y) {
                    return;
                }

                /**
                 * If the value exeeds the scrollable area it will
                 * be set to the max / min value. So change only
                 */
                const {scrollTop, scrollLeft} = scon;

                // Reduce velocity, use ceil in both directions to scroll at least 1px per frame
                if (_scrollSpeed.y) {
                    scon.scrollTop += ceil(_scrollSpeed.y / speedDivider);
                    _areaLocation.y1 -= scon.scrollTop - scrollTop;
                }

                if (_scrollSpeed.x) {
                    scon.scrollLeft += ceil(_scrollSpeed.x / speedDivider);
                    _areaLocation.x1 -= scon.scrollLeft - scrollLeft;
                }

                /**
                 * We changed the start coordinates -> redraw the selectiona area
                 * We changed the dimensions of the area element -> re-calc selected elements
                 * The selected elements array has been changed -> fire event
                 */
                this._recalculateSelectionAreaRect();
                this._updateElementSelection();
                this._emitEvent('move', evt);
                this._redrawSelectionArea();

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
            this._recalculateSelectionAreaRect();
            this._updateElementSelection();
            this._emitEvent('move', evt);
            this._redrawSelectionArea();
        }

        if (allowTouch && isTouchEnabled) {
            evt.preventDefault(); // Prevent swipe-down refresh
        }
    }

    _onScroll(): void {
        const {_scrollDelta, _options: {document}} = this;

        // Resolve scrolling offsets
        const {scrollTop, scrollLeft} = document.scrollingElement || document.body;

        // Adjust area start location
        this._areaLocation.x1 += _scrollDelta.x - scrollLeft;
        this._areaLocation.y1 += _scrollDelta.y - scrollTop;
        _scrollDelta.x = scrollLeft;
        _scrollDelta.y = scrollTop;

        // The area needs to be resetted as the target-container has changed in its position
        this._prepareSelectionArea();
        this._recalculateSelectionAreaRect();
        this._updateElementSelection();
        this._emitEvent('move', null);
        this._redrawSelectionArea();
    }

    _manualScroll(evt: ScrollEvent): void {
        const {manualSpeed} = this._options.scrolling;

        // Consistent scrolling speed on all browsers
        const deltaY = evt.deltaY ? (evt.deltaY > 0 ? 1 : -1) : 0;
        const deltaX = evt.deltaX ? (evt.deltaX > 0 ? 1 : -1) : 0;
        this._scrollSpeed.y += deltaY * manualSpeed;
        this._scrollSpeed.x += deltaX * manualSpeed;
        this._onTapMove(evt);

        // Prevent defaul scrolling behaviour, eg. page scrolling
        evt.preventDefault();
    }

    _recalculateSelectionAreaRect(): void {
        const {_scrollSpeed, _areaLocation, _areaRect, _targetElement, _targetRect} = this;
        const {scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth} = _targetElement as Element;
        const brect = _targetRect as DOMRect;
        let {x1, y1, x2, y2} = _areaLocation;

        if (x2 < brect.left) {
            _scrollSpeed.x = scrollLeft ? -abs(brect.left - x2) : 0;
            x2 = brect.left;
        } else if (x2 > brect.right) {
            _scrollSpeed.x = scrollWidth - scrollLeft - clientWidth ? abs(brect.left + brect.width - x2) : 0;
            x2 = brect.right;
        } else {
            _scrollSpeed.x = 0;
        }

        if (y2 < brect.top) {
            _scrollSpeed.y = scrollTop ? -abs(brect.top - y2) : 0;
            y2 = brect.top;
        } else if (y2 > brect.bottom) {
            _scrollSpeed.y = scrollHeight - scrollTop - clientHeight ? abs(brect.top + brect.height - y2) : 0;
            y2 = brect.bottom;
        } else {
            _scrollSpeed.y = 0;
        }

        const x3 = min(x1, x2);
        const y3 = min(y1, y2);
        const x4 = max(x1, x2);
        const y4 = max(y1, y2);

        _areaRect.x = x3;
        _areaRect.y = y3;
        _areaRect.width = x4 - x3;
        _areaRect.height = y4 - y3;
    }

    _redrawSelectionArea(): void {
        const {x, y, width, height} = this._areaRect;
        const {style} = this._area;

        // Using transform will make the area's borders look blurry
        style.left = `${x}px`;
        style.top = `${y}px`;
        style.width = `${width}px`;
        style.height = `${height}px`;
    }

    _onTapStop(evt: MouseEvent | TouchEvent | null, silent: boolean): void {
        const {document, singleTap} = this._options;
        const {_singleClick} = this;

        // Remove event handlers
        off(document, ['mousemove', 'touchmove'], this._delayedTapMove);
        off(document, ['touchmove', 'mousemove'], this._onTapMove);
        off(document, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);
        off(document, 'scroll', this._onScroll);

        if (evt && _singleClick && singleTap.allow) {
            this._onSingleTap(evt);
        } else if (!_singleClick && !silent) {
            this._updateElementSelection();
            this._emitEvent('stop', evt);
        }

        // Reset scroll speed
        this._scrollSpeed.x = 0;
        this._scrollSpeed.y = 0;

        // Unbind mouse scrolling listener
        this._scrollAvailable && off(document, 'wheel', this._manualScroll, {passive: true});

        // Remove selection-area from dom
        this._clippingElement.remove();

        // Hide selection area
        css(this._area, 'display', 'none');
    }

    _updateElementSelection(): void {
        const {_selectables, _options, _selection, _areaRect} = this;
        const {stored, selected, touched} = _selection;
        const {intersect, overlap} = _options;

        // Update
        const newlyTouched = [];
        const added = [];
        const removed = [];

        // Itreate over the selectable elements
        for (let i = 0; i < _selectables.length; i++) {
            const node = _selectables[i];

            // Check if area intersects element
            if (intersects(_areaRect, node.getBoundingClientRect(), intersect)) {

                // Check if the element wasn't present in the last selection.
                if (!selected.includes(node)) {

                    // Check if user wants to invert the selection for already selected elements
                    if (overlap === 'invert' && stored.includes(node)) {
                        removed.push(node);
                        continue;
                    } else {
                        added.push(node);
                    }
                } else if (stored.includes(node) && !touched.includes(node)) {
                    touched.push(node);
                }

                newlyTouched.push(node);
            }
        }

        // Re-select elements which were previously stored
        if (overlap === 'invert') {
            added.push(...stored.filter(v => !selected.includes(v)));
        }

        // Check which elements where removed since last selection
        for (let i = 0; i < selected.length; i++) {
            const node = selected[i];

            if (!newlyTouched.includes(node) && !(

                // Check if user wants to keep previously selected elements, e.g.
                // not make them part of the current selection as soon as they're touched.
                overlap === 'keep' && stored.includes(node)
            )) {
                removed.push(node);
            }
        }

        // Save
        _selection.selected = newlyTouched;
        _selection.changed = {added, removed};
    }

    _emitEvent(name: keyof SelectionEvents, evt: MouseEvent | TouchEvent | null): unknown {
        return this.emit(name, {
            event: evt,
            store: this._selection
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
        this._selectables = selectAll(this._options.selectables, this._options.document);
    }

    /**
     * Saves the current selection for the next selecion.
     * Allows multiple selections.
     */
    keepSelection(): void {
        const {_options, _selection} = this;
        const {selected, changed, touched, stored} = _selection;

        // Newly added elements
        const addedElements = selected.filter(el => !stored.includes(el));

        switch (_options.overlap) {
            case 'drop': {
                _selection.stored = addedElements.concat(

                    // Elements not touched
                    stored.filter(el => !touched.includes(el))
                );
                break;
            }
            case 'invert': {
                _selection.stored = addedElements.concat(

                    // Elements not removed from selection
                    stored.filter(el => !changed.removed.includes(el))
                );
                break;
            }
            case 'keep': {
                _selection.stored = stored.concat(

                    // Newly added
                    selected.filter(el => !stored.includes(el))
                );
                break;
            }
        }
    }

    /**
     * Clear the elements which where saved by 'keepSelection()'.
     * @param store If the store should also get cleared
     */
    clearSelection(store = true): void {
        this._selection = {
            stored: store ? [] : this._selection.stored,
            selected: [],
            touched: [],
            changed: {
                added: [],
                removed: []
            }
        };
    }

    /**
     * @returns {Array} Selected elements
     */
    getSelection(): Array<Element> {
        return this._selection.stored;
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
        const {changed, selected, stored} = this._selection;
        const elements = selectAll(query, this._options.document).filter(el =>
            !selected.includes(el) &&
            !stored.includes(el)
        );

        // Update stores
        selected.push(...elements);
        changed.added.push(...elements);

        !quiet && this._emitEvent('move', null);
        return elements;
    }

    /**
     * Removes an particular element from the selection.
     * @param el - Element to remove.
     * @param quiet - If this should not trigger the move event
     * @returns boolean - true if the element was successfully removed
     */
    deselect(el: Element, quiet = false): boolean {
        const {selected, stored, changed} = this._selection;

        if (
            selected.includes(el) ||
            stored.includes(el)
        ) {
            changed.removed.push(el);
            removeElement(stored, el);
            removeElement(selected, el);

            // Fire event
            !quiet && this._emitEvent('move', null);
            return true;
        }

        return false;
    }
}
