import {
    run
} from '../wildcard';

import {
    addScrapingListeners,
    removeScrapingListeners
} from './eventListeners';

import {
    deleteAdapter,
    createAdapterKey,
    saveAdapter,
    createInitialAdapterConfig
} from './adapterHelpers';

import {
    initTutorial,
    removeTutorial,
    resetTutorial
} from './tutorial';

import {
    getAdapterKey,
    getCachedActiveAdapter,
    initState,
    resetScraperState
} from './state';

import { readFromChromeLocalStorage } from '../utils';

export function startScrapingListener() {
    addScrapingListeners();
    initTutorial();
    run({ creatingAdapter: true });
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
        const activeAdapter = getCachedActiveAdapter();
        const adapterConfig = activeAdapter.getConfig();
        adapterConfig.attributes.pop();
        adapterConfig.metadata.columnSelectors.pop();
        adapterConfig.scrapePage = adapterConfig.scrapePage.toString();
        saveAdapter(adapterKey, adapterConfig, () => {
            resetScraperState();
            removeTutorial();
            run({ creatingAdapter: false });
        });
    }
}

export function resetScrapingListener() {
    resetScraperState();
    resetTutorial();
    const activeAdapter = getCachedActiveAdapter();
    if (activeAdapter) {
        const config = createInitialAdapterConfig()
        activeAdapter.updateConfig(config);
    }
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
                run({ creatingAdapter: true });
            }
        });
}