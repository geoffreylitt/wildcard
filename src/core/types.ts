'use strict';

// This file defines types used throughout Wildcard

type id = string;

export type recordId = id;
export type tableId = id;

export interface Record {
  id: recordId;
  attributes: any;
}

export interface RecordEdit {
  recordId:recordId;
  attribute:string;
  value:any;
}

/**
* Defines the schema for one column of the table being extracted.
*/
export interface AttrSpec {
  /** The name of this data column, to be displayed in the table */
  name: string;

  /** The type of this column. Can be any
  * [Handsontable cell type](https://handsontable.com/docs/7.3.0/tutorial-cell-types.html).
  * Examples: text, numeric, date, checkbox. */
  type: string;

  /** Allow user to edit this value? Defaults to false.
  *  Making a column editable requires extracting [[PageValue]]s as Elements.*/
  editable?: boolean;

  /** Specify a custom [Handsontable editor](https://handsontable.com/docs/7.3.0/tutorial-cell-editor.html)
  * as a class (see Expedia adapter for an example) */
  editor?: string;

  /** Specify a custom [Handsontable rendererr](https://handsontable.com/docs/7.3.0/demo-custom-renderers.html)
  * as a class (todo: not actually supported yet, but will be soon ) */
  renderer?: string;

  /** Hide this column in the visible table?
  Eg, useful for hiding an ID column that's needed for sorting */
  hidden?: boolean;
}


export interface Table {
  tableId: tableId;
  attributes: Array<AttrSpec>;
  records: Array<Record>
}

export interface SortConfig {
  attribute: string;
  direction: "asc" | "desc";
}

export interface QueryState {
  sortConfig: SortConfig
}

export type TableCallback = (table:Table) => void;

// Generalizing over the site adapters and user data, among others
export interface TableStore {
  tableId: tableId;

  // =====================
  // Reading data
  // =====================

  /** Return latest data */
  loadTable():Table;

  /** Register a callback function which will be called with a new table
   *  of data anytime the data changes. */
  subscribe (callback:TableCallback):void;

  // ============================================================
  // Requesting to the TableStore to modify the table in some way
  // ============================================================

  // todo: should probably update these to return promises
  // rather than just void and throwing away any return values

  /** Apply a new sort order to the table */
  applySort(finalRecords:Array<Record>, sortConfig:SortConfig):void;

  /** Edit record in the table*/
  editRecord(id:recordId, attribute:string, value:any):Promise<Table>;

  editRecords(edits:Array<RecordEdit>):Promise<Table>;

  /** Update the UI to match arbitrary table state
   *  (To implement performantly, probably do a diff inside the adapter
   *  and only update the UI where necessary) */
  // update?(table:Table):void;

  // ============================================================
  // Notifying the TableStore of changes to other tables
  // ============================================================

  handleOtherTableUpdated(table:Table):void;

  addAttribute():Promise<Table>;
}
