import {
    run
} from '../wildcard';

import {
    addScrapingListeners,
    removeScrapingListeners
} from './eventListeners';

import {
    createAdapterAndSave,
    createInitialAdapter,
    deleteAdapter
} from './adapterHelpers';

import {
    initTutorial,
    removeTutorial,
    resetTutorial
} from './tutorial';

import {
    getAdapterKey,
    getColumn,
    getColumnMap,
    getRowElementSelector,
    resetScraperState
} from './state';
import { mapToArrayOfValues } from './utils';

import {
    MIN_COLUMNS
} from './constants';

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
        })
    } else {
        const columnMap = getColumnMap();
        if (columnMap.size > MIN_COLUMNS) {
            // delete placeholder column
            const lastColumn = columnMap.size - 1;
            columnMap.delete(lastColumn);
        } 
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
    const adapterKey = getAdapterKey();
    deleteAdapter(adapterKey, () => {
        resetScraperState();
        resetTutorial();
        createInitialAdapter();
    });
}