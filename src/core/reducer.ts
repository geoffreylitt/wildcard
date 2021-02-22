import { Record, Attribute, QueryState, Table} from './types'
import includes from 'lodash/includes'
import pick from 'lodash/pick'
import { combineReducers } from 'redux'

const createTableReducer = (tableId) => {
  const initialTable = {
    // todo: init this from the site adapter with a site name?
    tableId: tableId,
    attributes: [],
    records: [],
  }

  return (state = initialTable, action):Table => {
    if (!action.table || action.table.tableId !== tableId) {
      return state;
    }

    switch(action.type) {
      case "TABLE_RELOADED":
        return {
          ...state,
          attributes: action.table.attributes,
          records: action.table.records,
        }

      default:
        return state;
    }
  }
}

const query = (state = { sortConfig: null }, action):QueryState => {
  switch(action.type) {
    case "SORT_RECORDS":
      return {
        ...state,
        sortConfig: action.sortConfig
      }

    default:
      return state;
  }
}

const formulaResults = (state = { }, action) => {
  switch(action.type) {
    case "FORMULAS_EVALUATED":
      return {
        ...state,
        ...action.values
      }
    
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  appTable: createTableReducer("app"),
  userTable: createTableReducer("user"),
  query,
  formulaResults
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer;
