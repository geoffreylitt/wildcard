'use strict';

import { TableStore, Record, AttrSpec, TableCallback } from './core/types'

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

const userStore:TableStore = {
   tableId: "user",
   loadTable: loadTable,
   subscribe(callback:TableCallback) {
     subscribers = [...subscribers, callback];
   },
   applySort() {},
   editRecord(id, attribute, value) {
     let newRecords : Array<Record>;

     // todo: this does two passes, inefficient
     const existingRecord = table.records.find(r => r.id === id)
     if (existingRecord) {
       newRecords = table.records.map(r => {
         if (r.id === id) {
           return {
             id: r.id,
             attributes: { ...r.attributes, [attribute]: value }
           }
         }
         else { return r; }
       })
     } else {
       newRecords = [...table.records,
         { id: id, attributes: { [attribute]: value } }
       ]
     }

     table = { ...table, records: newRecords }

     loadTable();

     return Promise.resolve(table);
   },
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
