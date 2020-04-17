/** This is the output file that the browser runs on each page.
 *   It compiles the framework and all the site adapters into one file.
 */

'use strict';

import React from "react";
import { render } from "react-dom";
import { createStore, compose, applyMiddleware, bindActionCreators } from "redux";
import { Provider, connect } from 'react-redux'
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from './core/reducer';
import { debugMiddleware } from './core/debug'
import { htmlToElement } from './utils'
import WcPanel from "./ui/WcPanel";
import { getActiveAdapter } from "./site_adapters"
import userTableStore from "./userTableStore"
import thunk from 'redux-thunk';
import { initializeActions } from './core/actions'
import { getFinalRecords, getFinalAttributes } from './core/getFinalTable'
import { tableStoreMiddleware } from './tableStoreMiddleware'

// todo: move this out of this file
const connectRedux = (component, actions) => {
  const mapStateToProps = state => ({
    // todo: when we have non-app records and attributes,
    // merge them in the redux state, and pass in merged data here --
    // this panel view isn't responsible for combining them.
    // keep this component thin.
    records: getFinalRecords(state),
    attributes: getFinalAttributes(state)
  })

  const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
  })

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(component)
}

const run = function () {
  const activeSiteAdapter = getActiveAdapter();
  if (!activeSiteAdapter) { return; }

  const tables = { app: activeSiteAdapter, user: userTableStore }

  // pass our TableStore objects into action creators,
  // so action creator functions can access them.
  const actions = initializeActions(tables)

  // Add extra space to the bottom of the page for the wildcard panel
  // todo: move this elsewhere?
  document.querySelector("body").style["margin-bottom"] = "300px";

  // Create our redux store
  const store = createStore(reducer, composeWithDevTools(
    applyMiddleware(thunk),
    applyMiddleware(tableStoreMiddleware(activeSiteAdapter)),
    applyMiddleware(tableStoreMiddleware(userTableStore)),
    applyMiddleware(debugMiddleware),
  ));

  // Subscribe to app data updates from the site adapter and user store
  activeSiteAdapter.subscribe(table =>
    store.dispatch(actions.tableReloaded(table))
  )

  userTableStore.subscribe(table =>
    store.dispatch(actions.tableReloaded(table))
  )

  // Initialize the container for our view
  document.body.appendChild(
    htmlToElement(`<div id='wc--root'></div>`) as HTMLElement);

  // in the future, rather than hardcode WcPanel here,
  // could dynamically choose a table editor instrument
  const TableEditor = connectRedux(WcPanel, actions)

  render(
    <Provider store={store}>
      <TableEditor />
    </Provider>,
    document.getElementById("wc--root")
  );

}

run()
