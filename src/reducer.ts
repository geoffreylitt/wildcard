import sortBy from 'lodash/sortBy'

const initialState = {
  appRecords: null,
  appAttributes: null,
  sortConfig: null,
  finalRecords: null, // joined, filtered, sorted records for the table view
}

function sortedRecords(records, sortConfig) {
  let sortedRecords = records.slice();

  if (sortConfig) {
    sortedRecords = sortBy(sortedRecords, r => r.attributes[sortConfig.attribute])

    if (sortConfig.direction === "desc") {
      sortedRecords = sortedRecords.reverse()
    }
  }

  return sortedRecords;
}

const rootReducer = (state = initialState, action) => {
  switch(action.type) {
    case "LOAD_RECORDS":
      console.log("new records loaded", action.records);
      return {
        ...state,
        appRecords: action.records,
        finalRecords: sortedRecords(action.records, state.sortConfig)
      }

    case "SET_APP_ATTRIBUTES":
      console.log("setting attributes", action.appAttributes)
      return {
        ...state,
        appAttributes: action.appAttributes
      }

    case "SORT_RECORDS":
      return {
        ...state,
        sortConfig: action.sortConfig,
        finalRecords: sortedRecords(state.appRecords, action.sortConfig)
      }

    default:
      return state;
  }
}

export default rootReducer;
