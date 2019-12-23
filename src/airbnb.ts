'use strict';

import { createTable } from './wildcard.js';

declare function GM_getValue(key : string): any;
declare function GM_setValue(key : string, value: string): any;
declare function GM_xmlhttpRequest(options: any): any;
declare function GM_openInTab(options: any): any;


// These might change...
const rowContainerClass = "_fhph4u"
const rowClass = "_8ssblpx"
const imageClass = "_1i2fr3fi"
const titleClass = "_1ebt2xej"
const priceClass = "_1p7iugi"
const ratingClass = "_ky9opu0"
const listingLinkClass = "_i24ijs"
const likeListClass = "_v44ajx"
const closeModalClass = "_1rp5252"
const notesClass = "_1s7voim"

const colSpecs = [
  {
    fieldName: "id",
    el: (row) => { return row },
    value: (cell) => {
      let path = cell.querySelector("." + listingLinkClass) && cell.querySelector("." + listingLinkClass).getAttribute('href')
      let id = path.match(/\/rooms\/([0-9]*)\?/) && path.match(/\/rooms\/([0-9]*)\?/)[1]
      return id
    },
    readOnly: true,
    type: "text" as const,
    hidden: true
  },
  {
    fieldName: "name",
    el: (row) => row.querySelector(`.${titleClass}`),
    readOnly: true,
    type: "text" as const
  },
  {
    fieldName: "price",
    el: (row) => row.querySelector(`.${priceClass}`),
    // We don't want to just extract the raw price text;
    // we want to extract only the price number.
    value: (cell) => cell.textContent.match(/\$([\d]*)/)[1],
    readOnly: true,
    type: "numeric" as const
  },
  {
    fieldName: "rating",
    el: (row) => row.querySelector(`.${ratingClass}`),
    readOnly: true,
    type: "numeric" as const
  },
];

const getDataRows = () => {
  return Array.from(document.getElementsByClassName(rowClass)).map(e => e as HTMLElement)
}

const getRowContainer = () => {
  return document.querySelector(`.${rowContainerClass}`) as HTMLElement
}

const options = {
  colSpecs: colSpecs,
  getDataRows: getDataRows,
  getRowContainer: getRowContainer,
  setupReloadTriggers: () => {}
}

createTable(options);