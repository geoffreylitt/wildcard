import {
    run
} from '../wildcard';

import {
    addScrapingListeners,
    removeScrapingListeners
} from './eventListeners';

import {
    createInitialAdapter,
    deleteAdapter,
    createAdapterKey,
    deleteAdapterInMemory,
    saveAdapter
} from './adapterHelpers';

import {
    initTutorial,
    removeTutorial,
    resetTutorial
} from './tutorial';

import {
    getAdapterConfig,
    getAdapterKey,
    getCandidateRowElementSelectors,
    getColumnMap,
    getRowElementSelector,
    initState,
    resetScraperState
} from './state';

import {
    mapToArrayOfValues
} from './utils';

import { readFromChromeLocalStorage } from '../utils';

export function startScrapingListener() {
    createInitialAdapter();
    addScrapingListeners();
    initTutorial();
}

export function stopScrapingListener({ save }) {
    const adapterKey = getAdapterKey();
    removeScrapingListeners();
    if (!save) {
        deleteAdapter(adapterKey, () => {
            resetScraperState();
            removeTutorial();
            run({ creatingAdapter: false });
        });
    } else {
        const columnMap = getColumnMap();
        const lastColumn = columnMap.size - 1;
        columnMap.delete(lastColumn);
        createAdapterAndSave(
            adapterKey,
            mapToArrayOfValues(columnMap),
            getRowElementSelector(),
            getCandidateRowElementSelectors(),
            () => {
                resetScraperState();
                removeTutorial();
                run({ creatingAdapter: false });
            }
        );
    }
}

export function resetScrapingListener() {
    deleteAdapterInMemory(() => {
        resetScraperState();
        resetTutorial();
        createInitialAdapter();
    });
}

export function editScraper() {
    const adapterKey = createAdapterKey();
    readFromChromeLocalStorage([adapterKey])
        .then((results) => {
            const adapterConfigString = results[adapterKey];
            if (adapterConfigString) {
                const adapterConfig = JSON.parse(adapterConfigString);
                const adapterMetadata = adapterConfig.metadata;
                initState(adapterMetadata);
                addScrapingListeners();
                initTutorial();
            }
        })
}