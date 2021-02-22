'use strict';
declare const browser;

import { TableAdapter, Record, Attribute, TableCallback, RecordEdit } from './core/types'
import { createDomScrapingAdapter } from './site_adapters/domScrapingBase';
import { readFromChromeLocalStorage, compileJavascript } from './utils'

const emptyTable = {
  tableId: "user",
  attributes: [],
  records: []
}

let table = emptyTable

// todo: could we use tableId instead of a separate "namespace" here?
// especially because we might not always want to launch the same user table
// for the same site adapter. we should add some indirection somewhere,
// so a site adapter loads a specific user table by default, but
// you could install someone else's user table, or even have multiple
// possible user tables stored within a single adapter, all joined together
let namespace;

let subscribers:Array<TableCallback> = []

const storageKey = () => `localStorageAdapter:${namespace}`

const loadTable = () => {
  chrome.storage.local.set({ [storageKey()]: table });
  for (const callback of subscribers) { callback(table); }
  return table;
}

const editRecords = (edits:Array<RecordEdit>) => {
  for (const { recordId, attribute, value } of edits) {
    let newRecords : Array<Record>;

    // todo: this does two passes, inefficient
    const existingRecord = table.records.find(r => r.id === recordId)
    if (existingRecord) {
      newRecords = table.records.map(r => {
        if (r.id === recordId) {
          return {
            id: r.id,
            values: { ...r.values, [attribute]: value }
          }
        }
        else { return r; }
      })
    } else {
      newRecords = [...table.records,
        { id: recordId, values: { [attribute]: value } }
      ]
    }

    table = { ...table, records: newRecords }
  }
  return Promise.resolve(loadTable());
}

export const userStore:TableAdapter = {
   tableId: "user",
   name: "User Local Storage",
   initialize: (ns) => {
     namespace = ns;
     chrome.storage.local.get([storageKey()], (result) => {
       const tableFromStorage = result[storageKey()];
       if (tableFromStorage) { table = tableFromStorage; loadTable(); }
     })
   },
   enabled: () => true , // user store is always enabled
   clear: () => {
     table = emptyTable
     loadTable()
   },
   loadTable: loadTable,
   subscribe(callback:TableCallback) {
     subscribers = [...subscribers, callback];
   },
   editRecords: editRecords,
   addAttribute() {
     const newAttribute : Attribute = {
       name: "user" + (table.attributes.length + 1),
       type: "text",
       editable: true,
       hideInPage: false
     }

     table = { ...table, attributes: [...table.attributes, newAttribute] }

     loadTable();

     return Promise.resolve(table);
   },
   toggleVisibility(colName) {

    var curr = table.attributes.find((attribute) => (attribute.name === colName));
    curr.hideInPage = !curr.hideInPage;

    loadTable();

    return;
  },
  setFormula(attrName, formula) {
    table = { ...table,
      attributes: table.attributes.map(attr => attr.name === attrName ? { ...attr, formula } : attr )}

    loadTable(); 
  },

   // These changes to the table are no-ops
   // todo: should these move off the generic table adapter interface?
   // should they only apply to dom adapters?
   handleRecordSelected() {}, //no-op
   applySort() {},
   handleOtherTableUpdated() {},
}

export const adapterStore = {
  getLocalAdapters: async () => {
    const localAdaptersKey = 'localStorageAdapter:adapters';
    const keysToEvaluate = ['scrapePage', 'onRowSelected', 'onRowUnselected', 'addScrapeTriggers'];
    const result = [];
    try {
      const localAdapters = (await readFromChromeLocalStorage([localAdaptersKey]) as Object)[localAdaptersKey] || [];
      for (let i = 0; i < localAdapters.length; i++) {
        const adapter = localAdapters[i];
        const localAdapterKey = `${localAdaptersKey}:${adapter}`;
        const adapterConfigString = (await readFromChromeLocalStorage([localAdapterKey]) as Object)[localAdapterKey];
        // sometimes we can end up with malformed adapters; just ignore and keep going
        if(!adapterConfigString) continue;
        const adapterConfig = JSON.parse(adapterConfigString);
        Object.keys(adapterConfig)
          .filter(key => keysToEvaluate.includes(key))
          .forEach(key => {
            adapterConfig[key] = compileJavascript(adapterConfig[key]);
          });
        const localAdapter = createDomScrapingAdapter(adapterConfig);
        result.push(localAdapter);
      }
    } catch(error){
      console.error('error while retrieving local adapters:', error);
    }
    return result;
  }
}
