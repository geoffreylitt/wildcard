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

/* function getDataFromPage(options: SiteAdapterOptions) {
  let rows = options.getDataRows();
  rows.forEach(row => {
    options.colSpecs.forEach(spec => {
      // If an HTML element is specified as a value,
      // do a simple extraction of its value
      // (commented out for now; will come back in Expedia example)
      // if (typeof row[spec.name] === HTMLElement) {
        //   row[spec.name] = cellElement.value || cellElement.textContent
        // }
      })
  })

  return rows
} */

function colSpecFromProp(prop, options : SiteAdapterOptions) {
  return options.colSpecs.find(spec => spec.name == prop)
}

/**
* Defines the schema for one column of the table being extracted.
*/
interface ColSpec {
  /** The name of this data column, to be displayed in the table */
  name: string;
  readOnly?: boolean;
  type: string;
  colValue?: any;
  editor?: string;
  renderer?: string;
  hidden?: boolean;
}

/** A data value extracted from the page.
*   There are two options for specifying a value:
*
*   * Element: You can specify a DOM element and Wildcard will extract its
*     contents. If the column is writable, Wildcard will also replace the
*     contents of the DOM element when the value is edited in the table.
*   * string value: You can run arbitrary code (e.g. regexes) to
*     extract a string from the DOM and show it in the table.
*     **Only compatible with readonly columns.**
*     You can use the [[ColSpec]] to specify a type for this column, which will
*     cast the string into different types like numbers or dates.
*/
type DataValue = Element | string

interface DataRow {
  /** The element representing the row */
  el: HTMLElement;

  /** The data values for the row, with column names as keys */
  dataValues: { [key: string]: DataValue }
}

interface SiteAdapterOptions {
  /** A user visible name for the adapter */
  name: string;

  /** Specify which URL paths to activate this adapter on.
   * Currently just checks if the given pattern is a substring of
   * current URL path. */
   urlPattern: string;

   /** A schema for the columns; see [[ColSpec]] for details.
    *  The first [[ColSpec]] in the array must be named "id" and contain
    *  a stable identifier for the row, e.g. a server-provided ID.
    *  (todo: write more about what to do if that's not available.)
    */
    colSpecs: Array<ColSpec>;

    /** Return an array of data rows */
    getDataRows(): Array<DataRow>;

  /** React to live changes in the page and trigger data reloads.
   *
   * Wildcard has some default behavior to react to changes in the page,
   * but it doesn't handle all cases.
   *
   * In this function you can add site-specific handlers
   * (e.g. listening for click events) which listen for relevant changes.
   * When a change occurs, call the `reload` callback, which will reload data
   * from the page.
   *
   * If the adapter doesn't need to react to live changes, this can be omitted.
   */
   setupReloadTriggers?(reload: any): any;

  /** Return element containing the rows.
   * If not provided, default container is the parent element of the first row,
   * which often works fine.
   */
   getRowContainer?(): HTMLElement;
 }

