// // This file contains all the main framework logic.
// // Pretty soon it should probably be split into smaller parts.

// 'use strict';

// import React from "react";
// import ReactDOM from "react-dom";

// import { Hello } from "./components/Hello";

// import Handsontable from "handsontable";
// import { FormulaEditor } from "./cell_editors/formulaEditor";

// import "./wildcard.css";

// import { extractNumber } from "./utils"
// import { formulaParse } from "./formula"

// import _ from "lodash";

// // convert HTML to a dom element
// function htmlToElement(html):HTMLElement {
//   var template = document.createElement('template');
//   html = html.trim(); // Never return a text node of whitespace as the result
//   template.innerHTML = html;
//   return template.content.firstChild as HTMLElement;
// }

// function createToggleButton(container) {
//   // set up button to open the table
//   let toggleBtn = htmlToElement(`<button class='wildcard-table-toggle table-open'>↓ Close Wildcard</button>`)
//   toggleBtn.addEventListener('click', () => {
//     if (container.style.visibility === "hidden") {
//       container.style.visibility = "visible"
//       toggleBtn.innerText = "↓ Close Wildcard"
//       toggleBtn.classList.add("table-open")
//     }
//     else {
//       container.style.visibility = "hidden"
//       toggleBtn.innerText = "↑ Open Wildcard"
//       toggleBtn.classList.remove("table-open")
//     }
//   })
//   document.body.appendChild(toggleBtn)
// }



// /**
// * Defines the schema for one column of the table being extracted.
// */
// interface ColSpec {
//   /** The name of this data column, to be displayed in the table */
//   name: string;

//   /** The type of this column. Can be any
//   * [Handsontable cell type](https://handsontable.com/docs/7.3.0/tutorial-cell-types.html).
//   * Examples: text, numeric, date, checkbox. */
//   type: string;

//   /** Allow user to edit this value? Defaults to false.
//   *  Making a column editable requires extracting [[PageValue]]s as Elements.*/
//   editable?: boolean;

//   /** Specify a custom [Handsontable editor](https://handsontable.com/docs/7.3.0/tutorial-cell-editor.html)
//   * as a class (see Expedia adapter for an example) */
//   editor?: string;

//   /** Specify a custom [Handsontable rendererr](https://handsontable.com/docs/7.3.0/demo-custom-renderers.html)
//   * as a class (todo: not actually supported yet, but will be soon ) */
//   renderer?: string;

//   /** Hide this column in the visible table?
//   Eg, useful for hiding an ID column that's needed for sorting */
//   hidden?: boolean;

//   /** Is this a formula column? */
//   formula?: boolean;

//   /** Is this a column added by the user to the table? */
//   userCol?: boolean;

//   /** If a user column, should it display in the page? */
//   showUserCol?: boolean;
// }

// type DataValue = string | number | boolean

// // Todo:
// // There are checks in the code for whether a PageValue is an element;
// // e.g. for updating values in the page or for highlighting values in the page.
// // A more principled way would be to use tagged unions and "pattern match".
// // (although it's a bit annoying that we have to manually add tags in our
// // runtime data to get this to work...)
// // More info here: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions

// /** A data value extracted from the page.
// *   There are two options for specifying a value:
// *
// *   * Element: You can specify a DOM element and Wildcard will extract its
// *     contents. If the column is writable, Wildcard will also replace the
// *     contents of the DOM element when the value is edited in the table.
// *   * [[DataValue]] You can run arbitrary code (e.g. regexes) to
// *     extract a value from the DOM and show it in the table.
// *     **Not compatible with editable columns.**
// *     Note on types: the data type specified in the colSpec will ultimately
// *     determine how the value gets displayed.
// */
// type PageValue = Element | DataValue

// /** A data structure representing a row of data from the page.
// *   Must specify both an HTML element and an object containing data values.
// *   (The HTML element is used for things like highlighting and sorting rows.)
// */
// interface DataRow {
//   /** The element(s) representing the row */
//   // todo: use the full tagged union style here, rather than bare sum type,
//   // to get exhaustiveness checking everywhere
//   els: Array<HTMLElement>;

