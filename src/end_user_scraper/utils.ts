import {
    ADAPTERS_BASE_KEY
} from './constants';

export function randomRGB() {
    const o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
}

export function getAllCombinations(chars) {
    const result = [];
    const f = (prefix, chars) => {
        for (let i = 0; i < chars.length; i++) {
            result.push(`${prefix}.${chars[i]}`);
            f(`${prefix}.${chars[i]}`, chars.slice(i + 1));
        }
    };
    f('', chars);
    return result;
}

export function mapToArrayOfValues(map) {
    const result: Array<Array<string>> = [];
    map.forEach((value) => {
        result.push(value);
    })
    return result;
}

export function generateAdapterKey(id) {
    return `${ADAPTERS_BASE_KEY}:${id}`
}