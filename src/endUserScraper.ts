import { 
    readFromChromeLocalStorage, 
    saveToChromeLocalStorage,
    removeFromChromeLocalStorage,
    htmlToElement
} from './utils';

import {
    run
} from './wildcard';

const _eventMaps = {
    _mouseMoveRowElement: new Map(),
    _mouseMoveTargetNode: new Map(),
    _mouseClickRowElement: new Map(),
    _mouseClickTargetNode: new Map(),
    _defaults: new Map()
}
const _minColumns = 4;
const _mouseMoveColor = 'rgb(127, 140, 141)';
const _mouseClickRowColor = _mouseMoveColor;
let _mouseClickColumColors = [];
const _adaptersBaseKey = 'localStorageAdapter:adapters';
let _adapterKey;
let _rowElementSelector;
const _defaultTutorialMessage = '1. Hover over a row of the dataset until all the relevant rows have a border and then alt + click any them to proceed to step 2';
const _tutorialHTML = `
    <div id='wc-scraper-tutorial' style='display: flex; flex-direction: column; justify-content: center; z-index: 1000; width: 100vw; background-color: ${_mouseMoveColor}; color: white; position: fixed; top: 0; left: 0; opacity: 0.9; font-size: 0.9em;'>
        <div class='instructions' style='margin: 1px; text-align: center;'>
            <span id='message' style='padding: 2.5px; margin: 2.5px;'>
            ${_defaultTutorialMessage}
            </span>
        </div>
    </div>
`;
const _scraperControlsHTML = `
    <div id='wc-scraper-tutorial-column-controls' style='margin: 1px; display: flex; justify-content: center;'>
        <div style='padding: 1px; margin: 1px; border: 1px solid white; margin-right: 10px;'>
            <button id='prevButton' style='margin: 1px;'> Prev Column</button>
            <span id='columnNumber' style='margin: 1px;'>A</span>
            <button id='nextButton' style='margin: 1px;'>Next Column</button>
        </div>
        <div style='padding: 1px; margin: 1px; border:1px solid white; margin-left: 10px;'>
            <button id='startOverButton' style='margin: 1px;'> Start Over</button>
            <button id='cancelButton' style='margin: 1px;'> Cancel</button>
            <button id='saveButton' style='margin: 1px;'> Save</button>
        </div>
    </div>
`;

let _tutorialElement;
let _scraperControlsElement
let _column = -1;
const _columnMap = new Map<number, string[]>();

function generateNodeSelector(node) {
    let selector = node.tagName.toLowerCase();
    if (node.classList && node.classList.length) {
        let selectors = [];
        const siblings = Array.from(node.parentNode.children)
            .filter((element: HTMLElement) => !element.isSameNode(node));
        getAllCombinations(Array.from(node.classList))
            .forEach((selector, i) => {
                selectors[i] = {
                    selector,
                    score: 0
                }
                const selectorClassNames= selector.substring(1).split('.');
                siblings
                    .filter((sibling: HTMLElement) => sibling.classList && sibling.classList.length)
                    .map((sibling: HTMLElement) => Array.from(sibling.classList))
                    .forEach(classList => {
                        const allInClasslist = selectorClassNames.every(className => classList.includes(className));
                        if (allInClasslist) {
                            selectors[i].score += 1;
                        }
                    });
            });
        if (selectors.length) {
            selectors.sort((a, b) => b.score - a.score);
            const highestScore = selectors[0].score;
            selectors = selectors.filter(({ score }) => score === highestScore);
            selectors.sort((a, b) => b.selector.split('.').length - a.selector.split('.').length);
            selector = selectors.shift().selector;
        }
    }
    return selector;
}

function getAllCombinations(chars) {
    const result = [];
    const f = (prefix, chars) => {
        for (let i = 0; i < chars.length; i++) {
            result.push(`${prefix}.${chars[i]}`);
            f(`${prefix}.${chars[i]}`, chars.slice(i + 1));
        }
    };
    f('', chars);
    return result;
}

