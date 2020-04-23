'use strict';

import { TableAdapter, Record, Attribute, TableCallback, RecordEdit } from './core/types'

let table = {
  tableId: "user",
  attributes: [],
  records: []
}

let subscribers:Array<TableCallback> = []

const loadTable = () => {
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

const userStore:TableAdapter = {
   tableId: "user",
   name: "User Local Storage",
   enabled: () => true , // user store is always enabled
   loadTable: loadTable,
   subscribe(callback:TableCallback) {
     subscribers = [...subscribers, callback];
   },
   editRecords: editRecords,
   addAttribute() {
     const newAttribute : Attribute = {
       name: "user" + (table.attributes.length + 1),
       type: "text",
       editable: true
     }

     table = { ...table, attributes: [...table.attributes, newAttribute] }

     loadTable();

     return Promise.resolve(table);
   },

   // These changes to the table are no-ops
   // todo: should these move off the generic table adapter interface?
   // should they only apply to dom adapters?
   handleRecordSelected() {}, //no-op
   applySort() {},
   handleOtherTableUpdated() {},
}

export default userStore;
