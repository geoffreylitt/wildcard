import { AttrSpec } from './types'

const initialState = {
  // todo: maybe app and user are each a "table" in the same shape?
  appRecords: null,
  appAttributes: null,
  sortConfig: null,
  userRecords: [],
  userAttributes: []
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
        type: "text"
      }

      return {
        ...state,
        userAttributes: [...state.userAttributes, newAttribute]
      }

    default:
      return state;
  }
}

export default rootReducer;
