'use strict';

import { TableStore, Record, AttrSpec, TableCallback, RecordEdit } from './core/types'

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
            attributes: { ...r.attributes, [attribute]: value }
          }
        }
        else { return r; }
      })
    } else {
      newRecords = [...table.records,
        { id: recordId, attributes: { [attribute]: value } }
      ]
    }

    table = { ...table, records: newRecords }
  }
  return Promise.resolve(loadTable());
}

const userStore:TableStore = {
   tableId: "user",
   loadTable: loadTable,
   subscribe(callback:TableCallback) {
     subscribers = [...subscribers, callback];
   },
   applySort() {},
   editRecord(recordId, attribute, value) {
     return editRecords([ { recordId, attribute, value } ]);
   },
   editRecords: editRecords,
   handleOtherTableUpdated() {
     // probably don't care if the site table updates..?
   },
   addAttribute() {
     const newAttribute : AttrSpec = {
       name: "user" + (table.attributes.length + 1),
       type: "text",
       editable: true
     }

     table = { ...table, attributes: [...table.attributes, newAttribute] }

     loadTable();

     return Promise.resolve(table);
   }
}

export default userStore;
