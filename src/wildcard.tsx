// This is the output file that the browser runs on each page.
// It compiles the framework and all the site adapters into one file.

'use strict';

import React from "react";
import { render } from "react-dom";
import { createStore, compose } from "redux";
import { Provider } from 'react-redux'
import { devToolsEnhancer } from 'redux-devtools-extension';
import { loadRecords, setAppAttributes } from './actions';
import reducer from './reducers';

import WcPanel from "./components/WcPanel";

import { getActiveAdapter } from "./site_adapters"

function htmlToElement(html):HTMLElement {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild as HTMLElement;
}

const run = function () {
  const activeAdapter = getActiveAdapter();
  if (!activeAdapter) { return; }

  const store = createStore(reducer, devToolsEnhancer({}));

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
