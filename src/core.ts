'use strict';

import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";

import "./wildcard.css";

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

// Given an Element for a cell, get the value to display in the table.
// Currently default behavior is crude: just gets the input value or text content.
let getValueFromElement = (spec, cellElement) => {
  if (spec.hasOwnProperty("getValue")) {
    return spec.getValue(cellElement)
  } else {
    return cellElement.value || cellElement.textContent
  }
}

function getDataFromPage(options: SiteAdapterOptions) {
  let rows = options.getDataRows();
  return rows.map(rowEl => {
    let row = { el: rowEl }
    options.colSpecs.forEach(spec => {
      let cellValue;
      // handle a hardcoded value for all rows in the column
      if (spec.hasOwnProperty("colValue")) { cellValue = spec.colValue }
        else {
          let cellEl = spec.el(rowEl)
          if (cellEl) {
            cellValue = getValueFromElement(spec, cellEl)
          } else {
            cellValue = null
          }
        }
        row[spec.fieldName] = cellValue
      })
    return row
  })
}

function colSpecFromProp(prop, options) {
  return options.colSpecs.find(spec => spec.fieldName == prop)
}

interface ColSpecs {
  /** The name of this data column, to be displayed in the table */
  fieldName: string;
  el(row: HTMLElement): HTMLElement;
  getValue?(el: HTMLElement): any;
  colValue?: any; // hardcode the value for all rows
  readOnly?: boolean;
  type: string;
  editor?: string,
  renderer?: string,
  hidden?: boolean
}

interface SiteAdapterOptions {
  name: string;
  urlPattern: string;
  colSpecs: Array<ColSpecs>;
  getDataRows(): Array<HTMLElement>;
  setupReloadTriggers(setupFn: any): any;
  getRowContainer(): HTMLElement;
}

/** The main method for creating a Wildcard site adapter.
 *  In your adapter, call this with a valid [[SiteAdapterOptions]] object
 *  to initialize your adapter.
 */
 const createTable = (options: SiteAdapterOptions) => {
   let rowContainer, rows, data, rowsById;

   // Load data from table; map data to DOM elements
   let loadData = () => {
     rowContainer = options.getRowContainer()
     rows = options.getDataRows()
     data = getDataFromPage(options)
     rowsById = _.chain(data).keyBy(row => row.id).mapValues(row => row.el).value()
     console.log("loaded data", data)
   }

   loadData()

   let columns: Array<any> = options.colSpecs.map(col => ({
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
     hidden: col.hidden,
     name: col.fieldName
   }))

   // create container div
   let newDiv = htmlToElement("<div id=\"wildcard-container\" style=\"\"><div id=\"wildcard-table\"></div></div>") as HTMLElement
   if (rows.length == 1) { newDiv.classList.add("single-row") }
     document.body.appendChild(newDiv);
   var container = document.getElementById('wildcard-table');

   var hot = new Handsontable(container, {
     data: data,
     rowHeaders: true,
     colHeaders: columns.map(col => col.name),
     // formulas: true,
     stretchH: 'none',
     dropdownMenu: true,
     filters: true,
     columnSorting: true,
     columns: columns,
     hiddenColumns: {
       columns: columns.map((col, idx) => col.hidden ? idx : null).filter(e => Number.isInteger(e))
     },
     afterChange: (changes) => {
       if (changes) {
         changes.forEach(([row, prop, oldValue, newValue]) => {
           let colSpec = colSpecFromProp(prop, options)
           if (!colSpec || colSpec.readOnly) { return }

             let rowEl = rows[row] // this won't work with re-sorting; change to ID
           let el = colSpec.el(rowEl)
           el.value = newValue
         });
       }
     },
     licenseKey: 'non-commercial-and-evaluation'
   });

   createToggleButton(newDiv);

   // reload data from page:
   // re-extract, and then load into the spreadsheet
   // TODO: unify this more cleanly with loadData;
   // this works this way right now because Handsontable requires
   // loading the data differently the first time it's initialized
   // vs. subsequent updates
   let reloadData = () => {
     let oldData = data
     loadData() // mutates data
     data = oldData.map((row, index) => _.merge(row, data[index]))
     hot.loadData(data)
   }

   // set up handlers to try to catch any changes that happen
   // we look for input events on rows, and also monitor DOM of row container
   // should this all move out to "setup reload triggers"?
   let reloadTriggers = ["input", "click", "change", "keyup"]
   rows.forEach((row, idx) => {
     // options.colSpecs.forEach(col => {
       //   let el = col.el(row)
       //   reloadTriggers.forEach(eType => {
         //     el.addEventListener(eType, e => reloadData)
         //   })
         // })

         reloadTriggers.forEach(eType => {
           row.addEventListener(eType, e => reloadData)
         })
       })

   let observer = new MutationObserver((mutationList, observer) => {
     // if (mutationList.length >= 1) { reloadData() }

     // this is super super hacky,
     // just to get todomvc demo working
     // the goal is to only catch little checkbox mutations
     // but not big ones from filtering etc
     if (mutationList.length === 1) { reloadData() }
   });
   observer.observe(rowContainer, {
     childList: true,
     attributes: false,
     subtree: true
   });

   // set up page-specific reload triggers
   options.setupReloadTriggers(reloadData)

   // Highlight the selected row or cell in the original page.
   // This is important for establishing a clear mapping between page and table.
   // Probably need to provide a lot more site-specific config, including:
   // * whether to highlight just cells or whole row
   // * colors
   // * borders vs background
   Handsontable.hooks.add('afterSelectionByProp', (row, prop) => {
     const highlightColor = "#c9ebff"
     const unhighlightColor = "#ffffff"

     let colSpec = colSpecFromProp(prop, options)
     if (!colSpec) { return; }

     let rowEl: HTMLElement = rowsById[hot.getDataAtCell(row, 0)]
     let colEl: HTMLElement = colSpec.el(rowEl)

     if (rows.length > 1) {
       // For multiple rows, we highlight the whole row

       // rowEl.style["background-color"] = highlightColor
       rowEl.style["border"] = `solid 2px ${highlightColor}`
       rowEl.scrollIntoView({ behavior: "smooth", block: "center" })

       // Clear highlight on other divs
       let otherDivs = rows.filter(r => r !== rowEl)
       // otherDivs.forEach( d => d.style["background-color"] = unhighlightColor )
       otherDivs.forEach(d => d.style["border"] = `none`)
     } else {
       // For a single row, we highlight individual cells in the row

       // Add a border and scroll selected div into view
       colEl.style["background-color"] = highlightColor
       colEl.scrollIntoView({ behavior: "smooth", block: "center" })

       // Clear border on other divs
       let otherDivs = options.colSpecs.filter(spec => spec !== colSpecFromProp(prop, options)).map(spec => spec.el(rowEl))
       otherDivs.forEach(d => d.style["background-color"] = unhighlightColor)
     }
   }, hot)

   let hooks = ["afterColumnSort" as const, "afterFilter" as const]
   hooks.forEach(hook => {
     Handsontable.hooks.add(hook, () => {
       let ids = hot.getDataAtCol(0)
       rowContainer.innerHTML = ""
       ids.forEach(id => {
         if (rowsById[id]) {
           rowContainer.appendChild(rowsById[id])
         }
       })
     })
   })

   return {
     hot: hot,
     columns: columns
   }
 }

 export { createTable }