function generateSelectorFrom(node, from) {
    if (node.isSameNode(from)) {
        return null;
    }
    const selectors = [];
    let _node = node;
    while (!_node.isSameNode(from)) {
        selectors.unshift(generateNodeSelector(_node));
        if (areAllSiblings(_node,  selectors.join('>'))) {
            return selectors.join('>')
        }
        _node = _node.parentNode;
    }
    return selectors.join(">");
}

function generateIndexedNodeSelector(node) {
    const tag = node.tagName.toLowerCase();
    const index = Array.prototype.indexOf.call(node.parentNode.children, node) + 1;
    return `${tag}:nth-child(${index})`;
}

function generateIndexedSelectorFrom(node, from) {
    if (node.isSameNode(from)) {
        return null;
    }
    const selectors = [];
    let _node = node;
    while (!_node.isSameNode(from)) {
        selectors.unshift(generateIndexedNodeSelector(_node));
        _node = _node.parentNode;
    }
    return selectors.join('>');
}

function areAllSiblings(node, selector) {
    return Array
        .from(document.querySelectorAll(selector))
        .every(element => element.parentNode.isSameNode(node.parentNode));
}

function findRowElement(nodes, lca) {
    const candidates = [];
    let selectors = nodes.map(node => generateIndexedSelectorFrom(node, lca)).filter(selector => selector);
    let candidate = lca;
    while (candidate && candidate.tagName !== 'BODY') {
        const candidateEntry = {
            candidate: candidate,
            score: 0
        };
        let nextSibling = candidate.nextElementSibling;
        let previousSibling = candidate.previousElementSibling;
        while (nextSibling) {
            selectors.forEach(selector => {
                if (nextSibling.querySelector(selector)) {
                    candidateEntry.score += 1;
                }
            });
            nextSibling = nextSibling.nextElementSibling;
        }
        while (previousSibling) {
            selectors.forEach(selector => {
                if (previousSibling.querySelector(selector)) {
                    candidateEntry.score += 1;
                }
            });
            previousSibling = previousSibling.previousElementSibling;
        }
        candidates.push(candidateEntry);
        if (selectors.length) {
            selectors = selectors.map(selector => `${generateIndexedNodeSelector(candidate)}>${selector}`);
        } else {
            selectors = [generateIndexedNodeSelector(candidate)];
        }
        candidate = candidate.parentNode;
    }
    if (candidates.length) {
      candidates.sort((a, b) => b.score - a.score);
      return {
          rowElement: candidates[0].candidate,
          rowElementSelector: generateSelectorFrom(candidates[0].candidate, document.body),
      };
    }
    return null
}

function getRowElements(selector) {
    return document.querySelectorAll<HTMLElement>(selector);
}

function generateTargetNodeSelectors(rowElementSelector, nodes) {
    const selectors = [];
    const rowElements = getRowElements(rowElementSelector);
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < rowElements.length; j++) {
            if (rowElements[j].contains(nodes[i])) {
                selectors.push(generateIndexedSelectorFrom(nodes[i], rowElements[j]));
                break;
            }
        }
    }
    return selectors;
}


function generateScraper(columnSelectors, rowElementSelector) {
    return {
        name: document.title,
        urls: [window.location.href],
        matches: [window.location.href],
        attributes: createTableColumns(Math.max(columnSelectors.length, _minColumns)),
        scrapePage: `() => {
            const rowElements = document.querySelectorAll("${rowElementSelector}");
            return Array.from(rowElements).map((element, rowIndex) => {
                const dataValues = {};
                const columnSelectors = ${JSON.stringify(columnSelectors)};
                for (let columnIndex = 0; columnIndex < columnSelectors.length; columnIndex++) {
                    const selectors = columnSelectors[columnIndex];
                    for (let selectorIndex = 0; selectorIndex < selectors.length; selectorIndex++) {
                        const selector = selectors[selectorIndex];
                        const selected = element.querySelector(selector);
                        if (selected && selected.textContent) {
                            dataValues[String.fromCharCode(97 + columnIndex).toUpperCase()] = selected.textContent.trim();
                            break;
                        }
                    }
                }
                return {
                    id: String(rowIndex),
                    dataValues,
                    rowElements: [element]
                }
            });
        }`
    };
}

