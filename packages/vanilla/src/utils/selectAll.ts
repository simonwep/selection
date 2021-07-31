export type SelectAllSelectors = readonly (string | Element)[] | string | Element;

/**
 * Takes a selector (or array of selectors) and returns the matched nodes.
 * @param selector The selector or an Array of selectors.
 * @param doc
 * @returns {Array} Array of DOM-Nodes.
 */
export function selectAll(selector: SelectAllSelectors, doc: Document = document): Array<Element> {
    const list = !Array.isArray(selector) ? [selector] : selector;

    const nodes = [];
    for (let i = 0, l = list.length; i < l; i++) {
        const item = list[i];

        if (typeof item === 'string') {
            nodes.push(...Array.from(doc.querySelectorAll(item)));
        } else if (item instanceof Element) {
            nodes.push(item);
        }
    }

    return nodes;
}
