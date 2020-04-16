/** This is the output file that the browser runs on each page.
 *   It compiles the framework and all the site adapters into one file.
 */

'use strict';

import React from "react";
import { render } from "react-dom";
import { createStore, compose, applyMiddleware } from "redux";
import { Provider } from 'react-redux'
import { composeWithDevTools } from 'redux-devtools-extension';
import { loadRecords, setAppAttributes } from './core/actions';
import reducer from './core/reducer';
import { debugMiddleware } from './core/debug'
import { updateTableStoreMiddleware } from './tableStoreMiddleware'
import { htmlToElement } from './utils'
import WcPanel from "./ui/WcPanel";
import { getActiveAdapter } from "./site_adapters"
import userStore from "./user-store"

/**
  This is a test
*/
const run = function () {
  const activeSiteAdapter = getActiveAdapter();
  if (!activeSiteAdapter) { return; }

  // Add extra space to the bottom of the page for the wildcard panel
  // todo: move this elsewhere?
  document.querySelector("body").style["margin-bottom"] = "300px";

  // Create our redux store
  const store = createStore(reducer, composeWithDevTools(
    applyMiddleware(debugMiddleware),
    applyMiddleware(updateTableStoreMiddleware(activeSiteAdapter)),
    applyMiddleware(updateTableStoreMiddleware(userStore))
  ));

  // Set attributes on the app table based on the adapter
  store.dispatch(setAppAttributes(activeSiteAdapter.colSpecs));

  // Subscribe to app data updates from the adapter
  activeSiteAdapter.subscribe(records => store.dispatch(loadRecords(records)) )

  // Initialize the container for our view
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
