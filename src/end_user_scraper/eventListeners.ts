import {
    getTutorialElement,
    renderColumnBoxes
} from './tutorial';

import {
    getElementsBySelector, inSelectorElements
} from './domHelpers';

import {
    clearElementMap,
    getEventMaps,
    getColumnMap,
    getColumn,
    setRowElementSelector,
    getRowElementSelector,
    setStyleAndAddToMap,
    getMouseClickRowStyleData,
    getMouseMoveRowStyleData,
    getMouseMoveColumnStyleData,
    getMouseClickColumnStyleValue,
    getMouseClickColumnStyleProperty,
    getAdapterKey,
    getExploring,
    getRowElement,
    setRowElement,
    setExploring,
    setTempColumnMap,
    getTempColumnMap,
    setColumn,
    getCurrentColumnSelector,
    setCurrentColumnSelector,
    getMultipleExamples,
    setColumnMap
} from './state';

import {
    generateColumnSelectors,
    findRowElement
} from './generalizer';

import {
    mapToArrayOfValues,
    copyMap,
    newSelector,
    getColumnForSelector,
    getSelectorFromQueryFormula,
    isFormula
} from './utils';

import {
    updateAdapter
} from './adapterHelpers';

export function updateFromSetFormula({ formula, column }) {
    const tempColumnMap = getTempColumnMap();
    const eventMaps = getEventMaps()
    const rowElementSelector = getRowElementSelector();
    const columnSelector = getSelectorFromQueryFormula({ formula });
    const columnSelectors = [formula.startsWith("=QuerySelector") ? columnSelector : formula];
    const adapterKey = getAdapterKey();
    tempColumnMap.set(column, columnSelectors);
    const nextColumn = column == tempColumnMap.size - 1 ? column + 1 : column;
    if (!tempColumnMap.has(nextColumn)) {
        tempColumnMap.set(nextColumn, []);
    }
    setColumnMap(tempColumnMap);
    setColumn(nextColumn);
    renderColumnBoxes(tempColumnMap);
    clearElementMap(eventMaps.mouseMoveRowElement);
    clearElementMap(eventMaps.mouseMoveColumnElement);
    clearElementMap(eventMaps.mouseClickColumnElement, true);
    styleColumnElementsOnClick(rowElementSelector);
    styleColumnElementsOnHover(rowElementSelector, columnSelectors);
    updateAdapter(adapterKey, mapToArrayOfValues(tempColumnMap), rowElementSelector);
}

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
    const exploring = getExploring();
    const rowElement = getRowElement();
    const rowElementSelector = getRowElementSelector();
    const currentColumnSelector = getCurrentColumnSelector();
    const tempColumnMap = getTempColumnMap();
    const columnMap = getColumnMap();
    const column = getColumn();
    const multipleExamples = getMultipleExamples();
    const eventMaps = getEventMaps();
    const adapterKey = getAdapterKey();
    if (
        multipleExamples &&
        newSelector(currentColumnSelector, columnMap) &&
        inSelectorElements({ selector: rowElementSelector, node: target }) &&
        !target.childElementCount &&
        target.textContent
    ) {
        setColumnMap(tempColumnMap);
    } else if (
        newSelector(currentColumnSelector, columnMap) &&
        !target.childElementCount &&
        target.textContent &&
        rowElement.contains(target)
    ) {
        const nextColumn = column + 1;
        tempColumnMap.set(nextColumn, []);
        setColumnMap(tempColumnMap);
        setColumn(nextColumn);
        renderColumnBoxes(tempColumnMap);
        exploring && setExploring(false);
        updateAdapter(adapterKey, mapToArrayOfValues(tempColumnMap), rowElementSelector);
    } else if (
        !newSelector(currentColumnSelector, columnMap) &&
        rowElement.contains(target)
    ) {
        const columnToRemove = getColumnForSelector(columnMap, currentColumnSelector);
        for (let i = columnToRemove + 1; i < tempColumnMap.size; i++) {
            columnMap.set(i-1, columnMap.get(i))
        } 
        const nextColumn = column - 1;
        columnMap.delete(columnMap.size - 1);
        setColumn(nextColumn);
        setColumnMap(columnMap);
        setCurrentColumnSelector(null);
        updateAdapter(adapterKey, mapToArrayOfValues(columnMap), rowElementSelector); 
        clearElementMap(eventMaps.mouseClickColumnElement, true);
        clearElementMap(eventMaps.mouseMoveColumnElement);
        styleColumnElementsOnClick(rowElementSelector);
        renderColumnBoxes(columnMap);
    } else if (
        multipleExamples &&
        !newSelector(currentColumnSelector, columnMap) &&
        inSelectorElements({ selector: rowElementSelector, node: target })
    ) {
        const columnToRemove = getColumnForSelector(columnMap, currentColumnSelector);
        const columnSelectors = columnMap.get(columnToRemove);
        const indexOfSelector = columnSelectors.indexOf(currentColumnSelector);
        columnSelectors.splice(indexOfSelector, 1);
        setColumnMap(columnMap);
        clearElementMap(eventMaps.mouseClickColumnElement, true);
        styleColumnElementsOnClick(rowElementSelector);
    }
}

