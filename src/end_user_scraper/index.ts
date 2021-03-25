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

import {
    mapToArrayOfValues
} from './utils';

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
        const columnMap = getColumnMap();
        const lastColumn = columnMap.size - 1;
        columnMap.delete(lastColumn);
        createAdapterAndSave(
            adapterKey,
            mapToArrayOfValues(columnMap),
            getRowElementSelector(),
            () => {
                resetScraperState();
                removeTutorial();
                run({ creatingAdapter: false });
            }
        );
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