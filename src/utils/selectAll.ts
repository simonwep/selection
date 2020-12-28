/**
 * Takes a selector (or array of selectors) and returns the matched nodes.
 * @param selector The selector or an Array of selectors.
 * @param doc
 * @returns {Array} Array of DOM-Nodes.
 */
export function selectAll(
    selector: (string | Element)[] | (string | Element), doc: Document = document
): Array<Node> {
    if (!Array.isArray(selector)) {
        selector = [selector];
    }

    const nodes = [];
    for (let i = 0, l = selector.length; i < l; i++) {
        const item = selector[i];

        if (typeof item === 'string') {
            nodes.push(...Array.from(doc.querySelectorAll(item)));
        } else if (item instanceof HTMLElement) {
            nodes.push(item);
        }
    }

    return nodes;
}
