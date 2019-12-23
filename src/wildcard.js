'use strict';

import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";

import _ from "lodash";

// convert HTML to a dom element
function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

function createToggleButton(container) {
  // set up button to open the table
  let toggleBtn = htmlToElement(`<button style="
    font-weight: bold;
    border-radius: 10px;
    z-index: 100000;
    padding: 10px;
    position: fixed;
    top: 20px;
    left: 50%;
    background-color: white;
    box-shadow: 0px 0px 10px -1px #d5d5d5;
    border: none;
    " class="open-apps-trigger">💡Table View</button>'`)
  toggleBtn.addEventListener('click', () => { container.style.visibility = (container.style.visibility === "visible") ? "hidden" : "visible" })
  document.body.appendChild(toggleBtn)
}

// Given an HTMLElement for a cell, get the value to display in the table.
// Currently default behavior is crude: just gets the input value or text content.
let getValueFromElement = (spec, cellElement) => {
  if (spec.hasOwnProperty("value")) {
    return spec.value(cellElement)
  } else {
    return cellElement.value || cellElement.textContent
  }
}

function getDataFromPage(options) {
  let rows = options.getDataRows();
  return rows.map(rowEl => {
    let row = {}
    options.colSpecs.forEach(spec => {
      let cellEl = spec.el(rowEl)
      row[spec.fieldName] = getValueFromElement(spec, cellEl)
    })
    return row
  })
}

function colSpecFromProp(prop, options) {
  return options.colSpecs.find(spec => spec.fieldName == prop)
}

// given column names and data array...
// render a handsontable

// options format:
// todo: having both element and value here is kinda annoying...
// maybe value can be the primary, and el can be optional?
// colSpecs: [{
//   fieldName: "returnDate",
//   el: (row) => row.querySelector("#package-returning-hp-package"),
//   value? : (cell) => cell.textContent.match(/\$([\d]*)/)[1],
//   readOnly: false,
//   type: "text",
//   editor?: "fullcalendar"
// }]
// 
// getDataRows: function => [DomElement], return array of rows as DOM elements
// setupReloadTriggers: function(reload) => 
// attach DOM handlers to trigger data reloading at appropriate times.

const createTable = (options) => {
  console.log("Wildcard activated...");

  // add wrapper div
  let newDiv = htmlToElement("<div id=\"open-apps\" class=\"mydiv\" style=\"border-top: solid thin #ddd; position: fixed; overflow: hidden; background-color: white; height: 300px; width: 100%; z-index: 1000; bottom: 0;\"><div id=\"open-apps-table\"></div></div>")
  document.body.appendChild(newDiv);
  var container = document.getElementById('open-apps-table');

  // set up data for table
  let rowContainer = options.getRowContainer()
  let rows = options.getDataRows()
  let data = getDataFromPage(options)
  let rowsById = _.keyBy(rows, row => {
    return options.colSpecs.find(spec => spec.fieldName === "id").value(row)
  })


  let columns = options.colSpecs.map(col => ({
    data: col.fieldName,
    readOnly: col.readOnly,
    type: col.type,
    dateFormat: "MM/DD/YYYY",
    datePickerConfig: {
      events: ['Sun Dec 15 2019', 'Sat Dec 07 2019'], //todo: move this out of the core plugin
      firstDay: 1,
      numberOfMonths: 3
    },
    editor: col.editor,
    renderer: col.renderer,
    hidden: col.hidden
  }))

  let hiddenColIndexes = columns.map((col, idx) => col.hidden ? idx : null).filter(e => Number.isInteger(e))

  var hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: options.colSpecs.map(col => col.fieldName),
    filters: true,
    formulas: true,
    stretchH: 'none',
    dropdownMenu: true,
    columnSorting: true,
    columns: columns,
    hiddenColumns: {
      columns: hiddenColIndexes,
    },
    afterChange: (changes) => {
      if (changes) {
        changes.forEach(([row, prop, oldValue, newValue]) => {
          let colSpec = colSpecFromProp(prop, options)
          if (colSpec.readOnly) { return; }

          let rowEl = rows[row] // this won't work with re-sorting; change to ID
          let el = colSpec.el(rowEl)
          el.value = newValue
        });
      }
    },
    licenseKey: 'non-commercial-and-evaluation'
  });

  createToggleButton(newDiv);

  // set up handlers to react to div changes
  // todo: this is inefficient; can we make fewer handlers?
  rows.forEach((row, idx) => {
    options.colSpecs.forEach(col => {
      let el = col.el(row)
      el.addEventListener("input", e => {
        hot.setDataAtRowProp(idx, col.fieldName, e.target.value)
      })
    })
  })

  // set up page-specific reload triggers
  options.setupReloadTriggers(() => {
    let data = getDataFromPage(options)
    hot.loadData(data)
  })

  // Highlight the selected row or cell in the original page.
  // This is important for establishing a clear mapping between page and table.
  // Probably need to provide a lot more site-specific config, including:
  // * whether to highlight just cells or whole row
  // * colors
  // * borders vs background
  Handsontable.hooks.add('afterSelectionByProp', (row, prop) => {
    const highlightColor = "#c9ebff"
    const unhighlightColor = "#ffffff"

    let rowEl = rowsById[hot.getDataAtCell(row, 0)]
    let colSpec = colSpecFromProp(prop, options)
    let colEl = colSpec.el(rowEl)

    if (rows.length > 1) {
      // For multiple rows, we highlight the whole row

      rowEl.style["background-color"] = highlightColor
      rowEl.scrollIntoView({ behavior: "smooth", block: "center" })

      // Clear border on other divs
      let otherDivs = rows.filter(r => r !== rowEl)
      otherDivs.forEach( d => d.style["background-color"] = unhighlightColor )
    } else {
      // For a single row, we highlight individual cells in the row

      // Add a border and scroll selected div into view
      colEl.style["background-color"] = highlightColor
      colEl.scrollIntoView({ behavior: "smooth", block: "center" })

      // Clear border on other divs
      let otherDivs = options.colSpecs.filter(spec => spec !== colSpecFromProp(prop, options)).map(spec => spec.el(rowEl))
      otherDivs.forEach( d => d.style["background-color"] = unhighlightColor )
    }
  }, hot)

  // After a filter/sort, show rows in the new order
  let hooks = ["afterColumnSort", "afterFilter"]
  hooks.forEach(hook => {
    Handsontable.hooks.add(hook, (row, prop) => {
      let ids = hot.getDataAtCol(0)
      rowContainer.innerHTML = ""
      ids.forEach (id => { rowContainer.appendChild(rowsById[id]) })
    })
  })
}

export { createTable, Handsontable }