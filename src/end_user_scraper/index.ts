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
    initState,
    resetScraperState
} from './state';

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
        const adapterConfig = getAdapterConfig();
        adapterConfig.attributes.pop();
        saveAdapter(adapterKey, adapterConfig, () => {
            resetScraperState();
            removeTutorial();
            run({ creatingAdapter: false });
        });
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