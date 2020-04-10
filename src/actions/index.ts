
// todo: where should this type live?
export interface SortConfig {
  attribute: string;
  direction: "asc" | "desc"
}

export const loadRecords = records => ({ type: "LOAD_RECORDS", records })
export const setAppAttributes = appAttributes => ({ type: "SET_APP_ATTRIBUTES", appAttributes })
export const sortRecords = (sortConfig:SortConfig) =>  ({ type: "SORT_RECORDS", sortConfig })
