// This file contains the logic for assembling a final table to display:
//
// * Join together various tables -- app data, user data
// * Join together attribute lists -- app, user
// * Sort / filter the final output

// These are implemented as reselect selectors because they're derived state;
// no need to store in the redux store; just a pure function of the various
// tables and attributes.

// Whatever gets outputted by these selectors is *exactly* what gets displayed
// in the final table view.


import { createSelector } from 'reselect';
import sortBy from 'lodash/sortBy';
import keyBy from 'lodash/keyBy';
import { RootState } from './reducer';

const getAppRecords = (state:RootState) => state.appTable.records
const getAppAttributes = (state:RootState) => state.appTable.attributes

const getUserRecords = (state:RootState) => state.userTable.records
const getUserAttributes = (state:RootState) => state.userTable.attributes

const getSortConfig = (state:RootState) => state.query.sortConfig

// this selector is just cached on the whole state
export const getFinalRecords = createSelector(
  [getAppRecords, getUserRecords, getSortConfig],
  (appRecords, userRecords, sortConfig) => {

    const userRecordsById = keyBy(userRecords, r => r.id);

    let finalRecords = appRecords.slice();

    // left join user records to app records
    finalRecords = finalRecords.map(r => ({
      id: r.id,
      values: {
        ...r.values,
        ...(userRecordsById[r.id] || {}).values
      }
    }));

    // sort
    if (sortConfig) {
      finalRecords = sortBy(finalRecords, r => r.values[sortConfig.attribute])

      if (sortConfig.direction === "desc") {
        finalRecords = finalRecords.reverse()
      }
    }

    return finalRecords;
  }
)

export const getFinalAttributes = createSelector(
  [getAppAttributes, getUserAttributes],
  (appAttributes, userAttributes) => {
    // annotate attrs with a table id
    appAttributes = (appAttributes || []).map( a => ({ ...a, tableId: "app" }))
    userAttributes = (userAttributes || []).map(a => ({ ...a, tableId: "user" }))
    return appAttributes.concat(userAttributes)
  }
)
