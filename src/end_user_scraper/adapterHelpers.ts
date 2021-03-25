import {
    readFromChromeLocalStorage,
    saveToChromeLocalStorage,
    removeFromChromeLocalStorage
} from '../utils';

import {
    ADAPTERS_BASE_KEY
} from './constants';
import {
    indexToAlpha
} from './utils';

import {
    getCachedActiveAdapter,
    setAdapterKey
} from './state';

import { userStore } from '../localStorageAdapter';

function createTableColumns(n) {
    const columns = [];
    for (let i = 0; i < n; i++) {
        columns.push({
            name: indexToAlpha(i),
            type: "element"
        })
    }
    return columns;
}

function createAdapterData(rowSelector, columnSelectors) {
    const attributes = [];
    if (columnSelectors && columnSelectors.length) {
        // add row element attribute
        attributes.push({
            name: "rowElement",
            type: "element",
            formula: `=QuerySelector(null, "${rowSelector}")`,
            hidden: true
        });
        // add remaining attributes
        columnSelectors.forEach((columnSelectorList, index) => {
            attributes.push({
                name: indexToAlpha(index),
                type: "element",
                formula: `=QuerySelector(rowElement, "${columnSelectorList[0]}")`
            });
        });
    }
    return {
        attributes
    }
}

function _createAdapterId() {
    return document.title;
}

export function createAdapterKey() {
    return `${ADAPTERS_BASE_KEY}:${_createAdapterId()}`
}

function _saveAdapter(adapterKey, config, callback?) {
    const _config = JSON.stringify(config, null, 2);
    if (adapterKey) {
        const adapterName = adapterKey.match(/localStorageAdapter\:adapters\:(.*)/)[1]
        readFromChromeLocalStorage([ADAPTERS_BASE_KEY])
        .then(results => {
            let adapters = results[ADAPTERS_BASE_KEY];
            if (adapters === undefined) {
                adapters = []
            }
            if (!adapters.includes(adapterName)) {
                adapters.push(adapterName);
                saveToChromeLocalStorage({
                    [ADAPTERS_BASE_KEY]: adapters,
                    [adapterKey]: _config
                }).then(() => {
                    if (callback) {
                        callback();
                    }
                })
            } else {
                saveToChromeLocalStorage({ [adapterKey]: _config })
                .then(() => {
                    if (callback) {
                        callback();
                    }
                });
            }
        });
    }
}

export function saveAdapter(adapterKey, config, callback?) {
    readFromChromeLocalStorage([adapterKey])
        .then((results) => {
            if (results[adapterKey]) {
                const currentConfig = JSON.parse(results[adapterKey]);
                if (!adaptersAreIdentical(currentConfig, config)) {
                    _saveAdapter(
                        adapterKey,
                        config,
                        callback
                    );
                } else if (callback) {
                    callback();
                }
            } else {
                _saveAdapter(
                    adapterKey,
                    config,
                    callback
                );
            }
        })
}

export function deleteAdapter(adapterKey, callback) {
    if (adapterKey) {
        const adapterName = adapterKey.split(':').pop();
        readFromChromeLocalStorage([ADAPTERS_BASE_KEY])
        .then(results => {
            const adapters = results[ADAPTERS_BASE_KEY] as Array<string>;
            if (Array.isArray(adapters)) {
                const adapterIndex = adapters.indexOf(adapterName);
                if (adapterIndex !== -1) {
                    adapters.splice(adapterIndex, 1);
                    saveToChromeLocalStorage({ [ADAPTERS_BASE_KEY]: adapters })
                    .then(() => {
                        userStore.clear();
                        callback();
                    });
                } else {
                    callback();
                }
            } else {
                callback();
            }  
        });
    } else  {
        callback();
    }
}

export function generateAdapter(columnSelectors, rowSelector, adapterKey) {
    const { attributes } = createAdapterData(rowSelector, columnSelectors);
    return {
        name: document.title,
        urls: [window.location.href],
        matches: [`${window.location.origin}${window.location.pathname}`],
        attributes,
        metadata: {
            id: adapterKey,
            columnSelectors,
            rowSelector
        },
        scrapePage: `() => {
            const rowElements = ${!!rowSelector} ? document.querySelectorAll("${rowSelector}") : [];
            return Array.from(rowElements).map((element, rowIndex) => {
                return {
                    id: String(rowIndex),
                    index: rowIndex,
                    dataValues: {},
                    rowElements: [element]
                }
            });
        }`
    };
}

export function createInitialAdapter() {
    const config = createInitialAdapterConfig();
    return createDomScrapingAdapter(config as any);
}

export function createInitialAdapterConfig() {
    const adapterKey = createAdapterKey();
    setAdapterKey(adapterKey);
    const config = generateAdapter([], '', adapterKey);
    compileAdapterJavascript(config);
    return config;
}

export function updateAdapter(adapterKey, columnSelectors, rowSelector) {
    const activeAdapter = getCachedActiveAdapter();
    if (activeAdapter) {
        const config = generateAdapter(columnSelectors, rowSelector, adapterKey);
        const configCopy = {...config};
        compileAdapterJavascript(configCopy);
        activeAdapter.updateConfig(configCopy);
    }   
}

function adaptersAreIdentical(adapter1, adapter2) {
    if (adapter1.attributes.length !== adapter2.attributes.length) {
        return false;
    }
    if (adapter1.scrapePage !== adapter2.scrapePage) {
        return false;
    }
    for (let i = 0; i < adapter1.attributes.length; i++) {
        const adapter1Attribute = adapter1.attributes[i];
        const adapter2Attribute = adapter2.attributes[i];
        if (adapter1Attribute.formula !== adapter2Attribute.formula) {
            return false;
        }
    } 
    return true;
}

function createAdapterData(rowSelector, columnSelectors) {    
    return {
        attributes: _createAttributes({ rowSelector, columnSelectors }),
        scrapePage: _createScrapPage({ rowSelector })
    }
}

function _createAttributes({ rowSelector, columnSelectors }) {
    const attributes = [];
    if (rowSelector && columnSelectors && columnSelectors.length) {
        // add row element attribute
        attributes.push({
            name: "rowElement",
            type: "element",
            formula: `=QuerySelector(null, "${rowSelector}")`,
            hidden: true
        });
        // add remaining attributes
        columnSelectors.forEach((columnSelectorList, index) => {
            const columnSelector = columnSelectorList[0];
            attributes.push({
                name: indexToAlpha(index),
                type: "element",
                formula: columnSelector ? `=QuerySelector(rowElement, "${columnSelector}")` : `=QuerySelector(rowElement)`
            });
        });
    }
    return attributes;
}

function _createScrapPage({ rowSelector }) {
    return `() => {
        const rowElements = ${!!rowSelector} ? document.querySelectorAll("${rowSelector}") : [];
        return Array.from(rowElements).map((element, rowIndex) => {
            return {
                id: String(rowIndex),
                index: rowIndex,
                dataValues: {},
                rowElements: [element]
            }
        });
    }`;
}

function _createAdapterId() {
    return document.title;
}