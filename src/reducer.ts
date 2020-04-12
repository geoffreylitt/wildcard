import { WcRecord, AttrSpec, SortConfig } from './types'
import includes from 'lodash/includes'
import { combineReducers } from 'redux'

const appTable = (state = { attributes: [], records: [] }, action) => {
  switch(action.type) {
    case "LOAD_RECORDS":
      return {
        ...state,
        records: action.records
      }

    case "SET_APP_ATTRIBUTES":
      return {
        ...state,
        attributes: action.appAttributes
      }

    default:
      return state;
  }
}


const initialUserTable = {
  attributes: [{
    name: "user1",
    type: "text",
    editable: true
  }],
  records: []
}
const userTable = (state = initialUserTable, action) => {
  switch(action.type) {
    case "ADD_USER_ATTRIBUTE":
      const newAttribute : AttrSpec = {
        name: "user" + (state.attributes.length + 1),
        type: "text",
        editable: true
      }

      return {
        ...state,
        attributes: [...state.attributes, newAttribute]
      }

    // todo: this seems too specific... instead, generalize to the
    // idea of edits on arbitrary tables?
    case "EDIT_USER_RECORD":
      let newRecords : Array<WcRecord>;

      // todo: this does two passes, inefficient
      const existingRecord = state.records.find(r => r.id === action.id)
      if (existingRecord) {
        newRecords = state.records.map(r => {
          if (r.id === action.id) {
            return {
              id: r.id,
              attributes: { ...r.attributes, ...action.updates }
            }
          }
          else { return r; }
        })
      } else {
        newRecords = [...state.records,
          { id: action.id, attributes: action.updates }
        ]
      }
      return { ...state, records: newRecords }

    default:
      return state;
  }
}

const sortConfig = (state = null, action) => {
  switch(action.type) {
    case "SORT_RECORDS":
      return action.sortConfig

    default:
      return state;
  }
}

const rootReducer = combineReducers({
  appTable,
  userTable,
  sortConfig
})

export default rootReducer;
