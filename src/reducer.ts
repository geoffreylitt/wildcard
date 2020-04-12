import { WcRecord, AttrSpec, SortConfig } from './types'
import includes from 'lodash/includes'

const initialState = {
  // todo: maybe app and user are each a "table" in the same shape?
  appRecords: [],
  appAttributes: [],
  sortConfig: null,
  userRecords: [],
  userAttributes: [{
    name: "user1",
    type: "text",
    editable: true
  }]
}

const rootReducer = (state = initialState, action) => {
  switch(action.type) {
    case "LOAD_RECORDS":
      return {
        ...state,
        appRecords: action.records
      }

    case "SET_APP_ATTRIBUTES":
      return {
        ...state,
        appAttributes: action.appAttributes
      }

    case "SORT_RECORDS":
      return {
        ...state,
        sortConfig: action.sortConfig
      }

    case "ADD_USER_ATTRIBUTE":
      const newAttribute : AttrSpec = {
        name: "user" + (state.userAttributes.length + 1),
        type: "text",
        editable: true
      }

      return {
        ...state,
        userAttributes: [...state.userAttributes, newAttribute]
      }

    // todo: this seems too specific... instead, generalize to the
    // idea of edits on arbitrary tables?
    case "EDIT_USER_RECORD":
      let newUserRecords : Array<WcRecord>;

      // todo: this does two passes, inefficient
      const existingRecord = state.userRecords.find(r => r.id === action.id)
      if (existingRecord) {
        newUserRecords = state.userRecords.map(r => {
          if (r.id === action.id) {
            return {
              id: r.id,
              attributes: { ...r.attributes, ...action.updates }
            }
          }
          else { return r; }
        })
      } else {
        newUserRecords = [...state.userRecords,
          { id: action.id, attributes: action.updates }
        ]
      }
      return { ...state, userRecords: newUserRecords }

    default:
      return state;
  }
}

export default rootReducer;
