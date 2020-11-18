import {
    readFromChromeLocalStorage,
    saveToChromeLocalStorage,
    removeFromChromeLocalStorage
} from '../utils';

import {
    MIN_COLUMNS,
    ADAPTERS_BASE_KEY
} from './constants';

function createTableColumns(n) {
    const columns = [];
    for (let i = 0; i < n; i++) {
        columns.push({
            name: String.fromCharCode(97 + i).toUpperCase(),
            type: "text"
        })
    }
    return columns;
}

export function saveAdapter(adapterKey, config, callback) {
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
                        callback();
                    });
                });
            }
        });
    }
}

export function generateAdapter(columnSelectors, rowElementSelector) {
    return {
        name: document.title,
        urls: [window.location.href],
        matches: [window.location.href],
        attributes: createTableColumns(Math.max(columnSelectors.length, MIN_COLUMNS)),
        scrapePage: `() => {
            const rowElements = document.querySelectorAll("${rowElementSelector}");
            return Array.from(rowElements).map((element, rowIndex) => {
                const dataValues = {};
                const columnSelectors = ${JSON.stringify(columnSelectors)};
                for (let columnIndex = 0; columnIndex < columnSelectors.length; columnIndex++) {
                    const selectors = columnSelectors[columnIndex];
                    for (let selectorIndex = 0; selectorIndex < selectors.length; selectorIndex++) {
                        const selector = selectors[selectorIndex];
                        const selected = element.querySelector(selector);
                        if (selected && selected.textContent) {
                            dataValues[String.fromCharCode(97 + columnIndex).toUpperCase()] = selected.textContent.trim();
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