function scraperMouseMoveListener(event) {
    if (ignoreEvent(event)) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const eventMaps = getEventMaps();
    const exploring = getExploring();
    let rowElementSelector = !exploring && getRowElementSelector();
    let rowElement = !exploring && getRowElement();
    const adapterKey = getAdapterKey();
    const tempColumnMap = getTempColumnMap();
    const columnMap = exploring && tempColumnMap  ? tempColumnMap : copyMap(getColumnMap());
    const column = getColumn();
    const multipleExamples = getMultipleExamples();
    if (exploring) {
        // console.time("FINDING ROW")
        const rowElementData = findRowElement([target], target);
        // console.timeEnd("FINDING ROW")
        if (rowElementData) {    
            rowElement = rowElementData.rowElement;
            rowElementSelector = rowElementData.rowElementSelector;
        }
        if (target.textContent && !target.childElementCount) {
            const columnSelector = generateColumnSelectors(rowElementSelector, [target]).shift();
            if (columnSelector) {
                if (!Array.isArray(columnMap.get(column))) {
                    columnMap.set(column, []);
                }
                const columnSelectors = columnMap.get(column);
                if (columnSelector !== getCurrentColumnSelector()) {     
                    columnSelectors[0] = columnSelector;
                    setCurrentColumnSelector(columnSelector);
                    setTempColumnMap(columnMap);
                    setRowElementSelector(rowElementSelector);
                    setRowElement(rowElement);
                    const allColumnSelectors = mapToArrayOfValues(columnMap);
                    updateAdapter(adapterKey, allColumnSelectors, rowElementSelector); 
                    clearElementMap(eventMaps.mouseMoveRowElement);
                    clearElementMap(eventMaps.mouseMoveColumnElement);
                    clearElementMap(eventMaps.mouseClickColumnElement, true);
                    styleColumnElementsOnClick(rowElementSelector);
                    styleColumnElementsOnHover(rowElementSelector, columnSelectors);
                    styleRowElementsOnHover();
                    renderColumnBoxes(columnMap);
                }
            }     
        } else {
            clearElementMap(eventMaps.mouseMoveRowElement);
            clearElementMap(eventMaps.mouseMoveColumnElement);
            clearElementMap(eventMaps.mouseClickColumnElement, true);
            renderColumnBoxes(columnMap)
            setCurrentColumnSelector(null);
            updateAdapter(adapterKey, [], '');
        }
    } else if (rowElement.contains(target) && target.textContent && !target.childElementCount) {
        const columnSelector = generateColumnSelectors(rowElementSelector, [target]).shift();
        if (columnSelector) {
            if (newSelector(columnSelector, columnMap)) {
                if (!Array.isArray(columnMap.get(column))) {
                    columnMap.set(column, []);
                }
                const columnSelectors = columnMap.get(column);
                if (columnSelector !== getCurrentColumnSelector()) {
                    columnSelectors.push(columnSelector);
                    setCurrentColumnSelector(columnSelector);
                    setTempColumnMap(columnMap);
                    const allColumnSelectors = mapToArrayOfValues(columnMap);
                    updateAdapter(adapterKey, allColumnSelectors, rowElementSelector);
                    clearElementMap(eventMaps.mouseMoveRowElement);
                    clearElementMap(eventMaps.mouseMoveColumnElement);
                    clearElementMap(eventMaps.mouseClickColumnElement, true);
                    styleColumnElementsOnClick(rowElementSelector);
                    styleColumnElementsOnHover(rowElementSelector, columnSelectors);
                    styleRowElementsOnHover();
                    renderColumnBoxes(columnMap);
                }  
            } else {
                const columnMap = getColumnMap();
                const column = getColumnForSelector(columnMap, columnSelector);
                const columnSelectors = columnMap.get(column);
                const allColumnSelectors = mapToArrayOfValues(getColumnMap());
                setCurrentColumnSelector(columnSelector);
                updateAdapter(adapterKey, allColumnSelectors, rowElementSelector);
                clearElementMap(eventMaps.mouseMoveColumnElement);
                styleColumnElementsOnClick(rowElementSelector);
                styleColumnElementsOnHover(rowElementSelector, columnSelectors);
                renderColumnBoxes(columnMap, column)
            }
        }
    } else if (
        multipleExamples &&
        inSelectorElements({ selector: rowElementSelector, node: target }) &&
        target.textContent &&
        !target.childElementCount
    ) {
        const columnSelector = generateColumnSelectors(rowElementSelector, [target]).shift();
        if (columnSelector) {
            if (newSelector(columnSelector, columnMap)) {
                if (!Array.isArray(columnMap.get(column))) {
                    columnMap.set(column, []);
                }
                const columnSelectors = columnMap.get(column);
                if (columnSelector !== getCurrentColumnSelector()) {
                    columnSelectors.push(columnSelector);
                    setCurrentColumnSelector(columnSelector);
                    setTempColumnMap(columnMap);
                    const allColumnSelectors = mapToArrayOfValues(columnMap);
                    updateAdapter(adapterKey, allColumnSelectors, rowElementSelector);
                    clearElementMap(eventMaps.mouseMoveRowElement);
                    clearElementMap(eventMaps.mouseMoveColumnElement);
                    clearElementMap(eventMaps.mouseClickColumnElement, true);
                    styleColumnElementsOnClick(rowElementSelector);
                    styleColumnElementsOnHover(rowElementSelector, columnSelectors);
                    styleRowElementsOnHover();
                    renderColumnBoxes(columnMap);
                }  
            } else {
                const columnMap = getColumnMap();
                const column = getColumn();
                const columnSelectors = columnMap.get(column);
                const allColumnSelectors = mapToArrayOfValues(getColumnMap());
                setCurrentColumnSelector(columnSelector);
                updateAdapter(adapterKey, allColumnSelectors, rowElementSelector);
                clearElementMap(eventMaps.mouseMoveColumnElement);
                styleColumnElementsOnClick(rowElementSelector);
                styleColumnElementsOnHover(rowElementSelector, columnSelectors);
                renderColumnBoxes(columnMap, getColumnForSelector(columnMap, columnSelector))
            }
        }
    } else {
        setCurrentColumnSelector(null);
        const allColumnSelectors = mapToArrayOfValues(getColumnMap());
        updateAdapter(adapterKey, allColumnSelectors, rowElementSelector);
        clearElementMap(eventMaps.mouseMoveColumnElement); 
        renderColumnBoxes(columnMap);
    }
}

