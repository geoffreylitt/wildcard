'use strict';

import { createTable } from './wildcard';
import Handsontable from "handsontable";

let {hot, columns} = createTable({
  getRowContainer: () => document.querySelector('.todo-list'),
  getDataRows: () => Array.from(document.querySelectorAll('.todo-list li')),
  colSpecs: [
    {
      fieldName: "id",
      el: (row) => row,
      getValue: (cell) => cell.attributes["data-id"].value,
      readOnly: true,
      type: "text",
      hidden: true
    },
    {
      fieldName: "text",
      readOnly: true,
      type: "text",
      hidden: false,
      el: (row) => row.querySelector(".view label")
    },
    {
      fieldName: "completed",
      readOnly: true,
      type: "checkbox",
      hidden: false,
      // having el in here makes increasingly less sense...
      // it's only needed when highlighting columns for single row tables
      // maybe make it optional and drop it usually in favor of value?
      el: (row) => row.querySelector("input.toggle"),
      getValue: (cell) => {
        return (cell as HTMLInputElement).checked
      }
    }
  ],
  setupReloadTriggers: () => {}
})


hot.updateSettings({
  contextMenu: {
    callback: function (key, selection, clickEvent) {
    },
    items: {
      "col-right": {
        name: "Add column",
        submenu: {
          items: [
            {
              key: "col-right:date",
              name: "Date",
              callback: (function() {
                columns.push({ data: "extraDate", readOnly: false, type: "date", dateFormat: "MM/DD/YYYY", });
                hot.updateSettings({ columns: columns })
              }),
            },
            {
              key: "col-right:text",
              name: "Text",
              callback: (function() {
                columns.push({ data: "extraText", readOnly: false, type: "text" });
                hot.updateSettings({ columns: columns })
              }),
            },
            {
              key: "col-right:formula",
              name: "formula",
              callback: (function() {
                columns.push({ data: "extraFormula", readOnly: false });
                hot.updateSettings({ columns: columns })
              }),
            }
          ]
        }
        
      }
    }
  }
})

function colIndex(prop) {
  return columns.findIndex(e => e.data === prop)
}

// a shallow hacky implementation of a snooze formula
Handsontable.hooks.add("afterChange", (changes) => {
  if (changes) {
    changes.forEach(change => {
      let [changedRow, prop, _, val] = change
      if (prop === "extraFormula") {
        // hacky formula evaluation
        // if a formula is entered in any cell, evaluate it for all cells
        if (typeof val !== "string") { return; }

        if (val.match(/=NOW()/)) {
          hot.getDataAtProp("extraFormula").forEach((_, rowIndex) => {
            hot.setDataAtCell(rowIndex, colIndex("extraFormula"), new Date())
          })
        } else if (val.match(/=D < NOW()/)) {
          hot.getDataAtProp("extraFormula").forEach((_, rowIndex) => {
            let snoozeDate = new Date(hot.getDataAtCell(rowIndex, colIndex("extraDate")))
            let show = snoozeDate < new Date()
            console.log("snoozeDate", snoozeDate, "show", show)
            hot.setDataAtCell(rowIndex, colIndex("extraFormula"), show)
          })
        }
      }

      if (prop === "extraDate") {
        hot.getDataAtProp("extraFormula").forEach((val, rowIndex) => {
          if (!val) { return; }
          let snoozeDate = new Date(hot.getDataAtCell(rowIndex, colIndex("extraDate")))
          let show = snoozeDate < new Date()
          console.log("snoozeDate", snoozeDate, "show", show)
          hot.setDataAtCell(rowIndex, colIndex("extraFormula"), show)
        }) 
      }
    })
  }
}, hot)