//   /** A stable ID for the row */
//   id: any;

//   /** The data values for the row, with column names as keys */
//   dataValues: { [key: string]: PageValue };

//   /** A container for adding user annotations */
//   annotationContainer?: HTMLElement;

//   /** The actual div for storing annotations in.
//    *  Maintained internally by the framework, no need to set in the site adapter
//   */
//   annotationTarget?: HTMLElement

//   /** An HTML template for storing an annotation on this row.
//    *  should include "$annotation", which will be replaced by annotation text
//    */
//   annotationTemplate?: string;
// }

// /** A site adapter describes how to extract data from a specific website.
// *   See examples of existing adapters in `src/site_adapters`.
// *
// *   To create a new site adapter, copy an existing site adapter file, e.g.
// *   `src/site_adapters/airbnb.ts`, and mimic the format of that file.
// *   Use these docs below for more info on the various settings.
// *
// *   To activate your adapter, register it in `src/wildcard.ts`:
// *
// *   ```
// *   import { AirbnbAdapter } from './site_adapters/airbnb';
// *
// *   const siteAdapters = [
// *   //...
// *   AirbnbAdapter
// *   //...
// *   ]
// *   ```
// *
// *  You'll probably find it helpful to register the adapter first, and then
// *  you can insert console log statements in your getDataRows() function to
// *  start debugging your data extraction.
// */
// interface SiteAdapterOptions {
//   /** A user visible name for the adapter */
//   name: string;

//   // todo: bring back a short form of enable that just specifies URLs?
//   /** Returns true if the adapter should run on this page.
//   *   Should be as fast as possible; usually a URL substring check is enough.
//   *   If needed, can perform arbitrary checks on the page as well.
//   */
//   enable():boolean;

//   /** A schema for the columns; see [[ColSpec]] for details.
//   *  The first [[ColSpec]] in the array must be named "id" and contain
//   *  a stable identifier for the row, e.g. a server-provided ID.
//   *  (todo: write more about what to do if that's not available.)
//   */
//   colSpecs: Array<ColSpec>;

//   /** Return the extracted data from the page. See [[DataRow]] for details. */
//   getDataRows(): Array<DataRow>;

//   /** React to live changes in the page and trigger data reloads.
//   *
//   * Wildcard has some default behavior to react to changes in the page,
//   * but it doesn't handle all cases.
//   *
//   * In this function you can add site-specific handlers
//   * (e.g. listening for click events) which listen for relevant changes.
//   * When a change occurs, call the `reload` callback, which will reload data
//   * from the page.
//   *
//   * If the adapter doesn't need to react to live changes, this can be omitted.
//   */
//   setupReloadTriggers?(reload: any): any;

//   /** Return element containing the rows.
//   * If not provided, default container is the parent element of the first row,
//   * which often works fine.
//   */
//   getRowContainer?(): HTMLElement;

//   /** Does this site adapter deal with iframes?
//       (Enables special handling of certain HTML elements, which doesn't
//        work well on all sites) */
//   iframe?: boolean;
// }

// /** The main method for creating a Wildcard site adapter.
// *  In your adapter, call this with a valid [[SiteAdapterOptions]] object
// *  to initialize your adapter.
// */
// const createTable = (options: SiteAdapterOptions) => {
//   let rowContainer;
//   let rows : Array<DataRow>;
//   let rowsById : { [key: string]: DataRow };
//   let tableData : Array<{ [key: string]: string }>
//   let sortConfig;
//   let filters;
//   let storedColumns = {};
//   let hot;
//   let colDependencies = {};

//   // given a key for some data to store,
//   // return a globally qualified key scoped by adapter
//   let storageKey = (key) => {
//     return ["wildcard", options.name, key].join(":")
//   }

