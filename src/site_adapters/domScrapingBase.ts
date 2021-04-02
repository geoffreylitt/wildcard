'use strict';

import { urlContains, extractNumber, urlMatches } from "../utils";
import mapValues from "lodash/mapValues";
import keyBy from 'lodash/keyBy'
import { Attribute, SortConfig, TableAdapter, Table, RecordEdit } from '../core/types'
import { htmlToElement } from '../utils'
import { updateFromSetFormula } from '../end_user_scraper/eventListeners'

type DataValue = string | number | boolean
declare var browser : any;

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
  // Todo: change this to Array<HTMLElement> to make callers happy
  // (kind of annoying because we want to allow adapter config to return
  // Array<Element>, but then handle the typecasting to HTMLElement
  // here in this file, and the TS bookkeeping is a bit messy)
  rowElements: Array<Element>;

  /** A stable ID for the row */
  id: string;

  /** The data values for the row, with column names as keys */
  dataValues: { [key: string]: PageValue };

  /** A container for adding user annotations */
  annotationContainer?: HTMLElement;

  /** An HTML template for storing an annotation on this row.
   *  should include "$annotation", which will be replaced by annotation text
   */
  annotationTemplate?: string;
}

export interface ScrapedAjaxRow {
  /** A stable ID for the row */
  id: string;

  /** The data values for the row, with column names as keys */
  dataValues: { [key: string]: PageValue };
}

// todo: document this config;
// it's the main thing people need to understand to
// build a site adapter
export interface ScrapingAdapterConfig {
  name:string;
  matches?:string[];
  metadata?: object;
  enabled():boolean;
  attributes:Array<Attribute>;
  scrapePage():Array<ScrapedRow>;
  scrapeAjax?(request):Array<ScrapedAjaxRow>;
  addScrapeTriggers?(any):void;
  iframe?:boolean;

  /** Custom function to modify row elements when row is selected */
  onRowSelected?(ScrapedRow, string?):void;
  /** Custom function to modify row elements when row is unselected */
  onRowUnselected?(ScrapedRow, string?):void;
}

function onDomReady(fn) {
  if (document.readyState!='loading') fn();
  else document.addEventListener('DOMContentLoaded', fn)
}

