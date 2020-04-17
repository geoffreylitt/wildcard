
// todo: define types for these events
// https://redux.js.org/recipes/usage-with-typescript

import { Table, TableStore, tableId } from './types'

export const initializeActions = (tableStores:{ [key: string]: TableStore }) => {
  const tableReloaded = (table:Table) =>
      ({ type: "TABLE_RELOADED", table });

  return {
    tableReloaded: tableReloaded,

    addAttribute: (tableId:tableId) => {
      return (dispatch) => {
        const tableStore = tableStores[tableId];
        tableStore.addAttribute();
      }
    }
  }
}
