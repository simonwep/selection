/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const deepAssign = <O extends Record<any, any>>(target: O, source: any): O => {
    for (const [key, value] of Object.entries(target)) {
        const sourceValue = source[key];

        // Use the default value if there's no value specified
        target[key as keyof O] = sourceValue === undefined ? target[key as keyof O] :

            // Check if it's a nested object and merge if required
            (typeof sourceValue === 'object' && typeof value === 'object' && value !== null && !Array.isArray(value)) ?
                deepAssign(value as O, sourceValue as Partial<O>) : sourceValue;
    }

    return target;
};
