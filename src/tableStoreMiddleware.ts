// When things happen to our Redux state,
// which we want to propagate downstream to the adapter,
// we handle it here.

// (when adapters are _upstream_ of the state,
// handle it in action creators instead.)

import { getFinalRecords } from './core/getFinalTable'
import { TableStore } from './core/types'

export const tableStoreMiddleware = (tableStore: TableStore) =>
  ({ getState }) => next => action => {

  // Call the next dispatch method in the middleware chain.
  const returnValue = next(action)

  const newState = getState();

  // todo: should we just do this on every state update?
  // all we get by being picky is perf improvement;
  // we're sending in the whole new state each time anyway?
  // actually nvm... maybe we do gain a lot of perf by telling the adapter
  // where the edit happened rather than just "something changed"
  switch (action.type) {
    // Records were sorted;
    // apply the sort to this adapter
    case "SORT_RECORDS":
      tableStore.applySort(
        getFinalRecords(newState),
        newState.sortConfig
      );
      break;

    // Notify this table store if another table was reloaded
    // (eg: notify the site that user data has changed,
    // so we need to update annotations)
    case "TABLE_RELOADED":
      if (action.table.tableId !== tableStore.tableId) {
        tableStore.handleOtherTableUpdated(action.table)
      }

    // put table reloaded here
  }

  return returnValue
}

