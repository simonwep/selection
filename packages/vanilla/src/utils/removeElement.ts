/**
 * Removes an element from an Array.
 */
export function removeElement<T>(arr: T[], el: T): void {
    const index = arr.indexOf(el);

    if (~index) {
        arr.splice(index, 1);
    }
}
