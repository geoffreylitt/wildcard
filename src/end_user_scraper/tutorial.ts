import {
    htmlToElement
} from '../utils';

import {
    getColumn,
    setColumn,
    getColumnMap
} from './state';

import {
    MOUSE_MOVE_COLOR
} from './constants';

const _defaultTutorialMessage = '1. Hover over a row of the dataset until all the relevant rows have a border and then alt + click any them to proceed to step 2';
const _tutorialHTML = `
    <div id='wc-scraper-tutorial' style='display: flex; flex-direction: column; justify-content: center; z-index: 1000; width: 100vw; background-color: ${MOUSE_MOVE_COLOR}; color: white; position: fixed; top: 0; left: 0; opacity: 0.9; font-size: 0.9em;'>
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
let _scraperControlsElement;

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

export function getTutorialElement() {
    return _tutorialElement;
}

export function initTutorial() {
    _tutorialElement = htmlToElement(_tutorialHTML);
    document.body.prepend(_tutorialElement);
}

export function removeTutorial() {
    if (_tutorialElement) {
        removeScraperControls();
        _tutorialElement.remove();
        _tutorialElement = null;
    }
}

export function resetTutorial() {
    removeTutorial();
    initTutorial();  
}

export function initScraperControls() {
    updateTutorialMessage({ message: `
        2. Alt + click on a field within the selected rows to add it to the current column
        of the table and alt + click on it again to remove it.
    `});
    _scraperControlsElement = htmlToElement(_scraperControlsHTML);
    _tutorialElement.append(_scraperControlsElement);
    setColumn(getColumn() + 1);
    addColumnControlListeners();
}