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
const _mouseMoveColor = 'rgb(52, 152, 219)';
const _mouseClickColor = 'rgb(46, 204, 113)';
const _adaptersBaseKey = 'localStorageAdapter:adapters';
let _adapterKey;
let _rowElementSelector;
let _targetNodesSelectors = [];
const _defaultTutorialMessage = 'Hover over a row of the dataset until all the relevant rows have a blue border';
const _tutorialHTML = `
    <div id='wc-scraper-tutorial' style='width: 100vw; background-color: rgb(52, 152, 219); color: white; position: absolute; top: 0; left: 0; text-align: center;'>
        <span id='message' style='padding: 2.5px; margin: 2.5px;'>
            ${_defaultTutorialMessage}
        </span>
    </div>
`;

let _tutorialElement;

function generateNodeSelector(node) {
    let selector = node.tagName.toLowerCase();
    if (node.classList && node.classList.length) {
        selector += `.${Array.from(node.classList).join('.')}`;
    }
    return selector;
}

function generateNodeSelectorFrom(node, from) {
    if (node.isSameNode(from)) {
        return null;
    }
    const selectors = [];
    let _node = node;
    while (!_node.isSameNode(from)) {
        selectors.unshift(generateNodeSelector(_node));
        _node = _node.parentNode;
    }
    return selectors.join(">");
}

function generateIndexedNodeSelector(node) {
    const tag = node.tagName.toLowerCase();
    const index = Array.prototype.indexOf.call(node.parentNode.children, node) + 1;
    return `${tag}:nth-child(${index})`;
}

function generateIndexedNodeSelectorFrom(node, from) {
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

function findRowElement(nodes, lca) {
    const candidates = [];
    let selectors = nodes.map(node => generateIndexedNodeSelectorFrom(node, lca)).filter(selector => selector);
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
          rowElementSelector: generateNodeSelectorFrom(candidates[0].candidate, document.body),
      };
    }
    return null
}

function generateTargetNodeSelectors(rowElementSelector, nodes) {
    const selectors = [];
    const rowElements = Array.from(document.querySelectorAll(rowElementSelector));
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < rowElements.length; j++) {
            if (rowElements[j].contains(nodes[i])) {
                selectors.push(generateIndexedNodeSelectorFrom(nodes[i], rowElements[j]));
                break;
            }
        }
    }
    return selectors;
}


