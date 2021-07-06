/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const deepAssign = <O>(target: O, source: any): O => {
    for (const [key, value] of Object.entries(target)) {

        // Use the default value if there's no value specified
        target[key as keyof O] = source[key] === undefined ? target[key as keyof O] :

            // Check if it's a nested object and merge if required
            (typeof value === 'object' && value !== null && !Array.isArray(value)) ?
                deepAssign(value as O, source[key] as Partial<O>) : source[key];
    }

    return target;
};
