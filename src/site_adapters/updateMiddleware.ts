// This is a Redux middlware that listens for certain events which
// should affect the site UI, and forwards the command to the site adapter.
//
// It's a redux middleware so that we can do this async,
// without adding a blocking side effect to our reducer

// todo: generalize to an abstract adapter interface
import DomScrapingBaseAdapter from './domScrapingBase'
import { getFinalRecords } from '../assembleFinalTable'

export const updateAdapterMiddleware = (adapter:DomScrapingBaseAdapter) =>
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
    case "SORT_RECORDS":
      adapter.applySort(getFinalRecords(newState), newState.sortConfig);
      break;

    case "EDIT_USER_RECORD":
      adapter.annotateRecordInSite(
        action.id,
        newState.userTable.records.find(r => r.id === action.id).attributes,
        newState.userTable.attributes
      );
      break;
  }

  return returnValue
}
