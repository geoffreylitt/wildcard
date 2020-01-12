'use strict';

import { createTable } from './wildcard';

// Obscure class names for various page elements.
// They have remained stable for several months,
// so actually seem unlikely to change regularly.
const rowContainerClass = "_fhph4u"
const rowClass = "_8ssblpx"
const titleClass = "_1ebt2xej"
const priceClass = "_1p7iugi"
const ratingClass = "_ky9opu0"
const listingLinkClass = "_i24ijs"

createTable({
  // Find the container div surrounding the data rows
  getRowContainer: () => {
    return document.querySelector(`.${rowContainerClass}`) as HTMLElement
  },
  // Find the divs for the data rows
  getDataRows: () => {
    return Array.from(document.getElementsByClassName(rowClass)).map(e => e as HTMLElement)
  },
  // Specify the columns to extract
  colSpecs: [{
    fieldName: "id",
    el: (row) => row,
    getValue: (cell) => {
      let path = cell.querySelector("." + listingLinkClass) && cell.querySelector("." + listingLinkClass).getAttribute('href')
      let id = path.match(/\/rooms\/([0-9]*)\?/) && path.match(/\/rooms\/([0-9]*)\?/)[1]
      return id
    },
    readOnly: true,
    type: "text",
    hidden: true
  },
  {
    fieldName: "name",
    el: (row) => row.querySelector(`.${titleClass}`),
    readOnly: true,
    type: "text"
  },
  {
    fieldName: "price",
    el: (row) => row.querySelector(`.${priceClass}`),
    // Extract the number from the price div
    getValue: (cell) => cell.textContent.match(/\$([\d]*)/)[1],
    readOnly: true,
    type: "numeric"
  },
  {
    fieldName: "rating",
    el: (row) => row.querySelector(`.${ratingClass}`),
    readOnly: true,
    type: "numeric" as const
  }],
  setupReloadTriggers: () => {}
});