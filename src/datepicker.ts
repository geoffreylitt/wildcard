import { createTable } from './wildcard';

import { FullCalendarEditor } from './fullCalendarEditor.js'

// Return all the "item" divs in a list
const getDataRows = () => {
  return [
    document.getElementById("gcw-packages-form-hp-package")
  ]
}

const getRowContainer = () => {
  return document.getElementById("gcw-packages-form-hp-package")
}

// provide column names, column config, and lambda for finding that column's div within a row
const colSpecs = [
  {
    fieldName: "id",
    colValue: 1,
    // a phantom element -- ugly. 
    // can we change the API so that not all columns need this?
    el: (row) => document.createElement("div"),
    type: "text",
    hidden: true,
    readOnly: true
  },
  {
    fieldName: "origin",
    el: (row) => row.querySelector("#package-origin-hp-package"),
    readOnly: true,
    type: "text"
  },
  {
    fieldName: "destination",
    el: (row) => row.querySelector("#package-destination-hp-package"),
    readOnly: true,
    type: "text"
  },
  {
    fieldName: "departDate",
    el: (row) => row.querySelector("#package-departing-hp-package"),
    readOnly: false,
    type: "text",
    editor: FullCalendarEditor
  },
  {
    fieldName: "returnDate",
    el: (row) => row.querySelector("#package-returning-hp-package"),
    readOnly: false,
    type: "text",
    editor: FullCalendarEditor
  }
];

// set up triggers for when the data should reload
// todo: this is a weird API... simplify?
const setupReloadTriggers = (reload) => {
  document.addEventListener("click", (e) => {
    let target = e.target as HTMLElement
    if (target.matches("button.datepicker-cal-date")) {
      reload()
    }
  })
}

createTable({
  colSpecs: colSpecs,
  getDataRows: getDataRows,
  getRowContainer: getRowContainer,
  setupReloadTriggers: setupReloadTriggers
});