// Takes in as input a site-specific DOM scraping configuration;
// returns a TableAdapter that conforms to the abstract adapter spec.
export function createDomScrapingAdapter(config:ScrapingAdapterConfig):TableAdapter {
  const attributes = config.attributes

  // Mutable state to be managed for this adapter, as a closure
  let scrapedRows: Array<ScrapedRow> = [];
  let sortOrder: SortConfig = null;
  let subscribers: Array<(Table) => void> = [];
  let scrapedAjaxRows;
  let scrapedAjaxRowDict = {};

  //Only works for Firefox
  if(navigator.userAgent.indexOf("Firefox") != -1 ) {
    // Listen to AJAX Requests
    browser.runtime.onMessage.addListener(request => {
      let result = config.scrapeAjax(request);
      if (result !== undefined && result !== null) {
        scrapedAjaxRows = result;
        result.forEach((item) => {
          scrapedAjaxRowDict[item.id] = item.dataValues;
        });
        loadTable();
      }
    });
  }

  // todo: another way to store this would be to
  // create some sort of wrapper type where we add more data to scraped rows
  let originalBorder;

  // Do some light cleanup on the result of the config's scrapePage.
  // This is to make it easier on site adapter developers to
  // avoid doing these steps in their scrapePage functions.
  const scrapePage = () => {
    let result = config.scrapePage();
    if (!result) { return result; }

    result = result.map(scrapedRow => (
      {
        ...scrapedRow,
        rowElements:
          scrapedRow.rowElements
            // Make typescript happy with these element types
            .map(el => el as HTMLElement)

            // Don't include a row element if it's not there
            .filter(el => el)
      }))

    return result;
  }

  const loadTable = () => {
    console.time("LOADING TABLE")
    scrapedRows = scrapePage();
    const table = { ...tableInExternalFormat(), attributes: config.attributes };
    // Notify all subscribers that we have new data
    for (const callback of subscribers) { callback(table); }
    console.timeEnd("LOADING TABLE")
    return table;
  }

  const initialize = () => {
    onDomReady(() => {
      loadTable();
      if (config.addScrapeTriggers) {
        config.addScrapeTriggers(loadTable);
      }
    })
  }

  // Currently, just load data once on dom ready
  // todo: reload data on different triggers
  const subscribe  = (callback) => {
    subscribers = [...subscribers, callback]

    // trigger a load to catch up this subscriber
    loadTable();
  }

  // Note about DOM scraping + sorting:
  // We compute a sort order outside the adapter and pass in the ID list.
  // When a sort is cleared, we revert to the original scraped order.
  // This works fine if we only scrape once on page load.
  // But if we scrape again during page load, while the page is sorted,
  // things get weird -- the sorted order becomes our "unsorted" underlying
  // order. Unfortunately not too much we can do about that.
  const applySort = (finalRecords, sortConfig) => {
    if (scrapedRows.length > 0) {
      const rowContainer = scrapedRows[0].rowElements[0].parentElement;
      const scrapedRowsById = keyBy(scrapedRows, r => r.id);

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
  const editRecords = (edits:Array<RecordEdit>) => {
    for (const { recordId, attribute, value } of edits) {
      const scrapedRow = scrapedRows.find(sr => sr.id === recordId);
      if (!scrapedRow) { continue; }

      const scrapedValue = scrapedRow.dataValues[attribute];

      if (!(scrapedValue instanceof HTMLElement)) {
        return Promise.reject("Can't edit scraped value, site adapter must return HTML element to be editable.")
      }

      if (scrapedValue instanceof HTMLInputElement) {
        scrapedValue.value = value;
      } else {
        scrapedValue.textContent = value;
      }
    }
    return Promise.resolve(loadTable());
  }

  // the simplest thing to do is just handle a whole new table,
  // and re-annotate everything on the page.
  // if this is too slow, we can get smarter,
  // eg only re-annotate certain rows.
  const handleOtherTableUpdated = (newTable) => {
    for (const record of newTable.records) {
      const scrapedRow = scrapedRows.find(sr => sr.id === record.id);

      if (!scrapedRow || !scrapedRow.annotationContainer) continue;

      // todo: set a default annotation container + target.
      // create the annotation target if it doesn't exist
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
          .map(attr => record.values[attr.name])
          .filter(value => value !== undefined)
          .map(value => scrapedRow.annotationTemplate.replace("$annotation", value));
      annotationTarget.innerHTML = annotationsHTML.join(" ")
    }
  }

  // convert scraper-internal data structure to
  // the standard format for all wildcard adapters
  const tableInExternalFormat = ():Table => {
    // hmm, don't love creating parallel data structures for values + elements;
    // maybe better:
    // * user constructs just elements
    // * base DOMScrapingAdapter constructs elements + values
    // * base DOMScrapingAdapter uses that to output the "just values" version

    let combinedRows = scrapedRows.map(row => {
      // console.log("id:",row.id, "length:", row.id.length);
      row.dataValues = {...row.dataValues, ...scrapedAjaxRowDict[row.id]};
      return row;
    });

    const records = combinedRows.map(row => ({
      id: row.id,
      values: mapValues(row.dataValues, (value, attrName) => {
        let extractedValue;

        // extract text from html element
        if (value instanceof HTMLInputElement) {
          extractedValue = value.value;
        }
        else if (value instanceof HTMLElement) {
          // Return DOM Elements as-is to the table;
          // we'll extract text contents at display time.
          extractedValue = value;
        } else {
          extractedValue = value;
        }

        // do type conversions
        if (attributes.length && attributes.find(spec => spec.name === attrName).type === "numeric" &&
            typeof extractedValue !== "number") {
          extractedValue = extractNumber(extractedValue);
        }

        return extractedValue;
      })
    }));

    return {
      tableId: "app",
      attributes: attributes,
      records: records
    }
  }

  const otherTableUpdated = (table) => {
    console.log("other table updated", table);
  }

  const addAttribute = () => {
    return Promise.reject("Attributes can only be added to user tables.")
  }

  const updateAttribute = ({ attrName, formula }) => {
    const attributeIndex = config.attributes.findIndex(attribute => attribute.name === attrName);
    if (attributeIndex > -1) {
      const attribute = config.attributes[attributeIndex];
      if (attribute.formula !== formula) {
        attribute.formula = formula;
        return true;
      }
      return false;
    }
    return false;
  }

  const toggleVisibility = (colName) => {
    return Promise.reject("Visibility can only be toggled for user tables.")
  }

  // todo: support highlighting individual attributes
  // within a row (generally when there's one row)
  const handleRecordSelected = (recordId, attribute) => {
    for (const sr of scrapedRows) {

      // Handle highlighting
      if (sr.id === recordId) {
        if (config.onRowSelected) {
          config.onRowSelected(sr);
        } else {
          // make the row appear selected in the page
          sr.rowElements[0].scrollIntoView({ behavior: "smooth", block: "center" })
          // sr.rowElements.forEach((el, index) => {
          //   if ((el as HTMLElement).style) {

          //     // oversimplified way to remember old styles before highlighting --
          //     // just remember a single original border value across all rows.
          //     // (works OK if all rows share same border styling)
          //     if (originalBorder === undefined) {
          //       originalBorder = (el as HTMLElement).style.border;
          //     }

          //     (el as HTMLElement).style.border = `solid 2px #c9ebff`
          //   }
          // })
        }

      // Handle unhighlighting
      } else {
        if (config.onRowUnselected) {
          config.onRowUnselected(sr);
        } else {
          sr.rowElements.forEach((el, index) => {
            if ((el as HTMLElement).style && originalBorder !== undefined) {
              (el as HTMLElement).style.border = originalBorder;
            }
          });
        }
      }
    }
  }

  const enabled = () => {
    const { matches }  = config;
    if (matches) {
      const enabled = matches.some(match => {
        return urlContains(match) || urlMatches(new RegExp(match))
      });
      return enabled;
    } else if (config.enabled) {
      return config.enabled();
    }
    return false;
  }

  return {
    name: config.name,
    enabled,
    // todo: maybe have different table ids for each adapter,
    // rather than make them all "app"?
    tableId: "app",
    loadTable,
    initialize,
    subscribe,
    applySort,
    editRecords,
    handleOtherTableUpdated,
    handleRecordSelected,
    addAttribute,
    toggleVisibility,
    clear: () => {},
    setFormula: (attrName, formula) => {
      const updated = updateAttribute({ attrName, formula });
      if (updated) {
        updateFromSetFormula({ formula });
      }
    },
    updateConfig: (_config) => {
      config.attributes = _config.attributes;
      config.scrapePage = _config.scrapePage;
      config.metadata = _config.metadata;
      console.time("UPDATING CONFIG")
      loadTable();
      console.timeEnd("UPDATING CONFIG")
    },
    getConfig: () => {
      return config;
    }
  }
}

