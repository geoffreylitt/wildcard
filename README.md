# Wildcard

A prototype that maps website data to a table, enabling end users to modify and reprogram the site.

Early demo video: https://www.loom.com/share/cab62c8172404c39bebc4c511a60a389

## Dev instructions

Uses yarn and rollup for packages and bundling.

To start a rollup watcher that builds the project: `yarn run rollup` 

To generate and open docs: `yarn run docs`

Main docs for building a Wildcard plugin: [[createTable]]

Use Tampermonkey to load site-specific built files: `dist/datepicker.js`, `dist/airbnb.js`, etc.

## To get started:

* Install Tampermonkey
* install [yarn](https://legacy.yarnpkg.com/en/docs/install/#mac-stable)
* install [rollup](https://rollupjs.org/guide/en/)
* yarn install
* yarn run rollup

Create a Tampermonkey user script with this preamble.
Replace the filepath at the bottom of the preamble to point to your folder.

```
// ==UserScript==
// @name         Wildcard Datepicker
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  fill in dates on expedia
// @author       glitt
// @match        https://www.expedia.com/*
// @match
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_openInTab

// REPLACE THIS WITH PATH TO YOUR WILDCARD DIRECTORY
// @require      file:///Users/geoffreylitt/dev/wildcard/dist/datepicker.js
// ==/UserScript==

```