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

function colSpecFromProp(prop, options : SiteAdapterOptions) {
  return options.colSpecs.find(spec => spec.name == prop)
}

/**
* Defines the schema for one column of the table being extracted.
*/
interface ColSpec {
  /** The name of this data column, to be displayed in the table */
  name: string;

  /** The type of this column. Can be any
  * [Handsontable cell type](https://handsontable.com/docs/7.3.0/tutorial-cell-types.html).
  * Examples: text, numeric, date, checkbox. */
  type: string;

  /** Allow user to edit this value? Defaults to false.
  *  Making a column editable requires extracting [[PageValue]]s as Elements.*/
  editable?: boolean;

  /** Specify a custom [Handsontable editor](https://handsontable.com/docs/7.3.0/tutorial-cell-editor.html)
  * as a class (see Expedia adapter for an example) */
  editor?: string;

  /** Specify a custom [Handsontable rendererr](https://handsontable.com/docs/7.3.0/demo-custom-renderers.html)
  * as a class (todo: not actually supported yet, but will be soon ) */
  renderer?: string;

  /** Hide this column in the visible table?
  Eg, useful for hiding an ID column that's needed for sorting */
  hidden?: boolean;
}

type DataValue = string | number

// Todo:
// There are checks in the code for whether a PageValue is an element;
// e.g. for updating values in the page or for highlighting values in the page.
// A more principled way would be to use tagged unions and "pattern match".
// (although it's a bit annoying that we have to manually add tags in our
// runtime data to get this to work...)
// More info here: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions

/** A data value extracted from the page.
*   There are two options for specifying a value:
*
*   * Element: You can specify a DOM element and Wildcard will extract its
*     contents. If the column is writable, Wildcard will also replace the
*     contents of the DOM element when the value is edited in the table.
*   * [[DataValue]] You can run arbitrary code (e.g. regexes) to
*     extract a value from the DOM and show it in the table.
*     **Not compatible with editable columns.**
*     Note on types: the data type specified in the colSpec will ultimately
*     determine how the value gets displayed.
*/
type PageValue = Element | DataValue

interface DataRow {
  /** The element representing the row */
  el: HTMLElement;

  /** The data values for the row, with column names as keys */
  dataValues: { [key: string]: PageValue }
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
    readOnly: !col.editable,
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

    // TODO:
    // Here we directly update the DOM when table values are updated.
    // In the future, consider a different approach:
    // 1) Make edits to our representation of the table data
    // 2) Use a lens "put" function to propagate the update to the DOM
    afterChange: (changes) => {
      if (changes) {
        changes.forEach(([rowIndex, prop, oldValue, newValue]) => {
          let colSpec = colSpecFromProp(prop, options)
          if (!colSpec || !colSpec.editable) {
            return
          }

          let row = rows[rowIndex] // this won't work with re-sorting; change to ID
          let el = row.dataValues[prop]

          if (el instanceof HTMLInputElement) {
            el.value = newValue
          } else if (el instanceof HTMLElement) {
            el.innerText = newValue
          }
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

      let colEl = row.dataValues[prop]
      if (!(colEl instanceof HTMLElement)) { return }

        // Add a border and scroll selected div into view
      colEl.style["background-color"] = highlightColor
      colEl.scrollIntoView({ behavior: "smooth", block: "center" })

      // Clear border on other column elements
      let otherDivs = options.colSpecs
      .filter(spec => spec !== colSpecFromProp(prop, options))
      .map(spec => row.dataValues[spec.name])

      otherDivs.forEach(d => {
        if (d instanceof HTMLElement) {
          d.style["background-color"] = unhighlightColor
        }
      })
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
