
// todo: define types for these events
// https://redux.js.org/recipes/usage-with-typescript

import { Record, AttrSpec, SortConfig } from './types'

// Actions from site adapters
export const loadRecords = (records:Array<Record>) => ({ type: "LOAD_RECORDS", records })
export const setAppAttributes = (appAttributes:Array<AttrSpec>) => ({ type: "SET_APP_ATTRIBUTES", appAttributes })

// Actions from the UI
export const sortRecords = (sortConfig:SortConfig) =>  ({ type: "SORT_RECORDS", sortConfig })
export const addUserAttribute = () => ({ type: "ADD_USER_ATTRIBUTE" })
export const editRecord = (id, updates) => ({ type: "EDIT_RECORD", id, updates })
