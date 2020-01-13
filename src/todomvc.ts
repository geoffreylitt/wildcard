'use strict';

import { createTable } from './wildcard';

createTable({
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