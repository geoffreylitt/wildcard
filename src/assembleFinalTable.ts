// This file contains the logic for assembling a final table to display
// * Join together various tables -- app data, user data
// * Join together attribute lists -- app, user
// * Sort / filter the final output

// These are implemented as reselect selectors because they're derived state;
// no need to store in the redux store; just a pure function of the various
// tables and attributes.

import { createSelector } from 'reselect'
import sortBy from 'lodash/sortBy';
import keyBy from 'lodash/keyBy';

const getAppRecords = state => state.appRecords
const getUserRecords = state => state.userRecords
const getAppAttributes = state => state.appAttributes
const getUserAttributes = state => state.userAttributes
const getSortConfig = state => state.sortConfig

// this selector is just cached on the whole state
export const getFinalRecords = createSelector(
  [getAppRecords, getUserRecords, getSortConfig],
  (appRecords, userRecords, sortConfig) => {

    const userRecordsById = keyBy(userRecords, r => r.id);

    let finalRecords = appRecords.slice();

    // left join user records to app records
    finalRecords = finalRecords.map(r => ({
      id: r.id,
      attributes: {
        ...r.attributes,
        ...(userRecordsById[r.id] || {}).attributes
      }
    }));

    // sort
    if (sortConfig) {
      finalRecords = sortBy(finalRecords, r => r.attributes[sortConfig.attribute])

      if (sortConfig.direction === "desc") {
        finalRecords = finalRecords.reverse()
      }
    }

    return finalRecords;
  }
)

export const getFinalAttributes = createSelector(
  [getAppAttributes, getUserAttributes],
  (appAttributes, userAttributes) => (appAttributes || []).concat(userAttributes || [])
)