function getRowElements() {
    const multipleExamples = getMultipleExamples();
    const rowElement = getRowElement();
    const rowElementSelector = getRowElementSelector();
    if (multipleExamples) {
        return getElementsBySelector(rowElementSelector);
    }
    return [rowElement];
}

export function styleRowElementsOnHover() {
    const rowElements = getRowElements();
    const eventMaps = getEventMaps();
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

export function styleRowElementsOnClick() {
    const rowElements = getRowElements();
    const eventMaps = getEventMaps();
    const { styleProperty, styleValue } = getMouseClickRowStyleData();
    Array.from(rowElements)
        .forEach((rowElement) => {
            setStyleAndAddToMap({
                map: eventMaps.mouseClickRowElement,
                node: rowElement,
                styleProperty,
                styleValue
            });
        });
}

function styleColumnElementsOnHover(rowElementSelector, columnSelectors) {
    const eventMaps = getEventMaps();
    const rowElements = getElementsBySelector(rowElementSelector);
    const { styleProperty, styleValue } = getMouseMoveColumnStyleData()
    Array.from(rowElements)
    .forEach((rowElement) => {
        columnSelectors
        .filter(value => !isFormula(value))
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

export function styleColumnElementsOnClick(rowElementSelector) {
    const columnMap = getColumnMap();
    const eventMaps = getEventMaps();
    const rows = getElementsBySelector(rowElementSelector);
    const columns = mapToArrayOfValues(columnMap);
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        for (let j = 0; j < columns.length; j++) {
            const selectors = columns[j];
            for (let k = 0; k < selectors.length; k++) {
                const selector = selectors[k];
                if (!isFormula(selector)) {
                    const element = row.querySelector(selector) as HTMLElement;
                    if (element) {
                        setStyleAndAddToMap({
                            map: eventMaps.mouseClickColumnElement,
                            node: element,
                            styleProperty: getMouseClickColumnStyleProperty(),
                            styleValue: getMouseClickColumnStyleValue()
                        });
                    }
                }     
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