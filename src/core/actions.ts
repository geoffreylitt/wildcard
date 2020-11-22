
// todo: define TS types for these events
// https://redux.js.org/recipes/usage-with-typescript

// Many of these actions don't directly affect the Redux state,
// instead they ask a TableAdapter to do something async,
// which will update the redux state on completion.
// We use async redux-thunk action creators for this.

import { Table, TableAdapter, tableId, recordId, RecordEdit, Record, Attribute } from './types'
import includes from 'lodash/includes'
import keys from 'lodash/keys'
import groupBy from 'lodash/groupBy'
import forIn from 'lodash/forIn'
import pick from 'lodash/pick'
import { getFinalAttributes, getFinalRecords } from './getFinalTable'
import { evalFormulas } from '../formula'

export const initializeActions = (TableAdapters:{ [key: string]: TableAdapter }) => {
  return {
    tableReloaded (table:Table) {
      return (dispatch, getState) => {
        // load the new data into the UI immediately
        dispatch({ type: "TABLE_RELOADED", table })

        // asynchronously trigger formula re-evaluation
        const state = getState()
        const finalRecords:Record[] = getFinalRecords(state)
        const finalAttributes:Attribute[] = getFinalAttributes(state)

        evalFormulas(finalRecords, finalAttributes).then(values => {
          dispatch({ type: "FORMULAS_EVALUATED", values })
        })
      }
    },

    // tableReloaded(table: Table) {
    //   return { type: "TABLE_RELOADED", table }
    // },

    addAttribute (tableId:tableId) {
      return (dispatch) => {
        dispatch({
          type: "ADD_ATTRIBUTE_REQUESTED"
        })
        const TableAdapter = TableAdapters[tableId];
        TableAdapter.addAttribute().then(
          // no need to do anything, since we're already subscribed to reloads
          (_table) => { },
          (err) => { console.error(err) }
        )
      }
    },

    clear (tableId:tableId) {
      return (dispatch) => {
        const TableAdapter = TableAdapters[tableId];
        TableAdapter.clear()
      }
    },

    toggleVisibility (tableId:tableId, colName:string) {
      return (dispatch) => {
        dispatch({
          type: "HIDE_COL_REQUESTED"
        })
        const TableAdapter = TableAdapters[tableId];
        TableAdapter.toggleVisibility(colName);
      }
    },

    setFormula (tableId:tableId, attrName:string, formula) {
      return (dispatch) => {
        dispatch({
          type: "HIDE_COL_REQUESTED"
        })
        const TableAdapter = TableAdapters[tableId];
        TableAdapter.setFormula(attrName, formula);
      }
    },

    editRecords(edits) {
      return (dispatch) => {
        dispatch({ type: "EDIT_RECORDS_REQUESTED", edits })

        // split up the request edits by table, and ask each table to
        // do its part of the edits

        const editsByTable = groupBy(edits, e => e.tableId);

        forIn(editsByTable, (edits, tableId) => {
          const TableAdapter = TableAdapters[tableId];
          const editsForTable:Array<RecordEdit> = edits.map(e => pick(e, "recordId", "attribute", "value"))
          console.log("edit command to", tableId, editsForTable)
          TableAdapter.editRecords(editsForTable);
        });
      }
    },

    sortRecords (sortConfig) {
      return { type: "SORT_RECORDS", sortConfig }
    },

    selectRecord (recordId, attribute) {
      return { type: "RECORD_SELECTED", recordId, attribute }
    }
  }
}
