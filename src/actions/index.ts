
// todo: define types for these events
// https://redux.js.org/recipes/usage-with-typescript

import { WcRecord, AttrSpec, SortConfig } from '../types'

export const loadRecords = (records:Array<WcRecord>) => ({ type: "LOAD_RECORDS", records })
export const setAppAttributes = (appAttributes:Array<AttrSpec>) => ({ type: "SET_APP_ATTRIBUTES", appAttributes })
export const sortRecords = (sortConfig:SortConfig) =>  ({ type: "SORT_RECORDS", sortConfig })
export const addUserAttribute = () => ({ type: "ADD_USER_ATTRIBUTE" })
