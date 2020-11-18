import {
    run
} from '../wildcard';

import {
    getTutorialElement,
    initScraperControls
} from './tutorial';

import {
    inSelectorElements,
    getElementsBySelector
} from './domHelpers';

import {
    clearElementMap,
    getEventMaps,
    getColumnMap,
    getColumn,
    setAdapterKey,
    setRowElementSelector,
    getRowElementSelector,
    setStyleAndAddToMap,
    populateColumnColors,
    getMouseClickRowStyleData,
    getMouseMoveRowStyleData,
    getMouseMoveColumnStyleData,
    getMouseClickColumnStyleValue,
    getMouseClickColumnStyleProperty
} from './state';

import {
    generateColumnSelectors,
    findRowElement
} from './generalizer';

import {
    mapToArrayOfValues,
    generateAdapterKey
} from './utils';

import {
    generateAdapter,
    saveAdapter
} from './adapterHelpers';

import {
    ADAPTERS_BASE_KEY
} from './constants';

function ignoreEvent(event) {
    const target = event.target;
    const wcRoot = document.getElementById('wc--root');
    const tutorialElement = getTutorialElement();
    return (wcRoot && wcRoot.contains(target)) || (tutorialElement && tutorialElement.contains(target));
}

function scraperClickListener(event) {
    if (ignoreEvent(event)) {
        return;
    } else if (!event.altKey) {
        event.preventDefault();
        event.stopPropagation();
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const rowElementSelector = getRowElementSelector();
    const eventMaps = getEventMaps();
    const columnMap = getColumnMap();
    const column = getColumn();
    if (rowElementSelector) {
        if (!target.childElementCount && 
            target.textContent &&
            inSelectorElements({ selector: rowElementSelector, node: target })
        ){
            
            clearElementMap(eventMaps.mouseClickColumnElement, true);
            const columnElementSelector = generateColumnSelectors(rowElementSelector, [target]).shift();
            if (!columnMap.get(column)) {
                columnMap.set(column, []); 
            }
            const columnSelectors = columnMap.get(column);
            const columnElementSelectorIndex = columnSelectors.indexOf(columnElementSelector);
            if (columnElementSelectorIndex === -1) {
                columnSelectors.push(columnElementSelector);
            } else {
                columnSelectors.splice(columnElementSelectorIndex, 1);
                if (columnSelectors.length === 0) {
                    columnMap.delete(column);
                }
            }
            const rows = getElementsBySelector(rowElementSelector);
            const columns = mapToArrayOfValues(columnMap);
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                for (let j = 0; j < columns.length; j++) {
                    const selectors = columns[j];
                    for (let k = 0; k < selectors.length; k++) {
                        const selector = selectors[k]
                        const element = row.querySelector(selector) as HTMLElement;
                        if (element) {
                            setStyleAndAddToMap({
                                map: eventMaps.mouseClickColumnElement,
                                node: element,
                                styleProperty: getMouseClickColumnStyleProperty(),
                                styleValue: getMouseClickColumnStyleValue(j)
                            });
                        }
                    }
                }
            }
            const config = generateAdapter(columns, rowElementSelector);
            const adapterKey = generateAdapterKey(config.name);
            setAdapterKey(adapterKey);
            populateColumnColors();
            saveAdapter( 
                adapterKey,
                config, 
                () => {
                    run({ creatingAdapter: true })
                }
            );   
        }
    } else {
        clearElementMap(eventMaps.mouseClickRowElement);
        const rowElementData = findRowElement([target], target);
        if (rowElementData) {
            const { rowElementSelector } = rowElementData;
            const { styleProperty, styleValue } = getMouseClickRowStyleData();
            const rowElements = getElementsBySelector(rowElementSelector);
            Array.from(rowElements)
            .forEach((rowElement) => {
                setStyleAndAddToMap({
                    map: eventMaps.mouseClickRowElement,
                    node: rowElement,
                    styleProperty,
                    styleValue
                });
            });
            const config = generateAdapter([], rowElementSelector);
            const adapterKey = `${ADAPTERS_BASE_KEY}:${config.name}`;
            setAdapterKey(adapterKey);
            setRowElementSelector(rowElementSelector);
            saveAdapter(
                adapterKey,
                config, 
                () => {
                    initScraperControls();
                    run({ creatingAdapter: true });
                }
            );
        }
    }
}

function scraperMouseMoveListener(event) {
    if (ignoreEvent(event)) {
        return;
    }
    const target = event.target as HTMLElement;
    const rowElementSelector = getRowElementSelector();
    const eventMaps = getEventMaps();
    if (!rowElementSelector) {
        clearElementMap(eventMaps.mouseMoveRowElement);
        const rowElementData = findRowElement([target], target);
        if (rowElementData) {    
            const { rowElementSelector } = rowElementData;
            const rowElements = getElementsBySelector(rowElementSelector);
            const { styleProperty, styleValue } = getMouseMoveRowStyleData();
            Array.from(rowElements)
            .forEach((rowElement) => {
                setStyleAndAddToMap({
                    map: eventMaps.mouseMoveRowElement,
                    node: rowElement,
                    styleProperty,
                    styleValue
                });
            });
        }
    } else if (inSelectorElements({ selector: rowElementSelector, node: target }) && target.textContent) {
        clearElementMap(eventMaps.mouseMoveColumnElement);
        if (!target.childElementCount && target.textContent) {
            const columnSelectors = generateColumnSelectors(rowElementSelector, [target]);
            if (columnSelectors.length) {
                const rowElements = getElementsBySelector(rowElementSelector);
                const { styleProperty, styleValue } = getMouseMoveColumnStyleData()
                Array.from(rowElements)
                .forEach((rowElement) => {
                    columnSelectors
                    .map(selector => rowElement.querySelector(selector) as HTMLElement)
                    .filter(targetNode => targetNode)
                    .forEach(targetNode => {
                        setStyleAndAddToMap({
                            map: eventMaps.mouseMoveColumnElement,
                            node: targetNode,
                            styleProperty,
                            styleValue
                        });
                    });
                });
            } 
        }
    }
}

export function addScrapingListeners() {
    document.body.addEventListener('click', scraperClickListener, true);
    document.body.addEventListener('mousemove', scraperMouseMoveListener, true);
}

export function removeScrapingListeners() {
    document.body.removeEventListener('click', scraperClickListener, true);
    document.body.removeEventListener('mousemove', scraperMouseMoveListener, true);
}