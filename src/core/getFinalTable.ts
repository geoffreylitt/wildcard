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
import { Attribute, Record, SortConfig } from './types';

const getAppRecords = (state:RootState):Record[] => state.appTable.records
const getAppAttributes = (state:RootState): Attribute[] => state.appTable.attributes

const getUserRecords = (state:RootState):Record[] => state.userTable.records
const getUserAttributes = (state:RootState):Attribute[] => state.userTable.attributes

const getSortConfig = (state:RootState):SortConfig => state.query.sortConfig
const getFormulaResults = (state:RootState):any => state.formulaResults

// todo: this selector is just cached on the whole state --
// probably pointless to use this selector concept here?
export const getFinalRecords = createSelector(
  [getAppRecords, getUserRecords, getAppAttributes, getUserAttributes, getSortConfig, getFormulaResults],
  (appRecords, userRecords, appAttributes, userAttributes, sortConfig, formulaResults) => {

    const userRecordsById = keyBy(userRecords, r => r.id);

    let finalRecords = appRecords.slice().map(r => {
      // join app records to user records
      const finalRecord = {
        id: r.id,
        values: {
          ...r.values,
          ...(userRecordsById[r.id] || {}).values
        }
      }

      // add formula results to the table, where available.
      // (any missing results are still in process of being computed,
      // and we'll re-run the reducer once they are available)
      userAttributes.filter(attr => attr.formula).forEach(attr => {
        const result = formulaResults?.[finalRecord.id]?.[attr.name]
        if(result !== undefined) {
          finalRecord.values[attr.name] = result
        }
      })

      return finalRecord
    })

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
  [getAppAttributes, getUserAttributes, getFormulaResults],
  (appAttributes, userAttributes, formulaResults) => {
    // annotate attrs with a table id
    appAttributes = (appAttributes || []).map( a => ({ ...a, tableId: "app" }))
    userAttributes = (userAttributes || []).map(a => ({ ...a, tableId: "user" }))

    // set column type for formulas based on first row
    userAttributes.forEach(attr => {
      if(attr.formula) {
        const formulaResultsKeys = Object.keys(formulaResults)
        if (formulaResultsKeys.length) {
          const sampleValue = formulaResults[formulaResultsKeys[0]][attr.name]
          if(typeof sampleValue === 'number') {
            attr.type = "numeric"
          } else if (typeof sampleValue === 'boolean') {
            attr.type = "checkbox"
          } else if (sampleValue instanceof HTMLElement) {
            attr.type = "element"
          } else {
            attr.type = "text"
          }
        } 
      }
    })

    return appAttributes.concat(userAttributes)
  }
)
