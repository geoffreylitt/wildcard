// This is the output file that the browser runs on each page.
// It compiles the framework and all the site adapters into one file.

'use strict';

import React from "react";
import { render } from "react-dom";
import { createStore, compose, applyMiddleware } from "redux";
import { Provider } from 'react-redux'
import { composeWithDevTools } from 'redux-devtools-extension';
import { loadRecords, setAppAttributes } from './actions';
import reducer from './reducer';

import WcPanel from "./components/WcPanel";

import { getActiveAdapter } from "./site_adapters"
import "./global.css"

// todo: move typedefs out of this main file
export interface WcRecord {
  id: string;
  attributes: any;
}

/**
* Defines the schema for one column of the table being extracted.
*/
export interface AttrSpec {
  /** The name of this data column, to be displayed in the table */
  name: string;

  /** The type of this column. Can be any
  * [Handsontable cell type](https://handsontable.com/docs/7.3.0/tutorial-cell-types.html).
  * Examples: text, numeric, date, checkbox. */
  type: string;

  /** Allow user to edit this value? Defaults to false.
  *  Making a column editable requires extracting [[PageValue]]s as Elements.*/
  editable?: boolean;

  /** Specify a custom [Handsontable editor](https://handsontable.com/docs/7.3.0/tutorial-cell-editor.html)
  * as a class (see Expedia adapter for an example) */
  editor?: string;

  /** Specify a custom [Handsontable rendererr](https://handsontable.com/docs/7.3.0/demo-custom-renderers.html)
  * as a class (todo: not actually supported yet, but will be soon ) */
  renderer?: string;

  /** Hide this column in the visible table?
  Eg, useful for hiding an ID column that's needed for sorting */
  hidden?: boolean;
}

function htmlToElement(html):HTMLElement {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild as HTMLElement;
}

// todo: move middlwares out of this file
const debugMiddleware = ({ getState }) => next => action => {
  console.log('will dispatch', action)

  // Call the next dispatch method in the middleware chain.
  const returnValue = next(action)

  // todo: this is where we're going to update the state in the extension.
  // (for now, we don't need to do it because the table lives inside the app)
  console.log('state after dispatch', getState())

  return returnValue
}

const updateAdapterMiddleware = (adapter) =>
  ({ getState }) => next => action => {

  // Call the next dispatch method in the middleware chain.
  const returnValue = next(action)

  const newState = getState();

  if (action.type === "SORT_RECORDS") {
    adapter.applySort(newState.finalRecords, newState.sortConfig)
    // for now, we don't care whether it completed or not.
    // in the future, could async receive success/fail here
  }

  return returnValue
}

const run = function () {
  const activeAdapter = getActiveAdapter();
  if (!activeAdapter) { return; }

  const store = createStore(reducer, composeWithDevTools(
    applyMiddleware(debugMiddleware),
    applyMiddleware(updateAdapterMiddleware(activeAdapter))
  ));

  store.dispatch(setAppAttributes(activeAdapter.colSpecs));

  // When the active adapter has new records to load,
  // create a "load records" action and dispatch it to our store
  activeAdapter.subscribe(records => store.dispatch(loadRecords(records)) )

  document.body.appendChild(
    htmlToElement(`<div id='wc--root'></div>`) as HTMLElement);

  render(
    <Provider store={store}>
      <WcPanel />
    </Provider>,
    document.getElementById("wc--root")
  );

}

run()
