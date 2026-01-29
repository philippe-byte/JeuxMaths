/**
 * Utility to flatten a nested object into dot-notation keys
 */
export const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
    return Object.keys(obj).reduce((acc: any, k: string) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
};

/**
 * Utility to unflatten dot-notation keys back into a nested object
 */
export const unflattenObject = (data: Record<string, string>): any => {
    const result: any = {};
    for (const i in data) {
        const keys = i.split('.');
        keys.reduce((r, a, j) => {
            return r[a] || (r[a] = keys.length - 1 === j ? data[i] : {});
        }, result);
    }
    return result;
};