//   /**
//    * This checks the typing of a variable. We use this instead of instanceof in order to accomodate iframes, where
//    * the instanceof check fails. https://stackoverflow.com/questions/52222237/instanceof-fails-in-iframe
//    * @param element type to be tested against
//    * @param newValue value whose type is being tested
//    */
//   let isTypeOf = (element, newValue) => {
//     if (!options.iframe) return newValue instanceof element;

//     if(newValue) {
//       if (element === HTMLElement) {
//         return isHTMLElement(newValue);
//       } else if (element === HTMLInputElement){ //adjustment for ubereats
//         return isHTMLElement(newValue);
//       } else {
//         return newValue instanceof element || (newValue.__proto___ && (newValue.__proto__).toString() === element.toString());
//       }
//     }
//     return false;
//   };

//   let isHTMLElement = (el) => {
//     return el instanceof HTMLElement || (el.__proto__.toString().includes("HTML") && el.__proto__.toString().includes("Element"));
//   };

//   let getDataRows = () => {
//     rows = options.getDataRows()

//   }

//   let colSpecFromProp = (prop) => {
//     return options.colSpecs.find(spec => spec.name == prop)
//   }

//   // Touch all the cells in a column, triggering afterChange callbacks
//   // todo: I think this can be optimized a lot for formula columns, seems slow
//   let resetColumn = (prop) => {
//     let currentData = hot.getDataAtProp(prop)
//     hot.setDataAtRowProp(currentData.map((val, idx) => [idx, prop, val]))
//   }

//   // There's no way to add columns in the UI yet,
//   // so provide a few columns as scratch space
//   options.colSpecs.push(
//     { name: "user1", type: "text", editable: true, editor: FormulaEditor, userCol: true },
//     { name: "user2", type: "text", editable: true, editor: FormulaEditor, userCol: true },
//     { name: "user3", type: "text", editable: true, editor: FormulaEditor, userCol: true },
//     { name: "user4", type: "text", editable: true, editor: FormulaEditor, userCol: true },
//     { name: "user5", type: "text", editable: true, editor: FormulaEditor, userCol: true },
//   )

//   // Extracts data from the page, mutates rows and tableData variables.
//   // todo: move this function out of createTable, stop mutating state
//   let loadData = () => {

//     rows = options.getDataRows()

//     // If data wasn't loaded, exit this function early
//     if (!rows || rows.length === 0) {
//       return
//     }

//     if (options.hasOwnProperty("getRowContainer")) {
//       rowContainer = options.getRowContainer()
//     } else if (rows.length > 0) {
//       rowContainer = rows[0].els[0].parentElement
//     }

//     rows.forEach(row => {
//       if (row.annotationContainer && row.annotationTarget) {
//         row.annotationTarget =
//           htmlToElement("<span class='user-annotations'></span>")
//         row.annotationContainer.appendChild(row.annotationTarget)
//       }
//     })

//     tableData = rows.map(r => {
//       let data =  _.mapValues(r.dataValues, (value, propName) => {
//         let result;


//         // Type convert data automatically
//         // todo: extract this into a more generic type conversion framework
//         let spec = options.colSpecs.find(spec => spec.name === propName);

//         let isHTML = false;
//         if (spec && spec.renderer && spec.renderer.toLowerCase() === "html") {
//           isHTML = true;
//         }

//         // Extract data from HTML elements
//         if (isTypeOf(HTMLInputElement, value) || isTypeOf(HTMLTextAreaElement, value)) {
//           result = value.value;
//         } else if (isHTML && isTypeOf(HTMLElement, value)) {
//           result = value.innerHTML;
//         } else if (isTypeOf(HTMLElement, value)) {
//           result = value.textContent;
//         } else {
//           result = value;
//         }

//         if (spec && spec.type === "numeric" && (typeof result === "string")) {
//           result = extractNumber(result)
//         }

//         return result
//       })

//       data.id = r.id

//       return data
//     })