function populateColumnColors() {
    for (let i = 0; i < _minColumns; i++) {
        _mouseClickColumColors.push(randomRGB());
    }
}

function createTableColumns(n) {
    const columns = [];
    for (let i = 0; i < n; i++) {
        columns.push({
            name: String.fromCharCode(97 + i).toUpperCase(),
            type: "text"
        })
    }
    return columns;
}

function createArrayVersionOfColumnMap() {
    const result: Array<Array<string>> = [];
    _columnMap.forEach((value) => {
        result.push(value);
    })
    return result;
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
    if (_rowElementSelector) {
        if (!target.childElementCount && 
            target.textContent &&
            inSelectorElements({ selector: _rowElementSelector, node: target })
        ){
            clearElementMap(_eventMaps._mouseClickTargetNode, true);
            const targetNodeSelector = generateTargetNodeSelectors(_rowElementSelector, [target]).shift();
            if (!_columnMap.get(_column)) {
                _columnMap.set(_column, []); 
            }
            const columnList = _columnMap.get(_column);
            const targetNodeSelectorIndex = columnList.indexOf(targetNodeSelector);
            if (targetNodeSelectorIndex === -1) {
                columnList.push(targetNodeSelector);
            } else {
                columnList.splice(targetNodeSelectorIndex, 1);
                if (columnList.length === 0) {
                    _columnMap.delete(_column);
                }
            }
            const styleProperty = 'backgroundColor';
            if (!_mouseClickColumColors[_column]) {
                _mouseClickColumColors.push(randomRGB())
            }
            const rows = getRowElements(_rowElementSelector);
            const columns = createArrayVersionOfColumnMap();
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                for (let j = 0; j < columns.length; j++) {
                    const selectors = columns[j];
                    for (let k = 0; k < selectors.length; k++) {
                        const selector = selectors[k]
                        const element = row.querySelector(selector) as HTMLElement;
                        if (element) {
                            setStyleAndAddToMap({
                                map: _eventMaps._mouseClickTargetNode,
                                node: element,
                                styleProperty,
                                styleValue: _mouseClickColumColors[j]
                            });
                        }
                    }
                }
            }
            const config = generateScraper(columns, _rowElementSelector);
            _adapterKey = `${_adaptersBaseKey}:${config.name}`;
            populateColumnColors();
            saveAdapter( 
                config, 
                () => {
                    run({ creatingAdapter: true })
                }
            );   
        }
    } else {
        clearElementMap(_eventMaps._mouseClickRowElement);
        const rowElementData = findRowElement([target], target);
        if (rowElementData) {
            const { rowElementSelector } = rowElementData;
            const styleProperty = 'border';
            const styleValue = `1px solid ${_mouseClickRowColor}`;
            const rowElements = getRowElements(rowElementSelector);
            Array.from(rowElements)
            .forEach((rowElement) => {
                setStyleAndAddToMap({
                    map: _eventMaps._mouseClickRowElement,
                    node: rowElement,
                    styleProperty,
                    styleValue
                });
            });
            const config = generateScraper([], rowElementSelector);
            _adapterKey = `${_adaptersBaseKey}:${config.name}`;
            _rowElementSelector = rowElementSelector;
            saveAdapter(
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
    if (!_rowElementSelector) {
        clearElementMap(_eventMaps._mouseMoveRowElement);
        const rowElementData = findRowElement([target], target);
        if (rowElementData) {    
            const { rowElementSelector } = rowElementData;
            const styleProperty = 'border';
            const styleValue = `1px solid ${_mouseMoveColor}`;
            const rowElements = getRowElements(rowElementSelector);
            Array.from(rowElements)
            .forEach((rowElement) => {
                setStyleAndAddToMap({
                    map: _eventMaps._mouseMoveRowElement,
                    node: rowElement,
                    styleProperty,
                    styleValue
                });
            });
        }
    } else if (inSelectorElements({ selector: _rowElementSelector, node: target }) && target.textContent) {
        clearElementMap(_eventMaps._mouseMoveTargetNode);
        if (!target.childElementCount && target.textContent) {
            const targetNodeSelectors = generateTargetNodeSelectors(_rowElementSelector, [target]);
            if (targetNodeSelectors.length) {
                const styleProperty = 'backgroundColor';
                const styleValue = _mouseMoveColor;
                const rowElements = getRowElements(_rowElementSelector);
                Array.from(rowElements)
                .forEach((rowElement) => {
                    targetNodeSelectors
                    .map(selector => rowElement.querySelector(selector) as HTMLElement)
                    .filter(targetNode => targetNode)
                    .forEach(targetNode => {
                        setStyleAndAddToMap({
                            map: _eventMaps._mouseMoveTargetNode,
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

function ignoreEvent(event) {
    const target = event.target;
    const wcRoot = document.getElementById('wc--root');
    return (wcRoot && wcRoot.contains(target)) || (_tutorialElement && _tutorialElement.contains(target));
}

function inSelectorElements({ selector, node }) {
    const result = Array
    .from(document.querySelectorAll(selector))
    .filter(element => element.contains(node));
    return result.length === 1;
}

function setStyleAndAddToMap({ map, node, styleProperty, styleValue }) {
    if (!_eventMaps._defaults.has(node)) {
        _eventMaps._defaults.set(node, node.style);
    }
    map.set(node, {
        property: styleProperty,
        value: node.style[styleProperty],
        set: styleValue
    });
    node.style[styleProperty] = styleValue;
}

function clearElementMap(map, clear?) {
    map.forEach(({ property, value, set }, element) => {
        if (element.style) {
            if (clear) {
                if (_eventMaps._defaults.get(element)) {
                    element.style = _eventMaps._defaults.get(element);
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

function clearElementMaps() {
    Object.keys(_eventMaps)
    .filter(mapKey => mapKey !== '_defaults')
    .forEach(mapKey => {
        clearElementMap(_eventMaps[mapKey], true);
    });
    _eventMaps._defaults.clear();
}

function randomRGB() {
    const o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
}

function saveAdapter(config, callback) {
    const _config = JSON.stringify(config, null, 2);
    if (_adapterKey) {
        const adapterName = _adapterKey.split(':').pop();
        readFromChromeLocalStorage([_adaptersBaseKey])
        .then(results => {
            let adapters = results[_adaptersBaseKey];
            if (adapters === undefined) {
                adapters = []
            }
            if (!adapters.includes(adapterName)) {
                adapters.push(adapterName);
                saveToChromeLocalStorage({ 
                    [_adaptersBaseKey]: adapters,
                    [_adapterKey]: _config
                }).then(() => {
                    callback();
                })
            } else {
                saveToChromeLocalStorage({ [_adapterKey]: _config })
                .then(() => {
                    callback();
                });
            }
        });
    }
}

function deleteAdapter(callback) {
    if (_adapterKey) {
        const adapterName = _adapterKey.split(':').pop();
        readFromChromeLocalStorage([_adaptersBaseKey])
        .then(results => {
            const adapters = results[_adaptersBaseKey] as Array<string>;
            const adapterIndex = adapters.indexOf(adapterName);
            if (adapterIndex !== -1) {
                adapters.splice(adapterIndex, 1);
                saveToChromeLocalStorage({ [_adaptersBaseKey]: adapters })
                .then(() => {
                    removeFromChromeLocalStorage([_adapterKey, `query:${adapterName}`])
                    .then(() => {
                        callback();
                    });
                });
            }
        });
    }
}

function resetScraperState() {
    _adapterKey = null;
    _rowElementSelector = null;
    _column = -1;
    _columnMap.clear();
    clearElementMaps();
    _mouseClickColumColors = [];
}

function initTutorial() {
    _tutorialElement = htmlToElement(_tutorialHTML);
    document.body.prepend(_tutorialElement);
}

function removeTutorial() {
    if (_tutorialElement) {
        removeScraperControls();
        _tutorialElement.remove();
        _tutorialElement = null;
    }
}

function resetTutorial() {
    removeTutorial();
    initTutorial();  
}

function initScraperControls() {
    updateTutorialMessage({ message: `
        2. Alt + click on a field within the selected rows to add it to the current column
        of the table and alt + click on it again to remove it.
    `});
    _scraperControlsElement = htmlToElement(_scraperControlsHTML);
    _tutorialElement.append(_scraperControlsElement);
    _column += 1;
    addColumnControlListeners();
}

function removeScraperControls() {
    if (_scraperControlsElement) {
        removeScraperControlsListeners();
        _scraperControlsElement.remove();
        _scraperControlsElement = null;
    }
}

function updateTutorialMessage({ message }) {
    if (_tutorialElement){
        _tutorialElement.querySelector('#message').textContent = message;
    }
}

function createColumnLabel(columnIndex) {
    return String.fromCharCode(97 + columnIndex).toUpperCase()
}

function columnControlListener(event){
    if (event.target.id === 'prevButton') {
        const proposed = _column - 1;
        if (_columnMap.has(proposed)) {
            _column = proposed;
            _scraperControlsElement.querySelector('#columnNumber').textContent = createColumnLabel(proposed);
        } else {
            alert(`You are trying to switch to an invalid column.`);
        }
    } else {
        const proposed = _column + 1;
        if (!_columnMap.get(_column) || (_columnMap.get(_column) && !_columnMap.get(_column).length)) {
            alert(`Please select fields for column ${createColumnLabel(_column)} before moving to column ${createColumnLabel(proposed)}.`);
            return;
        }
        if (!_columnMap.has(proposed)) {
            _columnMap.set(proposed, []);
        }
        _column = proposed;
        _scraperControlsElement.querySelector('#columnNumber').textContent = createColumnLabel(proposed);
    }
}

function scraperControlsListener(event) {
    switch (event.target.id) {
        case 'startOverButton':
            chrome.runtime.sendMessage({ command: 'resetAdapter'})
            break;
        case 'cancelButton':
            chrome.runtime.sendMessage({ command: 'deleteAdapter'})
            break;
        case 'saveButton':
            chrome.runtime.sendMessage({ command: 'saveAdapter'})
            break;
        default:
            break;
    }
}

function addColumnControlListeners() {
    if (_scraperControlsElement) {
        _scraperControlsElement.querySelector('#prevButton').addEventListener('click', columnControlListener);
        _scraperControlsElement.querySelector('#nextButton').addEventListener('click', columnControlListener);
        _scraperControlsElement.querySelector('#startOverButton').addEventListener('click', scraperControlsListener);
        _scraperControlsElement.querySelector('#cancelButton').addEventListener('click', scraperControlsListener);
        _scraperControlsElement.querySelector('#saveButton').addEventListener('click', scraperControlsListener);
    }
}

function removeScraperControlsListeners() {
    if (_scraperControlsElement) {
        _scraperControlsElement.querySelector('#prevButton').removeEventListener('click', columnControlListener);
        _scraperControlsElement.querySelector('#nextButton').removeEventListener('click', columnControlListener);
        _scraperControlsElement.querySelector('#startOverButton').removeEventListener('click', scraperControlsListener);
        _scraperControlsElement.querySelector('#cancelButton').removeEventListener('click', scraperControlsListener);
        _scraperControlsElement.querySelector('#saveButton').removeEventListener('click', scraperControlsListener);
    }
}

function addScrapingListeners() {
    document.body.addEventListener('click', scraperClickListener, true);
    document.body.addEventListener('mousemove', scraperMouseMoveListener, true);
}

function removeScrapingListeners() {
    document.body.removeEventListener('click', scraperClickListener, true);
    document.body.removeEventListener('mousemove', scraperMouseMoveListener, true);
}

export function startScrapingListener() {
    addScrapingListeners();
    initTutorial();
}

export function stopScrapingListener({ save }) {
    removeScrapingListeners();
    if (!save) {
        deleteAdapter(() => {
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
    deleteAdapter(() => {
        resetScraperState();
        resetTutorial();
        run({ creatingAdapter: true });
    });
}
