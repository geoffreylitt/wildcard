'use strict';

import { urlExact, urlContains, extractNumber } from "../utils";
import mapValues from "lodash/mapValues";
import keyBy from 'lodash/keyBy'
import keys from 'lodash/keys'
import values from 'lodash/values'
import pick from 'lodash/pick'
import { Record, AttrSpec, SortConfig, TableStore, Table, tableId, RecordEdit } from '../core/types'
import { htmlToElement } from '../utils'

type DataValue = string | number | boolean

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

/** A data structure representing a scraped row of data from the page.
*   Must specify both an HTML element and an object containing data values.
*   (The HTML element is used for things like highlighting and sorting rows.)
*/
export interface ScrapedRow {
  /** The element(s) representing the row */
  // todo: use the full tagged union style here, rather than bare sum type,
  // to get exhaustiveness checking everywhere
  rowElements: Array<HTMLElement>;

  /** A stable ID for the row */
  id: string;

  /** The data values for the row, with column names as keys */
  attributes: { [key: string]: PageValue };

  /** A container for adding user annotations */
  annotationContainer?: HTMLElement;

  /** An HTML template for storing an annotation on this row.
   *  should include "$annotation", which will be replaced by annotation text
   */
  annotationTemplate?: string;
}

function onDomReady(fn) {
  if (document.readyState!='loading') fn();
  else document.addEventListener('DOMContentLoaded', fn)
}

abstract class DomScrapingBaseAdapter implements TableStore {
  tableId: tableId;
  scrapedRows: Array<ScrapedRow>;
  sortOrder: SortConfig;
  abstract siteName: string;
  abstract colSpecs: Array<AttrSpec>;
  subscribers: Array<(Table) => void>;

  constructor() {
    this.tableId = "app";
    this.scrapedRows = [];
    this.sortOrder = null;
    this.subscribers = [];
  }

  loadTable() {
    this.scrapedRows = this.scrapePage();
    const table = this.tableInExternalFormat();
    for (const callback of this.subscribers) { callback(table); }
    return table;
  }

  initialize() {
    onDomReady(() => this.loadTable())
  }

  // Currently, just load data once on dom ready
  // todo: reload data on different triggers
  subscribe (callback) {
    this.subscribers = [...this.subscribers, callback]

    // trigger a load to catch up this subscriber
    this.loadTable();
  }

  // Note about DOM scraping + sorting:
  // We compute a sort order outside the adapter and pass in the ID list.
  // When a sort is cleared, we revert to the original scraped order.
  // This works fine if we only scrape once on page load.
  // But if we scrape again during page load, while the page is sorted,
  // things get weird -- the sorted order becomes our "unsorted" underlying
  // order. Unfortunately not too much we can do about that.
  applySort(finalRecords, sortConfig) {
    if (this.scrapedRows.length > 0) {
      const rowContainer = this.scrapedRows[0].rowElements[0].parentElement;
      const scrapedRowsById = keyBy(this.scrapedRows, r => r.id);

      // todo: this clears out other non-row content, which isn't ideal.
      // but there's not a super great way to keep it in the right place...
      rowContainer.innerHTML = ""
      finalRecords.forEach(r => {
        let scrapedRow = scrapedRowsById[r.id];
        scrapedRow.rowElements.forEach(el => {
          rowContainer.appendChild(el);
        })
      })
    }
  }

  // todo: does this API really need to be async...?
  // we receive an edit request with all the attributes
  // and split it up into two parts:
  // updates to the original record in the page,
  // and updates to additional user-added columns which become annotations
  editRecord(recordId, attribute, value) {
    return this.editRecords([{ recordId, attribute, value }]);
  }

  editRecords(edits:Array<RecordEdit>) {
    for (const { recordId, attribute, value } of edits) {
      const scrapedRow = this.scrapedRows.find(sr => sr.id === recordId);
      if (!scrapedRow) { continue; }

      const scrapedValue = scrapedRow.attributes[attribute];

      if (!(scrapedValue instanceof HTMLElement)) {
        return Promise.reject("Can't edit scraped value, site adapter must return HTML element to be editable.")
      }

      if (scrapedValue instanceof HTMLInputElement) {
        scrapedValue.value = value;
      } else {
        scrapedValue.textContent = value;
      }
    }
    return Promise.resolve(this.loadTable());
  }

  // the simplest thing to do is just handle a whole new table,
  // and re-annotate everything on the page.
  // if this is too slow, we can get smarter,
  // eg only re-annotate certain rows.
  handleOtherTableUpdated(newTable) {
    for (const record of newTable.records) {
      const scrapedRow = this.scrapedRows.find(sr => sr.id === record.id);

      if (!scrapedRow.annotationContainer) return;

      // todo: set a default annotation container + target

      // create the annotation container if it doesn't exist
      let annotationTarget = scrapedRow.annotationContainer.querySelector(".user-annotations");

      if (!annotationTarget) {
        annotationTarget =
          htmlToElement("<span class='user-annotations'></span>")
        scrapedRow.annotationContainer.appendChild(annotationTarget)
      }

      // add the actual annotations to the page
      let annotationsHTML =
        newTable.attributes
          .filter(attr => !attr.hideInPage) // hide columns hidden in page
          .map(attr => record.attributes[attr.name])
          .filter(value => value)
          .map(value => scrapedRow.annotationTemplate.replace("$annotation", value));
      annotationTarget.innerHTML = annotationsHTML.join(" ")
    }
  }

  abstract scrapePage():Array<ScrapedRow>;

  // convert scraper-internal data structure to
  // the standard format for all wildcard adapters
  tableInExternalFormat():Table {
    // hmm, don't love creating parallel data structures for values + elements;
    // maybe better:
    // * user constructs just elements
    // * base DOMScrapingAdapter constructs elements + values
    // * base DOMScrapingAdapter uses that to output the "just values" version
    const records = this.scrapedRows.map(row => ({
      id: row.id,
      attributes: mapValues(row.attributes, (value, attrName) => {
        let extractedValue;

        // extract text from html element
        if (value instanceof HTMLInputElement) {
          extractedValue = value.value;
        }
        else if (value instanceof HTMLElement) {
          extractedValue = value.textContent;
        } else {
          extractedValue = value;
        }

        // do type conversions
        if (this.colSpecs.find(spec => spec.name === attrName).type === "numeric" &&
            typeof extractedValue !== "number") {
          extractedValue = extractNumber(extractedValue);
        }

        return extractedValue;
      })
    }));

    return {
      tableId: "app",
      attributes: this.colSpecs,
      records: records
    }
  }

  otherTableUpdated(table) {
    console.log("other table updated", table);
  }

  addAttribute() {
    return Promise.reject("Can't add attributes to site adapter")
  }
}

export default DomScrapingBaseAdapter;