/** The main method for creating a Wildcard site adapter.
*  In your adapter, call this with a valid [[SiteAdapterOptions]] object
*  to initialize your adapter.
*/
const createTable = (options: SiteAdapterOptions) => {
  let rowContainer;
  let rows : Array<DataRow>;
  let rowsById : { [key: string]: DataRow };
  let tableData : Array<{ [key: string]: string }>

  // Extracts data from the page, mutates rows and tableData variables.
  // todo: move this function out of createTable, stop mutating state
  let loadData = () => {
    rows = options.getDataRows()

    if (options.hasOwnProperty("getRowContainer")) {
      rowContainer = options.getRowContainer()
    } else {
      rowContainer = rows[0].el.parentElement
    }

    tableData = rows.map(r => {
      return _.mapValues(r.dataValues, value => {
        if (value instanceof HTMLInputElement) {
          return value.value
        } else if (value instanceof HTMLElement) {
          return value.textContent
        } else {
          return value
        }
      })
    })

    rowsById = _.keyBy(rows, row => row.dataValues.id)
    console.log("loaded data", tableData)
  }

  loadData()

  let columns: Array<any> = options.colSpecs.map(col => ({
    data: col.name,
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
    name: col.name
  }))

  // create container div
  let newDiv = htmlToElement("<div id=\"wildcard-container\" style=\"\"><div id=\"wildcard-table\"></div></div>") as HTMLElement
  if (rows.length == 1) { newDiv.classList.add("single-row") }
    document.body.appendChild(newDiv);
  var container = document.getElementById('wildcard-table');

  var hot = new Handsontable(container, {
    data: tableData,
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
     /* afterChange: (changes) => {
       if (changes) {
         changes.forEach(([row, prop, oldValue, newValue]) => {
           let colSpec = colSpecFromProp(prop, options)
           if (!colSpec || colSpec.readOnly) {
             return
           }

           let rowEl = rows[row] // this won't work with re-sorting; change to ID
           let el = colSpec.el(rowEl)
           el.value = newValue
         });
       }
     }, */
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
    let oldData = tableData
    loadData() // mutates data
    tableData = oldData.map((row, index) => _.merge(row, tableData[index]))
    hot.loadData(tableData)
  }

  // set up handlers to try to catch any changes that happen
  // we look for input events on rows, and also monitor DOM of row container
  // should this all move out to "setup reload triggers"?
  let reloadTriggers = ["input", "click", "change", "keyup"]
  rows.forEach((row, idx) => {
    reloadTriggers.forEach(eType => {
      row.el.addEventListener(eType, e => reloadData)
    })
  })

  // set up page-specific reload triggers
  if (options.hasOwnProperty("setupReloadTriggers")) {
    options.setupReloadTriggers(reloadData)
  }

  // Highlight the selected row or cell in the original page.
  // This is important for establishing a clear mapping between page and table.
  // Probably need to provide a lot more site-specific config, including:
  // * whether to highlight just cells or whole row
  // * colors
  // * borders vs background
  Handsontable.hooks.add('afterSelectionByProp', (rowIndex, prop) => {
    const highlightColor = "#c9ebff"
    const unhighlightColor = "#ffffff"

    let colSpec = colSpecFromProp(prop, options)
    if (!colSpec) { return; }

    let row = rowsById[hot.getDataAtCell(rowIndex, 0)]

    if (rows.length > 1) {
      // For multiple rows, we highlight the whole row

      // rowEl.style["background-color"] = highlightColor
      row.el.style["border"] = `solid 2px ${highlightColor}`
      row.el.scrollIntoView({ behavior: "smooth", block: "center" })

      // Clear highlight on other divs
      let otherDivs = rows.filter(r => r !== row).map(r => r.el)
      // otherDivs.forEach( d => d.style["background-color"] = unhighlightColor )
      otherDivs.forEach(d => d.style["border"] = `none`)
    } else {
      // For a single row, we highlight individual cells in the row
      // (temporarily disabled while we refactor)

      // Add a border and scroll selected div into view
      // colEl.style["background-color"] = highlightColor
      // colEl.scrollIntoView({ behavior: "smooth", block: "center" })

      // // Clear border on other divs
      // let otherDivs = options.colSpecs
      // .filter(spec => spec !== colSpecFromProp(prop, options))
      // .map(spec => spec.el(rowEl))

      // otherDivs.forEach(d => d.style["background-color"] = unhighlightColor)
    }
  }, hot)

  let hooks = ["afterColumnSort" as const, "afterFilter" as const]
  hooks.forEach(hook => {
    Handsontable.hooks.add(hook, () => {
      let ids = hot.getDataAtCol(0)
      rowContainer.innerHTML = ""
      ids.forEach(id => {
        if (rowsById[id]) {
          rowContainer.appendChild(rowsById[id].el)
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
