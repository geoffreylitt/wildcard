import { combineReducers } from 'redux';
import appRecords from "./appRecords"
import appAttributes from "./appAttributes"
import sortOrder from "./sortOrder"

const rootReducer = combineReducers({ appRecords, appAttributes, sortOrder });

export default rootReducer;