//     rowsById = _.keyBy(rows, row => row.id)
//   }

//   loadData()

//   // If data wasn't loaded, schedule a retry in 1 second
//   if (!rows || rows.length === 0) {
//     setTimeout(() => { createTable(options) }, 1000)
//     return
//   }

//   let columns: Array<any> = options.colSpecs.map(col => ({
//     data: col.name,
//     readOnly: !col.editable,
//     type: col.type,
//     dateFormat: "MM/DD/YYYY",
//     datePickerConfig: {
//       events: ['Sun Dec 15 2019', 'Sat Dec 07 2019'], //todo: move this out of the core plugin
//       firstDay: 1,
//       numberOfMonths: 3
//     },
//     editor: col.editor,
//     renderer: col.renderer,
//     hidden: col.hidden,
//     name: col.name,
//     user: col.userCol
//   }))

//   // create container div
//   let newDiv = htmlToElement("<div id='wildcard-container'><div id='react-container'></div></div>") as HTMLElement
//   // add space at bottom of page so table doesn't cover up content
//   document.querySelector("body").style["padding-bottom"] = "300px"

//   if (rows.length == 1) { newDiv.classList.add("single-row") }
//     document.body.appendChild(newDiv);
//   var container = document.getElementById('wildcard-table');

//   const newData = [
//     { id: 1, text: "hello" },
//     { id: 2, text: "world" },
//   ];
//   ReactDOM.render(
//       <Hello tableData={newData}/>,
//       document.getElementById("react-container")
//   );

//   // Initialize the table
//   hot = new Handsontable(container, {
//     data: tableData,
//     rowHeaders: true,
//     colHeaders: columns.map(col => col.name),
//     // formulas: true,
//     stretchH: 'none',
//     dropdownMenu: {
//       "items": {
//         "showInPage": {
//           name: "Show column in page",
//           hidden: function () {
//             let prop = this.colToProp(this.getSelectedLast()[1])
//             let colSpec = colSpecFromProp(prop)

//             return (!colSpec.userCol || colSpec.showUserCol)
//           },
//           callback: function(key, selection, clickEvent) {
//             let prop = this.colToProp(this.getSelectedLast()[1])
//             let colSpec = colSpecFromProp(prop)
//             colSpec.showUserCol = true
//             resetColumn(prop)
//           }
//         },
//         "hideInPage": {
//           name: "Hide column in page",
//           hidden: function () {
//             let prop = this.colToProp(this.getSelectedLast()[1])
//             let colSpec = colSpecFromProp(prop)

//             return (!colSpec.userCol || !colSpec.showUserCol)
//           },
//           callback: function(key, selection, clickEvent) {
//             let prop = this.colToProp(this.getSelectedLast()[1])
//             let colSpec = colSpecFromProp(prop)
//             colSpec.showUserCol = false
//             resetColumn(prop)
//           }
//         },
//         "---------": {},
//         "filter_by_condition": {},
//         "filter_operators": {},
//         "filter_by_value": {},
//         "filter_action_bar": {},
//       }
//     },
//     filters: true,
//     columnSorting: true,
//     columns: columns,
//     hiddenColumns: {
//       columns: columns.map((col, idx) => col.hidden ? idx : null).filter(e => Number.isInteger(e))
//     },
//     licenseKey: 'non-commercial-and-evaluation'
//   });

//   const filtersPlugin = hot.getPlugin('filters')

//   // Restore data from local storage: sort order, filters, and stored columns
//   chrome.storage.local.get([storageKey("sortConfig"), storageKey("filters"), storageKey("columns")], function(result) {
//     if (result[storageKey("columns")]) {
//       storedColumns = result[storageKey("columns")]
//       _.each(storedColumns, (col, name) => {
//         if(col.colSpec.formula) {
//           // todo: handle missing column -- need to add it to the table here
//           hot.setDataAtRowProp(0, name, col.formula)
//         }
//       })
//     }

