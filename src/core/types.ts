'use strict';

// This file defines types used throughout Wildcard

export type id = string;

export interface Record {
  id: id;
  attributes: any;
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
