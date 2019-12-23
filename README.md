# Wildcard

A prototype that maps website data to a table, enabling end users to modify and reprogram the site.

Early demo video: https://www.loom.com/share/cab62c8172404c39bebc4c511a60a389

## Dev instructions

Uses yarn and rollup for packages and bundling.

To start a rollup watcher that builds the project: `yarn run rollup` 

To generate and open docs: `yarn run docs`

Use Tampermonkey to load site-specific built files: `dist/datepicker.js`, `dist/airbnb.js`, etc.