//     // Wait a bit for stored columns to populate before loading sort and filters
//     // TODO: find a less hacky way to do this.
//     // Can we find a way to get a callback in for when the
//     window.setTimeout(() => {
//       if (result[storageKey("sortConfig")]) {
//         sortConfig = result[storageKey("sortConfig")]
//         hot.getPlugin('columnSorting').sort(sortConfig);
//       }

//       if (result[storageKey("filters")]) {
//         filters = result[storageKey("filters")]
//         filtersPlugin.clearConditions()
//         filters.forEach(filter => {
//           filter.conditions.forEach(condition => {
//             filtersPlugin.addCondition(
//               filter.column, condition.name, condition.args, filter.operation
//             )
//           })
//         })
//         filtersPlugin.filter()
//       }
//     }, 100)
//   });

//   createToggleButton(newDiv);

//   // ===
//   // Set up triggers for data reloading when the page changes
//   // ===

//   // reload data from page:
//   // re-extract, and then load into the spreadsheet
//   // TODO: unify this more cleanly with loadData;
//   // this works this way right now because Handsontable requires
//   // loading the data differently the first time it's initialized
//   // vs. subsequent updates
//   let reloadData = () => {
//     let oldData = tableData
//     loadData() // mutates data
//     // tableData = oldData.map((row, index) => _.merge(row, tableData[index]))
//     hot.loadData(tableData)

//     // todo: re-sort and filter here as well?
//   }

//   // set up handlers to try to catch any changes that happen
//   // we look for input events on rows, and also monitor DOM of row container
//   // should this all move out to "setup reload triggers"?
//   let reloadTriggers = ["input", "click", "change", "keyup"]
//   rows.forEach((row, idx) => {
//     reloadTriggers.forEach(eType => {
//       row.els.forEach(el => {
//         el.addEventListener(eType, e => reloadData)
//       })
//     })
//   })

//   // set up page-specific reload triggers
//   if (options.hasOwnProperty("setupReloadTriggers")) {
//     options.setupReloadTriggers(reloadData)
//   }

//   // ===
//   // Add hooks to the Handsontable to handle various interactions
//   // ===

//   // Handle a formula entered into a cell
//   let handleFormula = (formula:string, rowIndex:number, prop:string, propagate:boolean) => {
//     let colSpec = colSpecFromProp(prop)

//     if (formula === "") {
//       formula = null
//     }

//     if (formula === null) {
//       // A special case: entered an empty value into a formula column
//       // This represents "delete this formula from this column"
//       hot.setCellMeta(rowIndex, hot.propToCol(prop), "formula", null)
//     } else {
//       let rowData = tableData.find(row => row.id === hot.getDataAtRowProp(rowIndex, "id"))

//       // Eval the formula, with the data from the row as context
//       formulaParse(formula).eval(rowData).then(result => {
//         hot.setDataAtRowProp(rowIndex, prop as string, result, "formulaEval")
//         hot.setCellMeta(rowIndex, hot.propToCol(prop), "formula", formula)
//       })
//     }

//     // If this is a direct formula edit, do further stuff
//     // (If it's just the result of propagating a formula to the other
//     // cells in the column, don't need to do this stuff)
//     if (propagate) {
//       if (formula !== null) {
//         // Update dependencies tracking
//         // todo: handle GCing dependencies when formula deleted --
//         // a better way to do it would be to separate out of handleFormula
//         formulaParse(formula).colrefs().forEach(ref => {
//           if (!colDependencies.hasOwnProperty(ref)) {
//             colDependencies[ref] = []
//           }

//           // If this column A references another column B in the formula,
//           // register that when B is updated we need to update A
//           if (colDependencies[ref].indexOf(ref) === -1) {
//             colDependencies[ref].push(prop)
//           }
//         })
//       }

//       // Store formula column in local storage
//       storedColumns[prop] = {
//         colSpec: colSpec,
//         formula: formula
//       }

//       let dataToStore = {}
//       dataToStore[storageKey("columns")] = storedColumns
//       chrome.storage.local.set(dataToStore)

