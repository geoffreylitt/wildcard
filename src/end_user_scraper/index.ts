import {
    run
} from '../wildcard';

import {
    addScrapingListeners,
    removeScrapingListeners
} from './eventListeners';

import {
    deleteAdapter
} from './adapterHelpers';

import {
    initTutorial,
    removeTutorial,
    resetTutorial
} from './tutorial';

import {
    getAdapterKey,
    resetScraperState
} from './state';

export function startScrapingListener() {
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
        })
    } else {
        resetScraperState();
        removeTutorial();
        run({ creatingAdapter: false });
    }
}

export function resetScrapingListener() {
    const adapterKey = getAdapterKey();
    deleteAdapter(adapterKey, () => {
        resetScraperState();
        resetTutorial();
        run({ creatingAdapter: true });
    });
}