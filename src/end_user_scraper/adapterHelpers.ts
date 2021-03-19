import {
    readFromChromeLocalStorage,
    saveToChromeLocalStorage,
    removeFromChromeLocalStorage
} from '../utils';

import {
    MIN_COLUMNS,
    ADAPTERS_BASE_KEY
} from './constants';
import {
    indexToAlpha
} from './utils';

import {
    run
} from '../wildcard';

import {
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

function _createAdapterId() {
    return document.title;
}

export function createAdapterKey() {
    return `${ADAPTERS_BASE_KEY}:${_createAdapterId()}`
}

function _saveAdapter(adapterKey, config, callback?) {
    const _config = JSON.stringify(config, null, 2);
    if (adapterKey) {
        const adapterName = adapterKey.split(':').pop();
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
                    callback();
                })
            } else {
                saveToChromeLocalStorage({ [adapterKey]: _config })
                .then(() => {
                    callback();
                });
            }
        });
    }
}

export function saveAdapter(adapterKey, config, callback?) {
    readFromChromeLocalStorage([adapterKey])
        .then((results) => {
            const _callback = () => {
                run({ creatingAdapter: true });
            };
            if (results[adapterKey]) {
                const currentConfig = JSON.parse(results[adapterKey]);
                if (currentConfig.scrapePage !== config.scrapePage) {
                    _saveAdapter(
                        adapterKey,
                        config,
                        callback || _callback
                    );
                } else if (callback) {
                    callback();
                }
            } else {
                _saveAdapter(
                    adapterKey,
                    config,
                    callback || _callback
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
            const adapterIndex = adapters.indexOf(adapterName);
            if (adapterIndex !== -1) {
                adapters.splice(adapterIndex, 1);
                saveToChromeLocalStorage({ [ADAPTERS_BASE_KEY]: adapters })
                .then(() => {
                    removeFromChromeLocalStorage([adapterKey, `query:${adapterName}`])
                    .then(() => {
                        userStore.clear();
                        callback();
                    });
                });
            }
        });
    } {
        callback();
    }
}

export function generateAdapter(columnSelectors, rowSelector, adapterKey) {
    return {
        name: document.title,
        urls: [window.location.href],
        matches: [`${window.location.origin}${window.location.pathname}`],
        attributes: createTableColumns(columnSelectors.length),
        metadata: {
            id: adapterKey,
            columnSelectors,
            rowSelector
        },
        scrapePage: `() => {
            const rowElements = ${!!rowSelector} ? document.querySelectorAll("${rowSelector}") : [];
            return Array.from(rowElements).map((element, rowIndex) => {
                const dataValues = {};
                const columnSelectors = ${JSON.stringify(columnSelectors)};
                for (let columnIndex = 0; columnIndex < columnSelectors.length; columnIndex++) {
                    const selectors = columnSelectors[columnIndex];
                    for (let selectorIndex = 0; selectorIndex < selectors.length; selectorIndex++) {
                        const selector = selectors[selectorIndex];
                        const selected = element.querySelector(selector);
                        if (selected && selected.textContent) {
                            dataValues[String.fromCharCode(97 + columnIndex).toUpperCase()] = selected;
                            break;
                        }
                    }
                }
                return {
                    id: String(rowIndex),
                    dataValues,
                    rowElements: [element]
                }
            });
        }`
    };
}

export function createAdapterAndSave(adapterKey, columnSelectors, rowSelector, callback?) {
    const config = generateAdapter(columnSelectors, rowSelector, adapterKey);
    saveAdapter(adapterKey, config, callback);
}

export function createInitialAdapter() {
    const adapterKey = createAdapterKey();
    setAdapterKey(adapterKey);
    createAdapterAndSave(adapterKey, [], '');
}