function generateScraper(targetSelectors, rowElementSelector) {
    const name = document.title
    const attributes = createTableColumns(Math.max(targetSelectors.length, 4));
    const config =`{
      name: "${name}",
      contains: "${window.location.href}",
      attributes: ${JSON.stringify(attributes)},
      scrapePage: () => {
        return Array.from(document.querySelectorAll("${rowElementSelector}")).map((element, index) => {
            const dataValues = {};
            ${JSON.stringify(targetSelectors)}.forEach((selector, index) => {
                const selected = element.querySelector(selector);
                dataValues[String.fromCharCode(97 + index).toUpperCase()] = selected ? selected.textContent.trim() : "";
            });
            return {
                id: String(index),
                dataValues,
                rowElements: [element]
            }
        });
      }
    }`.trim();
    return {
        name,
        config
    };
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

function clickListener(event) {
    if (ignoreEvent(event)) {
        return;
    }
    event.preventDefault();
    const target = event.target as HTMLElement;
    if (_rowElementSelector) {
        if (!target.childElementCount && 
            target.textContent &&
            inSelectorElements({ selector: _rowElementSelector, node: target })
        ){
            clearElementMap(_eventMaps._mouseClickTargetNode, true);
            const targetNodeSelector = generateTargetNodeSelectors(_rowElementSelector, [target]).shift();
            const targetNodeSelectorIndex = _targetNodesSelectors.indexOf(targetNodeSelector);
            if (targetNodeSelectorIndex === -1) {
                _targetNodesSelectors.push(targetNodeSelector);
            } else {
                _targetNodesSelectors.splice(targetNodeSelectorIndex, 1);
            }
            const styleProperty = 'backgroundColor';
            const styleValue = _mouseClickColor;
            Array.from(document.querySelectorAll(_rowElementSelector))
            .forEach((rowElement) => {
                _targetNodesSelectors
                .map(selector => rowElement.querySelector(selector) as HTMLElement)
                .filter(targetNode => targetNode)
                .forEach(targetNode => {
                    setStyleAndAddToMap({
                        map: _eventMaps._mouseClickTargetNode,
                        node: targetNode,
                        styleProperty,
                        styleValue
                    });
                });
            });
            const { name, config } = generateScraper(_targetNodesSelectors, _rowElementSelector);
            _adapterKey = `${_adaptersBaseKey}:${name}`;
            saveAdapter({ config });   
        }
    } else {
        clearElementMap(_eventMaps._mouseClickRowElement);
        const rowElementData = findRowElement([target], target);
        if (rowElementData) {
            const { rowElementSelector } = rowElementData;
            const styleProperty = 'border';
            const styleValue = `1px solid ${_mouseClickColor}`;
            Array.from(document.querySelectorAll<HTMLElement>(rowElementSelector))
            .forEach((rowElement) => {
                setStyleAndAddToMap({
                    map: _eventMaps._mouseClickRowElement,
                    node: rowElement,
                    styleProperty,
                    styleValue
                });
            });
            const { name, config } = generateScraper([], rowElementSelector);
            _adapterKey = `${_adaptersBaseKey}:${name}`;
            _rowElementSelector = rowElementSelector;
            saveAdapter({ config });
            updateTutorialMessage({ message: 'Hover over the text fields in any of the rows. Click on a field to add it to the table, click on it again to remove it.' })
        }
    }
}

function mouseMoveListener(event) {
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
            Array.from(document.querySelectorAll<HTMLElement>(rowElementSelector))
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
                Array.from(document.querySelectorAll<HTMLElement>(_rowElementSelector))
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

function saveAdapter({ config }) {
    if (_adapterKey) {
        const adapterName = _adapterKey.split(':').pop();
        readFromChromeLocalStorage([_adaptersBaseKey])
        .then(results => {
            const adapters = results[_adaptersBaseKey];
            if (!adapters.includes(adapterName)) {
                adapters.push(adapterName);
                saveToChromeLocalStorage({ 
                    [_adaptersBaseKey]: adapters,
                    [_adapterKey]: config
                }).then(() => {
                    run({ creatingAdapter: true });
                })
            } else {
                saveToChromeLocalStorage({ [_adapterKey]: config })
                .then(() => {
                    run({ creatingAdapter: true });
                });
            }
        });
    }
}

function deleteAdapter({ creatingAdapter }) {
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
                        resetGlobals();
                        clearElementMaps();
                        run({ creatingAdapter });
                    });
                });
            }
        });
    }
}

function resetGlobals() {
    _adapterKey = null;
    _targetNodesSelectors = [];
    _rowElementSelector = null;
}

function resetTutorial() {
    updateTutorialMessage({
        message: _defaultTutorialMessage
    });
}

function removeTutorial() {
    if (_tutorialElement) {
        _tutorialElement.remove();
    }
}

function updateTutorialMessage({ message }) {
    if (_tutorialElement){
        _tutorialElement.querySelector('#message').textContent = message;
    }
}

export function startScrapingListener() {
    document.body.addEventListener('click', clickListener);
    document.body.addEventListener('mousemove', mouseMoveListener);
    _tutorialElement = htmlToElement(_tutorialHTML);
    document.body.prepend(_tutorialElement);
}

export function stopScrapingListener({ save }) {
    document.body.removeEventListener('click', clickListener);
    document.body.removeEventListener('mousemove', mouseMoveListener);
    removeTutorial();
    if (!save) {
        deleteAdapter({ creatingAdapter: false });
    } else {
        resetGlobals();
        clearElementMaps();
        run({ creatingAdapter: false });
    }
}

export function resetScrapingListener() {
    resetTutorial();
    deleteAdapter({ creatingAdapter: true });
}
