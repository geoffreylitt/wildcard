import {
    htmlToElement
} from '../utils';

import {
    getColumn,
    setColumn,
    getColumnMap,
    setMultipleExamples,
} from './state';

import {
    ACTIVE_COLOR,
    INACTIVE_COLOR
} from './constants';
import { indexToAlpha } from './utils';

const TUTORIAL_BACKGROUND_COLOR = 'rgb(255, 255, 255)';
const TUTORIAL_TEXT_COLOR = 'rgb(0, 0, 0)';

const _tutorialHTML = `
    <div id='wc-scraper-tutorial' style='display: flex; flex-direction: column; justify-content: center; z-index: 1000; width: 100vw; background-color: ${TUTORIAL_BACKGROUND_COLOR}; color: ${TUTORIAL_TEXT_COLOR}; position: fixed; top: 0; left: 0; opacity: 0.95; font-size: 1em; box-shadow: 0 0 20px rgba(0,0,0,0.8); border-radius: 5px; padding: 1px; margin: 1px;'>
        <div class='instructions' style='margin: 1px; text-align: center;display:flex;justify-content:flex-end;'>
            <span id='message' style='padding: 2.5px; margin: 2.5px;'>
              Alt + click (option instead of alt on Mac) on a field you wish to scrape
            </span>
        </div>
        <div id='wc-scraper-tutorial-column-controls' style='margin: 1px; display: flex; height: 52px;'>
            <div style='padding: 1px; margin: 1px;flex: 1;display:flex;flex-direction:row;' id='columnContainer'>
            </div>
            <div style='padding: 1px; margin: 1px;display:flex;align-items:center'>
                <button id='startOverButton' style='margin: 1px;'> Restart</button>
                <button id='cancelButton' style='margin: 1px;'>Cancel</button>
                <button id='saveButton' style='margin: 1px;'>Done</button>
            </div>
        </div>
    </div>
`;

let _tutorialElement;
let _scraperControlsElement;

function createColumnBoxString({ column, color, index }) {
    return `
        <div id=${index} class='column-box' style='padding:2px;margin:2px;height:40px;width:50px;background-color:${color};font-size:1.25em;color:white;display:flex;align-items:center;justify-content:center;border-radius:5px;cursor:pointer;'>
            ${column}
        </div>
    `
}

function createColumnBoxElement({ column, color, index }) {
    const html = createColumnBoxString({ column, color, index });
    return htmlToElement(html);
}

function columnBoxListener(event) {
    const target = event.target;
    if (target.classList.contains('column-box')) {
        const columnMap = getColumnMap();
        const column = parseInt(target.id);
        setColumn(column);
        if (column === columnMap.size - 1) {
            setMultipleExamples(false);
        } else {
            setMultipleExamples(true);
        }
        renderColumnBoxes(columnMap);
    }
}

function clearColumnBoxes() {
    const columnContainer = document.querySelector('#columnContainer');
    columnContainer.innerHTML = '';
    removeColumnBoxListener();
}

function populateColumnBoxes(columnMap, column?) {
    const columnContainer = document.querySelector('#columnContainer');
    const columns = columnMap.size;
    const activeColumn = Number.isInteger(column) ? column : getColumn();
    if (columns) {
        for (let i = 0; i < columns; i++) {
            const columnBoxElement = createColumnBoxElement({
                column: indexToAlpha(i),
                color: i === activeColumn ? ACTIVE_COLOR : INACTIVE_COLOR,
                index: i
            });
            columnContainer.appendChild(columnBoxElement);
        }
        addColumnBoxListener();
    }
}

function addColumnBoxListener() {
    if (_tutorialElement) {
        document.querySelector('#columnContainer').addEventListener('click', columnBoxListener);
    }
}

function removeColumnBoxListener(){
    if (_tutorialElement) {
        document.querySelector('#columnContainer').addEventListener('click', columnBoxListener);
    }
}

export function renderColumnBoxes(columnMap, column?) {
    clearColumnBoxes();
    populateColumnBoxes(columnMap, column);
}

function createColumnLabel(columnIndex) {
    return String.fromCharCode(97 + columnIndex).toUpperCase()
}

function columnControlListener(event){
    const columnMap = getColumnMap();
    const column = getColumn();
    if (event.target.id === 'prevButton') {
        const proposed = column - 1;
        if (columnMap.has(proposed)) {
            setColumn(proposed);
            _scraperControlsElement.querySelector('#columnNumber').textContent = createColumnLabel(proposed);
        } else {
            alert(`You are trying to switch to an invalid column.`);
        }
    } else {
        const proposed = column + 1;
        if (!columnMap.get(column) || (columnMap.get(column) && !columnMap.get(column).length)) {
            alert(`Please select fields for column ${createColumnLabel(column)} before moving to column ${createColumnLabel(proposed)}.`);
            return;
        }
        if (!columnMap.has(proposed)) {
            columnMap.set(proposed, []);
        }
        setColumn(proposed);
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
    if (_tutorialElement) {
        _tutorialElement.querySelector('#startOverButton').addEventListener('click', scraperControlsListener);
        _tutorialElement.querySelector('#cancelButton').addEventListener('click', scraperControlsListener);
        _tutorialElement.querySelector('#saveButton').addEventListener('click', scraperControlsListener);
    }
}

function removeColumnControlListeners() {
    if (_tutorialElement) {
        _tutorialElement.querySelector('#startOverButton').removeEventListener('click', scraperControlsListener);
        _tutorialElement.querySelector('#cancelButton').removeEventListener('click', scraperControlsListener);
        _tutorialElement.querySelector('#saveButton').removeEventListener('click', scraperControlsListener);
    }
}

export function getTutorialElement() {
    return _tutorialElement;
}

export function initTutorial() {
    _tutorialElement = htmlToElement(_tutorialHTML);
    document.body.prepend(_tutorialElement);
    addColumnControlListeners();
    renderColumnBoxes(getColumnMap());
}

export function removeTutorial() {
    if (_tutorialElement) {
        clearColumnBoxes();
        removeColumnControlListeners();
        _tutorialElement.remove();
        _tutorialElement = null;
    }
}

export function resetTutorial() {
    removeTutorial();
    initTutorial();  
}