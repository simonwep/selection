import {EventTarget} from './EventEmitter';
import type {AreaLocation, Coordinates, ScrollEvent, SelectionEvents, SelectionOptions, SelectionStore} from './types';
import {PartialSelectionOptions} from './types';
import {css, frames, deepAssign, eventPath, intersects, isTouchDevice, off, on, removeElement, selectAll, SelectAllSelectors, simplifyEvent, Frames} from './utils';

// Re-export types
export * from './types';

// Some var shorting for better compression and readability
const {abs, max, min, ceil} = Math;

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
    private _latestElement?: Element;

    // Caches the position of the selection-area
    private readonly _areaRect = new DOMRect();

    // Dynamically constructed area rect
    private _areaLocation: AreaLocation = {y1: 0, x2: 0, y2: 0, x1: 0};

    // If a single click is being performed.
    // It's a single-click until the user dragged the mouse.
    private _singleClick = true;
    private _frame: Frames;

    // Is getting set on movement. Varied.
    private _scrollAvailable = true;
    private _scrollSpeed: Coordinates = {x: 0, y: 0};
    private _scrollDelta: Coordinates = {x: 0, y: 0};

    constructor(opt: PartialSelectionOptions) {
        super();

        this._options = deepAssign<SelectionOptions>({
            enabled:true,
            selectionAreaClass: 'selection-area',
            selectionContainerClass: undefined,
            selectables: [],
            document: window.document,

            behaviour: {
                overlap: 'invert',
                intersect: 'touch',
                startThreshold: {x: 10, y: 10},
                scrolling: {
                    speedDivider: 10,
                    manualSpeed: 750,
                    startScrollMargins: {x: 0, y: 0}
                }
            },

            features: {
                range: true,
                touch: true,
                singleTap: {
                    allow: true,
                    intersect: 'native'
                }
            },

            startAreas: ['html'],
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

        const {document, selectionAreaClass, selectionContainerClass} = this._options;
        this._area = document.createElement('div');
        this._clippingElement = document.createElement('div');
        this._clippingElement.appendChild(this._area);

        this._area.classList.add(selectionAreaClass);
        selectionContainerClass && this._clippingElement.classList.add(selectionContainerClass);

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
            zIndex: '1'
        });

        this._frame = frames((evt: MouseEvent | TouchEvent) => {
            this._recalculateSelectionAreaRect();
            this._updateElementSelection();
            this._emitEvent('move', evt);
            this._redrawSelectionArea();
        });

        if(this._options.enabled)this.enable();
    }

    _bindStartEvents(activate = true): void {
        const {document, features} = this._options;
        const fn = activate ? on : off;

        fn(document, 'mousedown', this._onTapStart);
        features.touch && fn(document, 'touchstart', this._onTapStart, {
            passive: false
        });
    }

    _onTapStart(evt: MouseEvent | TouchEvent, silent = false): void {
        const {x, y, target} = simplifyEvent(evt);
        const {_options} = this;
        const {document} = this._options;
        const targetBoundingClientRect = target.getBoundingClientRect();

        // Find start-areas and boundaries
        const startAreas = selectAll(_options.startAreas, _options.document);
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

        this._areaLocation = {x1: x, y1: y, x2: 0, y2: 0};

        // Lock scrolling in target container
        // Solution to preventing scrolling taken fr
        const scrollElement = document.scrollingElement || document.body;
        this._scrollDelta = {x: scrollElement.scrollLeft, y: scrollElement.scrollTop};

        // To detect single-click
        this._singleClick = true;
        this.clearSelection(false);

        on(document, ['touchmove', 'mousemove'], this._delayedTapMove, {passive: false});
        on(document, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);
        on(document, 'scroll', this._onScroll);
    }

    _onSingleTap(evt: MouseEvent | TouchEvent): void {
        const {singleTap: {intersect}, range} = this._options.features;
        const e = simplifyEvent(evt);
        let target = null;

        if (intersect === 'native') {
            target = e.target;
        } else if (intersect === 'touch') {
            this.resolveSelectables();

            const {x, y} = e;
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
        this._emitEvent('start', evt);

        if (evt.shiftKey && stored.length && range) {
            const reference = this._latestElement ?? stored[0];

            // Resolve correct range
            const [preceding, following] = reference.compareDocumentPosition(target) & 4 ?
                [target, reference] : [reference, target];

            const rangeItems = [...this._selectables.filter(el =>
                (el.compareDocumentPosition(preceding) & 4) &&
                (el.compareDocumentPosition(following) & 2)
            ), preceding, following];

            this.select(rangeItems);
        } else if (
            stored.includes(target) && (
                stored.length === 1 || evt.ctrlKey ||
                stored.every(v => this._selection.stored.includes(v))
            )
        ) {
            this.deselect(target);
        } else {
            this._latestElement = target;
            this.select(target);
        }

        this._emitEvent('stop', evt);
    }

    _delayedTapMove(evt: MouseEvent | TouchEvent): void {
        const {container, document, features, behaviour: {startThreshold}} = this._options;
        const {x1, y1} = this._areaLocation; // Coordinates of first "tap"
        const {x, y} = simplifyEvent(evt);

        // Check pixel threshold
        const thresholdType = typeof startThreshold;
        if (

            // Single number for both coordinates
            (thresholdType === 'number' && abs((x + y) - (x1 + y1)) >= startThreshold) ||

            // Different x and y threshold
            (thresholdType === 'object' && abs(x - x1) >= (startThreshold as Coordinates).x || abs(y - y1) >= (startThreshold as Coordinates).y)
        ) {
            off(document, ['mousemove', 'touchmove'], this._delayedTapMove, {passive: false});

            if (this._emitEvent('beforedrag', evt) === false) {
                off(document, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);
                return;
            }

            on(document, ['mousemove', 'touchmove'], this._onTapMove, {passive: false});

            // Make area element visible
            css(this._area, 'display', 'block');

            // Apppend selection-area to the dom
            selectAll(container, document)[0].appendChild(this._clippingElement);

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

        if (features.touch && isTouchDevice()) {
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

            // "Reset" styles
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
        const {_scrollSpeed, _areaLocation, _options, _frame} = this;
        const {features} = _options;
        const {speedDivider} = _options.behaviour.scrolling;
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
                _frame.next(evt);

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
            _frame.next(evt);
        }

        if (features.touch && isTouchDevice()) {
            evt.preventDefault(); // Prevent swipe-down refresh
        }
    }

    _onScroll(): void {
        const {_scrollDelta, _options: {document}} = this;
        const {scrollTop, scrollLeft} = document.scrollingElement || document.body;

        // Adjust area start location
        this._areaLocation.x1 += _scrollDelta.x - scrollLeft;
        this._areaLocation.y1 += _scrollDelta.y - scrollTop;
        _scrollDelta.x = scrollLeft;
        _scrollDelta.y = scrollTop;

        // The area needs to be resetted as the target-container has changed in its position
        this._prepareSelectionArea();
        this._frame.next(null);
    }

    _manualScroll(evt: ScrollEvent): void {
        const {manualSpeed} = this._options.behaviour.scrolling;

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
        const {_scrollSpeed, _areaLocation, _areaRect, _targetElement, _targetRect, _options} = this;
        const {scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth} = _targetElement as Element;
        const brect = _targetRect as DOMRect;
        const {x1, y1} = _areaLocation;
        let {x2, y2} = _areaLocation;
        const {behaviour: {scrolling: {startScrollMargins}}} = _options;

        if (x2 < brect.left + startScrollMargins.x) {
            _scrollSpeed.x = scrollLeft ? -abs(brect.left - x2 + startScrollMargins.x) : 0;
            x2 = x2 < brect.left ? brect.left : x2;
        } else if (x2 > brect.right - startScrollMargins.x) {
            _scrollSpeed.x = scrollWidth - scrollLeft - clientWidth ? abs(brect.left + brect.width - x2 - startScrollMargins.x) : 0;
            x2 = x2 > brect.right ? brect.right : x2;
        } else {
            _scrollSpeed.x = 0;
        }

        if (y2 < brect.top + startScrollMargins.y) {
            _scrollSpeed.y = scrollTop ? -abs(brect.top - y2 + startScrollMargins.y) : 0;
            y2 = y2 < brect.top ? brect.top : y2;
        } else if (y2 > brect.bottom - startScrollMargins.y) {
            _scrollSpeed.y = scrollHeight - scrollTop - clientHeight ? abs(brect.top + brect.height - y2 - startScrollMargins.y) : 0;
            y2 = y2 > brect.bottom ? brect.bottom : y2;
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
        const {document, features} = this._options;
        const {_singleClick} = this;

        // Remove event handlers
        off(document, ['mousemove', 'touchmove'], this._delayedTapMove);
        off(document, ['touchmove', 'mousemove'], this._onTapMove);
        off(document, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);
        off(document, 'scroll', this._onScroll);

        if (evt && _singleClick && features.singleTap.allow) {
            this._onSingleTap(evt);
        } else if (!_singleClick && !silent) {
            this._updateElementSelection();
            this._emitEvent('stop', evt);
        }

        this._scrollSpeed.x = 0;
        this._scrollSpeed.y = 0;

        // Unbind mouse scrolling listener
        this._scrollAvailable && off(document, 'wheel', this._manualScroll, {passive: true});

        // Remove selection-area from dom
        this._clippingElement.remove();

        // Cancel current frame
        this._frame?.cancel();

        // Hide selection area
        css(this._area, 'display', 'none');
        this._keepSelection();
    }

    _updateElementSelection(): void {
        const {_selectables, _options, _selection, _areaRect} = this;
        const {stored, selected, touched} = _selection;
        const {intersect, overlap} = _options.behaviour;

        const invert = overlap === 'invert';
        const newlyTouched: Element[] = [];
        const added: Element[] = [];
        const removed: Element[] = [];

        // Find newly selected elements
        for (let i = 0; i < _selectables.length; i++) {
            const node = _selectables[i];

            // Check if area intersects element
            if (intersects(_areaRect, node.getBoundingClientRect(), intersect)) {

                // Check if the element wasn't present in the last selection.
                if (!selected.includes(node)) {

                    // Check if user wants to invert the selection for already selected elements
                    if (invert && stored.includes(node)) {
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
        if (invert) {
            added.push(...stored.filter(v => !selected.includes(v)));
        }

        // Check which elements where removed since last selection
        const keep = overlap === 'keep';
        for (let i = 0; i < selected.length; i++) {
            const node = selected[i];

            if (!newlyTouched.includes(node) && !(

                // Check if user wants to keep previously selected elements, e.g.
                // not make them part of the current selection as soon as they're touched.
                keep && stored.includes(node)
            )) {
                removed.push(node);
            }
        }

        _selection.selected = newlyTouched;
        _selection.changed = {added, removed};
        this._latestElement = newlyTouched[newlyTouched.length - 1];
    }

    _emitEvent(name: keyof SelectionEvents, evt: MouseEvent | TouchEvent | null): unknown {
        return this.emit(name, {
            event: evt,
            store: this._selection,
            selection: this
        });
    }

    _keepSelection(): void {
        const {_options, _selection} = this;
        const {selected, changed, touched, stored} = _selection;
        const addedElements = selected.filter(el => !stored.includes(el));

        switch (_options.behaviour.overlap) {
            case 'drop': {
                _selection.stored = [
                    ...addedElements,
                    ...stored.filter(el => !touched.includes(el))  // Elements not touched
                ];
                break;
            }
            case 'invert': {
                _selection.stored = [
                    ...addedElements,
                    ...stored.filter(el => !changed.removed.includes(el))  // Elements not removed from selection
                ];
                break;
            }
            case 'keep': {
                _selection.stored = [
                    ...stored,
                    ...selected.filter(el => !stored.includes(el)) // Newly added
                ];
                break;
            }
        }
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
     * Unbinds all events and removes the area-element.
     */
    destroy(): void {
        this.cancel();
        this.disable();
        this._clippingElement.remove();
        super.unbindAllListeners();
    }

    /* eslint-disable no-invalid-this */
    disable = this._bindStartEvents.bind(this, false);
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

        stored.push(...elements);
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
