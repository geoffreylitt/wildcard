import { combineReducers } from 'redux';
import appRecords from "./appRecords"
import appAttributes from "./appAttributes"

const rootReducer = combineReducers({ appRecords, appAttributes });

export default rootReducer;
