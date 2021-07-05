/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const deepAssign = (target: any, source: any): any => {
    for (const [key, value] of Object.entries(source)) {

        // Use the default value if there's no value specified
        target[key] = value === undefined ? target[key] :

            // Check if it's a nested object and merge if required
            (typeof value === 'object' && value !== null && !Array.isArray(value)) ?
                deepAssign(target[key], source[key]) :
                source[key];
    }

    return target;
};
