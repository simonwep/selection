/**
 * Selection, library to realize visual DOM-Selection like on your Desktop.
 *
 * @author  Simon Reinisch
 * @license MIT
 */

// import utils and event dispatcher
import * as event from './events';
import * as _ from './utils';

const abs = Math.abs,
    max = Math.max,
    min = Math.min,
    preventDefault = ev => ev.preventDefault();

function Selection() {

    // Default options
    const defaults = {
        class: 'selection-area',
        startThreshold: 10,
        singleClick: true,
        disableTouch: false,
        containers: [],
        selectables: [],
        startareas: ['html'],
        boundaries: ['html']
    };

    this.options = Object.assign(defaults, options);

    // Bind all private methods
    for (let fn in this) {
        if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
            this[fn] = this[fn].bind(this);
        }
    }

    // Store for keepSelection
    this._selectedStore = [];

    // Create area element
    this.areaElement = document.createElement('div');
    document.body.appendChild(this.areaElement);
    _.css(this.areaElement, {
        top: 0,
        left: 0,
        position: 'fixed'
    });

    // Bind events
    _.on(document, 'mousedown', this._onTapStart);

    if (!this.options.disableTouch) {
        _.on(document, 'touchstart', this._onTapStart, {
            passive: false
        });
    }
}

Selection.prototype = {
    constructor: Selection,

    _onTapStart(evt) {
        const touch = evt.touches && evt.touches[0];
        const target = (touch || evt).target;

        const startAreas = _.selectAll(this.options.startareas);
        this._boundaries = _.selectAll(this.options.boundaries);

        const evtpath = _.eventPath(evt);
        if (!startAreas.find((el) => evtpath.includes(el)) ||
            !this._boundaries.find((el) => evtpath.includes(el))) {
            return;
        }

        // Save start coordinates
        this._lastX = (touch || evt).clientX;
        this._lastY = (touch || evt).clientY;
        this._singleClick = true; // To detect single-click

        // Resolve selectors
        const containers = _.selectAll(this.options.containers);
        this._selectables = _.selectAll(this.options.selectables);
        containers.forEach(con =>
            this._selectables.push(...con.getElementsByTagName('*')));

        // Save current boundary
        this._targetBoundary = this._boundaries.find((el) => _.intersects(el, target)).getBoundingClientRect();

        this._touchedElements = [];
        this._changedElements = {
            added: [],
            removed: []
        };

        // Add class to the area element
        this.areaElement.classList.add(this.options.class);

        // Prevent default selection
        document.addEventListener('selectstart', preventDefault);

        // Add listener
        _.on(document, 'mousemove', this._delayedTapMove);
        _.on(document, 'touchmove', this._delayedTapMove, {
            passive: false
        });

        _.on(document, 'mouseup', this._onTapStop);
        _.on(document, 'touchcancel', this._onTapStop);
        _.on(document, 'touchend', this._onTapStop);

        evt.preventDefault();
    },

    _onSingleTap(evt) {
        const touch = evt.touches && evt.touches[0];
        const target = (touch || evt).target;

        // Check if the element is seletable
        if (!this._selectables.includes(target))
            return;

        // Check if this element
        this._touchedElements.push(target);

        const touched = this._selectedStore;
        const changed = this._changedElements;

        event.dispatchEvent(this, 'onSelect', this.areaElement, evt, touched, changed, {
            target
        });
    },

    _delayedTapMove(evt) {
        const touch = evt.touches && evt.touches[0];
        const x = (touch || evt).clientX;
        const y = (touch || evt).clientY;

        // Check pixel threshold
        if (abs((x + y) - (this._lastX + this._lastY)) >= this.options.startThreshold) {

            _.off(document, 'mousemove', this._delayedTapMove);
            _.off(document, 'touchmove', this._delayedTapMove);

            _.on(document, 'mousemove', this._onTapMove);
            _.on(document, 'touchmove', this._onTapMove);

            _.css(this.areaElement, 'display', 'block');

            // New start position
            this._updateArea(evt);

            // Fire event
            const touched = this._touchedElements.concat(this._selectedStore);
            const changed = this._changedElements;
            event.dispatchEvent(this, 'onStart', this.areaElement, evt, touched, changed);

            // An action is recognized as single-select until
            // the user performed an mutli-selection
            this._singleClick = false;
        }
    },

    _onTapMove(evt) {
        this._updateArea(evt);
        this._updatedTouchingElements();
        const touched = this._touchedElements.concat(this._selectedStore);
        const changed = this._changedElements;
        event.dispatchEvent(this, 'onMove', this.areaElement, evt, touched, changed);
    },

    _updateArea(evt) {
        const brect = this._targetBoundary;
        const touch = evt.touches && evt.touches[0];
        let x2 = (touch || evt).clientX;
        let y2 = (touch || evt).clientY;

        if (x2 < brect.left) x2 = brect.left;
        if (y2 < brect.top) y2 = brect.top;
        if (x2 > brect.left + brect.width) x2 = brect.left + brect.width;
        if (y2 > brect.top + brect.height) y2 = brect.top + brect.height;

        const x3 = min(this._lastX, x2);
        const y3 = min(this._lastY, y2);
        const x4 = max(this._lastX, x2);
        const y4 = max(this._lastY, y2);

        _.css(this.areaElement, {
            top: y3,
            left: x3,
            width: x4 - x3,
            height: y4 - y3
        });
    },

    _onTapStop(evt, noevent) {
        _.off(document, 'mousemove', this._delayedTapMove);
        _.off(document, 'touchmove', this._delayedTapMove);

        _.off(document, 'mousemove', this._onTapMove);
        _.off(document, 'touchmove', this._onTapMove);

        _.off(document, 'mouseup', this._onTapStop);
        _.off(document, 'touchcancel', this._onTapStop);
        _.off(document, 'touchend', this._onTapStop);

        if (this._singleClick) {
            this._onSingleTap(evt);

        } else if (!noevent) {

            this._updatedTouchingElements();
            const touched = this._touchedElements.concat(this._selectedStore);
            const changed = this._changedElements;

            event.dispatchEvent(this, 'onStop', this.areaElement, evt, touched, changed);
        }

        // Enable default selection
        document.removeEventListener('selectstart', preventDefault);

        _.css(this.areaElement, 'display', 'none');
    },

    _updatedTouchingElements() {
        const touched = [];
        const changed = {
            added: [],
            removed: []
        };

        // Itreate over the selectable elements
        this._selectables.forEach(node => {

                // Fire filter event
                if (event.dispatchFilterEvent(this, 'selectionFilter', node) !== false) {

                    // Check if area intersects element
                    if (_.intersects(this.areaElement, node)) {

                        // Check if the element wasn't present in the last selection.
                        if (!this._touchedElements.includes(node)) {
                            changed.added.push(node);
                        }

                        touched.push(node);
                    }
                }
            }
        );

        // Check which elements where removed since last selection
        changed.removed = this._touchedElements.filter(el => !touched.includes(el));

        // Save
        this._touchedElements = touched;
        this._changedElements = changed;
    },

    /**
     * Saves the current selection for the next selecion.
     * Allows multiple selections.
     */
    keepSelection() {
        const keep = this._touchedElements.filter(x => !this._selectedStore.includes(x));
        this._selectedStore = keep.concat(this._selectedStore);
    },

    /**
     * Clear the elements which where saved by 'keepSelection()'.
     */
    clearSelection() {
        this._selectedStore = [];
    },

    /**
     * Removes an particular element from the selection.
     */
    removeFromSelection(el) {
        _.removeElement(this._selectedStore, el);
        _.removeElement(this._touchedElements, el);
    },


    /**
     * Cancel the current selection process.
     * @param  {boolean} true to fire the onStop listener after cancel.
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
        _.off(document, 'mousedown', this._onTapStart);
    },

    /**
     * Disable the selection functinality.
     */
    enable() {
        _.on(document, 'mousedown', this._onTapStart);
    }
};

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
Selection.create = (options) => new Selection(options);

// Set version
Selection.version = '0.0.10';

// Export API
module.exports = Selection;