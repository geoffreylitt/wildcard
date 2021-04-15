import {
    copyMap,
    mapToArrayOfValues,
    randomRGB
} from './utils';

import {
    MIN_COLUMNS,
    ACTIVE_COLOR,
    INACTIVE_COLOR
} from './constants';

import {
    styleColumnElementsOnClick,
    styleRowElementsOnClick
} from './eventListeners';
import { updateAdapter } from './adapterHelpers';

const _eventMaps = {
    mouseMoveRowElement: new Map(),
    mouseMoveColumnElement: new Map(),
    mouseClickRowElement: new Map(),
    mouseClickColumnElement: new Map(),
    defaults: new Map()
};
let _tempColumnMap;
let _columnColorsList = [];
let _adapterKey;
let _rowElementSelector;
let _rowElement;
let _column = 0;
let _exploring = true;
let _currentColumnSelector;
let _multipleExamples = false;
let _columnMap = new Map<number, string[]>();
let _editing = false;
let _candidateRowElementSelectors = [];
let _candidateColumnElementSelectors = [];
let _activeAdapter;
let _rowElementSelectorCandidates;
let _columnElementSelectorCandidates = [];
let _creatingAdapter = false;
_columnMap.set(_column, []);

export function initState({ rowSelector, columnSelectors, id }) {
    _editing = true;
    _exploring = false;
    _rowElementSelector = rowSelector;
    _rowElement = document.querySelector(rowSelector);
    _adapterKey = id;
    columnSelectors.forEach((selectors, index) => {
        _columnMap.set(index, selectors);
    });
    _column = columnSelectors.length;
    _columnMap.set(_column, []);
    _tempColumnMap = copyMap(_columnMap);
    styleColumnElementsOnClick(rowSelector);
    styleRowElementsOnClick();
    updateAdapter(id, mapToArrayOfValues(_columnMap), rowSelector);
}

export function setStyleAndAddToMap({ map, node, styleProperty, styleValue }) {
    if (!_eventMaps.defaults.has(node)) {
        _eventMaps.defaults.set(node, node.style);
    }
    map.set(node, {
        property: styleProperty,
        value: node.style[styleProperty],
        set: styleValue
    });
    node.style[styleProperty] = styleValue;
}

export function clearElementMap(map, clear?) {
    map.forEach(({ property, value, set }, element) => {
        if (element.style) {
            if (clear) {
                if (_eventMaps.defaults.get(element)) {
                    element.style = _eventMaps.defaults.get(element);
                } else {
                    delete element.style;
                }
            } else if (element.style[property] === set) {
                element.style[property] = value;
            }
        }
    });
    map.clear();
}

export function clearElementMaps() {
    Object.keys(_eventMaps)
    .filter(mapKey => mapKey !== 'defaults')
    .forEach(mapKey => {
        clearElementMap(_eventMaps[mapKey], true);
    });
    _eventMaps.defaults.clear();
}

export function populateColumnColors() {
    for (let i = 0; i < MIN_COLUMNS; i++) {
        _columnColorsList.push(randomRGB());
    }
}

export function getAdapterKey() {
    return _adapterKey;
}

export function setAdapterKey(adapterKey) {
    _adapterKey = adapterKey;
}

export function getRowElementSelector() {
    return _rowElementSelector;
}

export function setRowElementSelector(rowElementSelector) {
    _rowElementSelector = rowElementSelector;
}

export function getRowElement() {
    return _rowElement;
}

export function setRowElement(rowElement) {
    _rowElement = rowElement;
}

export function getColumn() {
    return _column;
}

export function setColumn(column) {
    _column = column;
}

export function getColumnMap() {
    return _columnMap;
}

export function setColumnMap(map) {
    _columnMap = new Map([...map.entries()].sort());
}

export function setTempColumnMap(value) {
    _tempColumnMap = value;
}

export function getTempColumnMap() {
    return _tempColumnMap;
}

export function getColumnColor(i) {
    if (!_columnColorsList[i]) {
        _columnColorsList[i] = randomRGB();
    }
    return _columnColorsList[i];
    
}

export function getEventMaps() {
    return _eventMaps;
}

export function resetScraperState() {
    _editing = false;
    _adapterKey = null;
    _rowElement = null;
    _rowElementSelector = null;
    _column = 0;
    _columnMap.clear();
    _columnMap.set(_column, []);
    clearElementMaps();
    _columnColorsList = [];
    _exploring = true;
    _currentColumnSelector = null;
    _tempColumnMap = null;
    _multipleExamples = false;
    _candidateRowElementSelectors = [];
    _candidateColumnElementSelectors = [];
    _rowElementSelectorCandidates = [];
    _columnElementSelectorCandidates = [];
    _creatingAdapter = false;
}

export function getMouseClickRowStyleData() {
    return {
        styleProperty: 'border',
        styleValue: `2px solid ${ACTIVE_COLOR}`
    }
}

export function getMouseClickColumnStyleProperty() {
   return 'backgroundColor';
}

export function getMouseClickColumnStyleValue() {
    return INACTIVE_COLOR;
}

export function getMouseMoveRowStyleData() {
    return {
        styleProperty: 'border',
        styleValue: `2px solid ${ACTIVE_COLOR}`
    }
}

export function getMouseMoveColumnStyleData() {
    return {
        styleProperty: 'backgroundColor',
        styleValue: ACTIVE_COLOR
    }
}

export function getExploring() {
    return _exploring;
}

export function setExploring(exploring) {
    _exploring = exploring;
}

export function getCurrentColumnSelector() {
    return _currentColumnSelector;
}

export function setCurrentColumnSelector(value) {
    _currentColumnSelector = value;
}

export function getMultipleExamples() {
    return _multipleExamples;
}

export function setMultipleExamples(value) {
    _multipleExamples = value;
}

export function getEditing() {
    return _editing;
}

export function setEditing(value) {
    _editing = value;
}

export function getCandidateRowElementSelectors() {
    return _candidateRowElementSelectors;
}

export function setCandidateRowElementSelectors(value) {
    _candidateRowElementSelectors = value;
}

export function getCandidateColumnElementSelectors() {
    return _candidateColumnElementSelectors;
}

export function setCandidateColumnElementSelectors(value) {
    _candidateColumnElementSelectors = value;
}

export function getCachedActiveAdapter() {
    return _activeAdapter;
}

export function setCachedActiveAdapter(value) {
    _activeAdapter = value;
}

export function getRowElementSelectorCandidates() {
    return _rowElementSelectorCandidates;
}

export function setRowElementSelectorCandidates(value) {
    _rowElementSelectorCandidates = value;
}

export function getColumnElementSelectorCandidates() {
    return _columnElementSelectorCandidates;
}

export function setColumnElementSelectorCandidates(value) {
    _columnElementSelectorCandidates = value;
}

export function getCreatingAdapter() {
    return _creatingAdapter;
}

export function setCreatingAdapter(value) {
    _creatingAdapter = value;
}