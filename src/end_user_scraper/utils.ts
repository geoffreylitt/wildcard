import {
    ADAPTERS_BASE_KEY
} from './constants';
import { getColumnMap } from './state';

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

export function copyMap(map) {
    const result = new Map();
    for (let [column, selectors] of map) {
        if (Array.isArray(selectors)) {
            result.set(column, [...selectors]);
        } else {
            result.set(column, selectors);
        }
    }
    return result;
}

export function applyToColumnMap(map) {
    const columnMap = getColumnMap();
    for (let [column, selectors] of map) {
        if (Array.isArray(selectors)) {
            columnMap.set(column, [...selectors]);
        } else {
            columnMap.set(column, selectors);
        }
    }
}

export function generateAdapterKey(id) {
    return `${ADAPTERS_BASE_KEY}:${id}`
}

export function newSelector(selector, columnMap) {
    let seen = false;
    for (let [column, selectors] of columnMap) {
        if (Array.isArray(selectors)) {
            if (selectors.includes(selector)) {
                seen = true;
                break;
            }
        }
    }
    return !seen;
}

export function getColumnForSelector(columnMap, selector) {
    for (let [column, selectors] of columnMap) {
        if (Array.isArray(selectors)) {
            if (selectors.includes(selector)) {
                return column;
            }
        }
    }
    return null;
}

export function indexToAlpha(i) {
    return String.fromCharCode(97 + i).toUpperCase();
}