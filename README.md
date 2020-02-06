# Wildcard

A prototype that maps website data to a table, enabling end users to modify and reprogram the site.

Early demo video: https://www.loom.com/share/cab62c8172404c39bebc4c511a60a389

## To use Wildcard

[Follow these instructions](https://developer.chrome.com/getstarted) to install the Wildcard dev directory as an unpacked chrome extension.

To test whether it's working: try an [Airbnb search](https://www.airbnb.com/s/Miami/homes?checkin=2019-11-14&checkout=2019-11-17&adults=1&children=0&infants=0&place_id=ChIJEcHIDqKw2YgRZU-t3XHylv8&refinement_paths%5B%5D=%2Fhomes&search_type=section_navigation); the table should appear at the bottom and you should be able to sort by price.

## To develop on Wildcard

Wildcard is built in Typescript and uses yarn and rollup for packages and bundling.

### Initial setup

* install [yarn](https://legacy.yarnpkg.com/en/docs/install/#mac-stable) and [rollup](https://rollupjs.org/guide/en/)
* `yarn install` to install dependencies

### Dev workflow

Every time you develop, follow these steps. If a change you make isn't having an effect, it's probably related to these steps:

* `yarn run rollup` to start a watcher that builds the project.
  * Compilation can take a few seconds. If a change isn't working, it might be that compilation didn't finish yet. (Improving compilation time is a todo; I think it's mostly time spent compiling Handsontable)
* You must click Reload in the chrome extensions menu to apply each code change.
  * (Todo: can we find a way around this? I was using Tampermonkey previously to avoid this, but there were some issues getting it working on other people's computer)

To test if you're able to make changes, try adding a `console.log` statement to a site adapter file like `src/site_adapters/airbnb.ts` and see if it works.

### File layout

`src/wildcard.ts` contains the core framework.

Site adapters are in `src/site_adapters`. Cell editors are in `src/cell_editors`.