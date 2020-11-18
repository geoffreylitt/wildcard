import {
    randomRGB
} from './utils';

import {
    MIN_COLUMNS,
    MOUSE_CLICK_ROW_COLOR,
    MOUSE_MOVE_COLOR
} from './constants';

const _eventMaps = {
    mouseMoveRowElement: new Map(),
    mouseMoveColumnElement: new Map(),
    mouseClickRowElement: new Map(),
    mouseClickColumnElement: new Map(),
    defaults: new Map()
};
const _columnMap = new Map<number, string[]>();
let _columnColorsList = [];
let _adapterKey;
let _rowElementSelector;
let _column = -1;

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

export function getColumn() {
    return _column;
}

export function setColumn(column) {
    _column = column;
}

export function getColumnMap() {
    return _columnMap;
}

export function getColumnColors() {
    return _columnColorsList;
}

export function getEventMaps() {
    return _eventMaps;
}

export function resetScraperState() {
    _adapterKey = null;
    _rowElementSelector = null;
    _column = -1;
    _columnMap.clear();
    clearElementMaps();
    _columnColorsList = [];
}

export function getMouseClickRowStyleData() {
    return {
        styleProperty: 'border',
        styleValue: `1px solid ${MOUSE_CLICK_ROW_COLOR}`
    }
}

export function getMouseClickColumnStyleProperty() {
   return 'backgroundColor';
}

export function getMouseClickColumnStyleValue(column) {
    const columnColors = getColumnColors();
    if (!columnColors[column]) {
        columnColors[column] = randomRGB();
    }
    return columnColors[column];
}

export function getMouseMoveRowStyleData() {
    return {
        styleProperty: 'border',
        styleValue: `1px solid ${MOUSE_MOVE_COLOR}`
    }
}

export function getMouseMoveColumnStyleData() {
    return {
        styleProperty: 'backgroundColor',
        styleValue: MOUSE_MOVE_COLOR
    }
}

