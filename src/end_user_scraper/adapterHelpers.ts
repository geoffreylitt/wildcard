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
    run
} from '../wildcard';

import {
    getAdapterConfig,
    setAdapterConfig,
    setAdapterKey
} from './state';

import { userStore } from '../localStorageAdapter';

function createAdapterData(rowSelector, columnSelectors) {
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
                }
            } else {
                callback();
            }  
        });
    } else  {
        callback();
    }
}

export function generateAdapter(columnSelectors, rowSelector, adapterKey, candidateRowElementSelectors) {
    const { attributes } = createAdapterData(rowSelector, columnSelectors);
    return {
        name: document.title,
        urls: [window.location.href],
        matches: [`${window.location.origin}${window.location.pathname}`],
        attributes,
        metadata: {
            id: adapterKey,
            columnSelectors,
            rowSelector,
            candidateRowElementSelectors
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

export function createAdapterAndSave(adapterKey, columnSelectors, rowSelector, candidateRowElementSelectors, callback?) {
    const config = generateAdapter(columnSelectors, rowSelector, adapterKey, candidateRowElementSelectors);
    saveAdapter(adapterKey, config, callback);
}

export function createInitialAdapterConfig() {
    const adapterKey = createAdapterKey();
    setAdapterKey(adapterKey);
    createAdapterAndSave(adapterKey, [], '', []);
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