//       // Clear any filters on this column when we start editing its formula
//       filtersPlugin.removeConditions(hot.propToCol(prop))
//       filtersPlugin.filter()

//       // Copy the formula to the whole column
//       tableData.forEach((row, i) => {
//         row[prop] = formula

//         // if the row is in the table, update the table too
//         let idxInTable = hot.getDataAtCol(hot.propToCol("id")).indexOf(row.id)

//         // TODO:
//         // Handsontable supports a bulk version of setDataAtRowProp
//         // which should be faster than doing it one by one like this.
//         if (idxInTable !== -1) {
//           // The source param here prevents afterchange from doing further propagation
//           hot.setDataAtRowProp(idxInTable, prop, formula, "formulaPropagate")
//           hot.setCellMeta(idxInTable, hot.propToCol(prop), "formula", formula)
//         }
//       })
//     }
//   }

//   // When a cell changes, 1) evaluate formulas, 2) update the DOM
//   // TODO:
//   // Here we directly update the DOM when table values are updated.
//   // In the future, consider a different approach:
//   // 1) Make edits to our representation of the table data
//   // 2) Use a lens "put" function to propagate the update to the DOM
//   Handsontable.hooks.add('afterChange', (changes, source) => {
//     if (changes) {
//       changes.forEach(([rowIndex, prop, oldValue, newValue]) => {
//         let colSpec = colSpecFromProp(prop)

//         let rawFormula = (typeof newValue === "string" && newValue[0] === "=")
//         let empty = (newValue === "" || newValue === null)
//         // If user enters a row formula, it sets this column to be a formula col
//         if (colSpec.userCol && rawFormula) {
//           colSpec.formula = true
//         }
//         // Evaluate a formula in two cases:
//         // 1) it's a raw unevaluated formula
//         // 2) it's an empty cell, so we need to process a "delete formula"
//         if (colSpec.formula && (rawFormula || empty)) {
//           let propagate = (source === "edit")
//           handleFormula(newValue, rowIndex, prop as string, propagate)
//         }

//         // if the edit came from a formula eval, recalc downstream dependencies
//         if (source as string === "formulaEval" && colDependencies.hasOwnProperty(prop)) {
//           colDependencies[prop].forEach(propToUpdate => {
//             let formula = hot.getCellMeta(rowIndex, hot.propToCol(propToUpdate)).formula

//             // It should look like a "formula propagation" update,
//             // so that it doesn't trigger updates on the whole column
//             hot.setDataAtRowProp(rowIndex, propToUpdate, formula, "formulaPropagate")
//           })
//         }

//         // update the DOM
//         if (!colSpec.editable) { return }

//         // Update user-added columns for this row
//         let row = rows.find(row => row.id === hot.getDataAtRowProp(rowIndex, "id"))
//         let columnsToShow = options.colSpecs.filter(spec => spec.userCol && spec.showUserCol)
//         let values = columnsToShow.map(spec => hot.getDataAtRowProp(rowIndex, spec.name)).filter(v => v)

//         if (row.annotationTarget) {
//           let annotationsHTML = values.map(value => row.annotationTemplate.replace("$annotation", value))
//           row.annotationTarget.innerHTML = annotationsHTML.join(" ")
//         }

//         // Update direct site values
//         if (!colSpec.userCol) {
//           // Update data directly from the original site
//           let rowData = rows.find(row => row.id === hot.getDataAtRowProp(rowIndex, "id"))
//           let el:any = rowData.dataValues[prop]

//           if (isTypeOf(HTMLInputElement, el) || isTypeOf(HTMLTextAreaElement, el)) {
//             //@ts-ignore
//             el.value = newValue;
//           } else if (colSpec.renderer && colSpec.renderer.toLowerCase() === 'html' && isTypeOf(HTMLElement, el)){
//             //@ts-ignore
//             el.innerHTML = newValue;
//           } else if (isTypeOf(HTMLElement, el)) {
//             //@ts-ignore
//             el.innerText = newValue
//           }
//         }
//       });
//     }
//   }, hot)

