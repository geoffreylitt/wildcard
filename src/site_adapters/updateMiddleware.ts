// This is a Redux middlware that listens for certain events which
// should affect the site UI, and forwards the command to the site adapter.
//
// It's a redux middleware so that we can do this async,
// without adding a blocking side effect to our reducer

export const updateAdapterMiddleware = (adapter) =>
  ({ getState }) => next => action => {

  // Call the next dispatch method in the middleware chain.
  const returnValue = next(action)

  const newState = getState();

  if (action.type === "SORT_RECORDS") {
    adapter.applySort(newState.finalRecords, newState.sortConfig)
    // for now, we don't care whether it completed or not.
    // in the future, could async receive success/fail here
  }

  return returnValue
}
