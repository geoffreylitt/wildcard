// This is the output file that the browser runs on each page.
// It compiles the framework and all the site adapters into one file.

'use strict';

import React from "react";
import { render } from "react-dom";
import { combineReducers, createStore, compose } from "redux";
import { Provider } from 'react-redux'
import { devToolsEnhancer } from 'redux-devtools-extension';

import WcPanel from "./components/WcPanel";

import { getActiveAdapter } from "./site_adapters"

import "./wildcard.css";

function htmlToElement(html):HTMLElement {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild as HTMLElement;
}

const run = function () {
  const activeAdapter = getActiveAdapter();

  if (!activeAdapter) { return; }

  const initialTableState = [
    { id: 1, text: "hello" },
    { id: 2, text: "world" },
  ]

  const tableData = (state = initialTableState, action) => {
    switch(action.type) {
      case "CHANGE_DATA":
        console.log('times are a changin');
        return [
          { id: 1, text: "new" },
          { id: 2, text: "data" },
        ]

      default:
        return state;
    }
  }

  const rootReducer = combineReducers({ tableData });
  const reduxStore = createStore(
    rootReducer,
    devToolsEnhancer({})
  );

  const newDiv = htmlToElement("<div id='wildcard-container'><div id='wc-panel-container'></div></div>") as HTMLElement

  document.body.appendChild(newDiv);

  render(
    <Provider store={ reduxStore }>
      <WcPanel />
    </Provider>,
    document.getElementById("wc-panel-container")
  );

}

run()
