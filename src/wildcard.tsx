/** This is the output file that the browser runs on each page.
 *   It compiles the framework and all the site adapters into one file.
 */

'use strict';

import React from "react";
import { render } from "react-dom";
import { createStore, applyMiddleware, bindActionCreators } from "redux";
import { Provider, connect } from 'react-redux'
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from './core/reducer';
import { debugMiddleware } from './core/debug'
import { htmlToElement } from './utils'
import WcPanel from "./ui/WcPanel";
import { getActiveAdapter } from "./site_adapters"
import { userStore as userTableAdapter } from "./localStorageAdapter"
import thunk from 'redux-thunk';
import { initializeActions } from './core/actions'
import { getFinalRecords, getFinalAttributes } from './core/getFinalTable'
import { TableAdapterMiddleware } from './tableAdapterMiddleware'
import { startScrapingListener, stopScrapingListener, resetScrapingListener, editScraper } from './end_user_scraper';
import { setCachedActiveAdapter } from "./end_user_scraper/state";

// todo: move this out of this file
const connectRedux = (component, actions) => {
  const mapStateToProps = state => ({
    // todo: when we have non-app records and attributes,
    // merge them in the redux state, and pass in merged data here --
    // this panel view isn't responsible for combining them.
    // keep this component thin.
    records: getFinalRecords(state),
    attributes: getFinalAttributes(state),
    query: state.query
  })

  const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
  })

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(component)
}

export const run = async function ({ creatingAdapter }) {
  //console.log("Re-running adapter")
  const wcRoot = document.getElementById('wc--root');
  if (wcRoot) {
    wcRoot.remove();
  }
  const activeSiteAdapter = await getActiveAdapter({ creatingAdapter });
  if (!activeSiteAdapter) { return; }

  activeSiteAdapter.initialize();

  userTableAdapter.initialize(activeSiteAdapter.name)

  const tables = { app: activeSiteAdapter, user: userTableAdapter }

  // pass our TableAdapter objects into action creators,
  // so action creator functions can access them.
  const actions = initializeActions(tables)

  // stash active adapter if we are in creation mode
  if (creatingAdapter) {
    setCachedActiveAdapter(activeSiteAdapter);
  }

  // Add extra space to the bottom of the page for the wildcard panel
  // todo: move this elsewhere?
  document.querySelector("body").style["margin-bottom"] = "300px";

  // Create our redux store
  const store = createStore(reducer, composeWithDevTools(
    applyMiddleware(thunk),
    applyMiddleware(TableAdapterMiddleware(activeSiteAdapter)),
    applyMiddleware(TableAdapterMiddleware(userTableAdapter)),
    applyMiddleware(debugMiddleware),
  ));

  // Subscribe to app data updates from the site adapter and user store
  activeSiteAdapter.subscribe(table =>
    store.dispatch(actions.tableReloaded(table))
  )

  userTableAdapter.subscribe(table =>
    store.dispatch(actions.tableReloaded(table))
  )

  // todo: wrap storage stuff in a module

  // Load saved query (including sorting)
  chrome.storage.local.get(`query:${activeSiteAdapter.name}`, (result) => {
    const query = result[`query:${activeSiteAdapter.name}`]
    if (query) {
      store.dispatch(actions.sortRecords(query.sortConfig))
    } else {
      console.log("no query")
    }
  })

  // save the query in local storage when it updates
  store.subscribe(() => {
    const state = store.getState();
    const queryToStore = { [`query:${activeSiteAdapter.name}`]: state.query }
    chrome.storage.local.set(queryToStore)
  })

  // Initialize the container for our view
  document.body.appendChild(
    htmlToElement(`<div id='wc--root'></div>`) as HTMLElement);

  // in the future, rather than hardcode WcPanel here,
  // could dynamically choose a table editor instrument
  const TableEditor = connectRedux(WcPanel, actions)

  render(
    <Provider store={store}>
     <TableEditor adapter={activeSiteAdapter} creatingAdapter={creatingAdapter} />
    </Provider>,
    document.getElementById("wc--root")
  );

}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request.command) {
    case 'createAdapter':
      startScrapingListener();
      break;
    case 'saveAdapter':
      stopScrapingListener({ save: true });
      break;
    case 'deleteAdapter':
      stopScrapingListener({ save: false });
      break;
    case 'resetAdapter':
      resetScrapingListener();
      break;
    case 'editAdapter':
      editScraper();
      break;
    default:
      break;
  }
});

run({ creatingAdapter: false });