//   // Highlight the selected row or cell in the original page.
//   // This is important for establishing a clear mapping between page and table.
//   // Probably need to provide a lot more site-specific config, including:
//   // * whether to highlight just cells or whole row
//   // * colors
//   // * borders vs background
//   Handsontable.hooks.add('afterSelectionByProp', (rowIndex, prop) => {
//     const highlightColor = "#c9ebff"
//     const unhighlightColor = "#ffffff"

//     let colSpec = colSpecFromProp(prop)
//     if (!colSpec) { return; }

//     let row = rowsById[hot.getDataAtCell(rowIndex, 0)]

//     if (rows.length > 1) {
//       // For multiple rows, we highlight the whole row
//       row.els.forEach(el => {
//         if (el.style) {
//           el.style["border"] = `solid 2px ${highlightColor}`
//         }
//       })
//       row.els[0].scrollIntoView({ behavior: "smooth", block: "center" })

//       // Clear highlight on other divs
//       _.flatten(rows.filter(r => r !== row).map(r => r.els)).forEach(el => {
//         if(el.style) {
//           el.style["border"] = `none`
//         }
//       })
//     } else {
//       // For a single row, we highlight individual cells in the row

//       let colEl = row.dataValues[prop]
//       if (!(colEl instanceof HTMLElement)) { return }

//         // Add a border and scroll selected div into view
//       colEl.style["background-color"] = highlightColor
//       colEl.scrollIntoView({ behavior: "smooth", block: "center" })

//       // Clear border on other column elements
//       let otherDivs = options.colSpecs
//       .filter(spec => spec !== colSpecFromProp(prop))
//       .map(spec => row.dataValues[spec.name])

//       otherDivs.forEach(d => {
//         if (d instanceof HTMLElement) {
//           d.style["background-color"] = unhighlightColor
//         }
//       })
//     }
//   }, hot)

//   Handsontable.hooks.add("afterColumnSort" as const, (_, sortConfig) => {
//     // Set rows in page to be the rows in the table
//     // TODO: remove duplication, turn this into a lens PUT?
//     let ids = hot.getDataAtCol(0)
//     rowContainer.innerHTML = ""
//     ids.forEach(id => {
//       let row = rowsById[id]
//       if (!row) { return }
//       row.els.forEach(el => {
//         rowContainer.appendChild(el)
//       })
//     })

//     // Store sort order in local storage
//     let dataToStore = {}
//     dataToStore[storageKey("sortConfig")] = sortConfig
//     chrome.storage.local.set(dataToStore)
//   })

//   Handsontable.hooks.add("afterFilter" as const, (filters) => {
//     // Set rows in page to be the rows in the table
//     // TODO: remove duplication, turn this into a lens PUT?
//     let ids = hot.getDataAtCol(0)
//     rowContainer.innerHTML = ""
//     ids.forEach(id => {
//       let row = rowsById[id]
//       if (!row) { return }
//       row.els.forEach(el => {
//         rowContainer.appendChild(el)
//       })
//     })

//     // Store filters in local storage
//     let dataToStore = {}
//     dataToStore[storageKey("filters")] = filters
//     chrome.storage.local.set(dataToStore)

//     // when we unfilter, there may be a column that contains some unevaluated
//     // formula cells. in this case, just refresh the whole column
//     // todo: find a more principled way to handle this...
//     options.colSpecs.forEach(spec => {
//       if (spec.formula) {
//         let prop = spec.name
//         hot.getDataAtProp(prop).forEach((val, rowIndex) => {
//           if (typeof val === "string" && val[0] === "=") {
//             handleFormula(val, rowIndex, prop, false)
//           }
//         })
//       }
//     })
//   })

//   return {
//     hot: hot,
//     columns: columns
//   }
// }

// export { createTable }
