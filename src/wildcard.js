'use strict';

import Handsontable from "handsontable";

// convert HTML to a dom element
function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

function setupStyles() {
  var link = window.document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = 'https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css';
  document.getElementsByTagName("head")[0].appendChild(link);
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

function getDataFromPage(options) {
  let rows = options.getDataRows();
  return rows.map(rowEl => {
    let row = {}
    options.colSpecs.forEach(spec => {
      row[spec.fieldName] = spec.el(rowEl).value;
    })
    return row
  })
}

function colSpecFromProp(prop, options) {
  return options.colSpecs.find(spec => spec.fieldName == prop)
}

// given column names and data array...
// render a handsontable
const createTable = (options) => {
  console.log("wildcard is active...");
  setupStyles();

  // add wrapper div
  let newDiv = htmlToElement("<div id=\"open-apps\" class=\"mydiv\" style=\"border-top: solid thin #ddd; position: fixed; overflow: hidden; background-color: white; height: 300px; width: 100%; z-index: 1000; bottom: 0;\"><div id=\"open-apps-table\"></div></div>")
  document.body.appendChild(newDiv);
  var container = document.getElementById('open-apps-table');

  // set up data for table
  let rows = options.getDataRows()
  let data = getDataFromPage(options)

  let columns = options.colSpecs.map(col => ({
    data: col.fieldName,
    readOnly: col.readOnly,
    type: col.type,
    dateFormat: "MM/DD/YYYY",
    datePickerConfig: {
      events: ['Sun Dec 15 2019', 'Sat Dec 07 2019'],
      firstDay: 1,
      numberOfMonths: 3
    },
    editor: col.editor
  }))

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

  Handsontable.hooks.add('afterSelectionByProp', (row, prop) => {
    let rowEl = rows[row] // this won't work with re-sorting; change to ID
    let colSpec = colSpecFromProp(prop, options)
    let colEl = colSpec.el(rowEl)

    // Add a border and scroll selected div into view
    colEl.style["background-color"] = "#c9ebff"
    colEl.scrollIntoView({ behavior: "smooth", block: "center" })

    // Clear border on other divs
    let otherDivs = options.colSpecs.filter(spec => spec !== colSpecFromProp(prop, options)).map(spec => spec.el(rowEl))
    otherDivs.forEach( d => d.style["background-color"] = "#fff" )
  }, hot)
}

export { createTable }