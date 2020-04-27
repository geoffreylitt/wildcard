# Understanding the codebase

!> This doc is only intended for people who want to hack on
the internals of Wildcard. If you just want to add a site adapter
to scrape a specific site, see [Adding a scraper](add-scraper.md)

## Background

It helps to understand the basic ideas of React + Redux to understand this codebase. Some good introductory reads:

* [Redux core concepts](https://redux.js.org/introduction/core-concepts)
* [Redux data flow](https://redux.js.org/basics/data-flow)
* [Thinking in React](https://reactjs.org/docs/thinking-in-react.html)

The code is split into three main modules, each with their own directory inside `src`. Here's a quick overview of the contents of each module.

![](readme-resources/architecture-v02.png)

## Core

Maintains system state. Defines Redux actions and reducers.

The root state object looks something like this.

```ts
{
  // Latest snapshot of data extracted from the original site.
  appTable: {
    attributes: [...], // columns of the table
    records: [...], // rows of the table
  },
  // All the user's annotations and formulas associated with this site
  userTable: {
    attributes: [...],
    records: [...],
  },
  // Configuration for the current "query" being shown:
  // * sorting metadata
  // * filtering metadata (not added yet)
  query: {
    sortConfig: {
      attribute: "name",
      direction: "asc"
    }
  }
}
```

### Assembling query views

Note how the app's data and user's data are stored independently.
Before we can display it in the table UI, we need to combine it together.

The core contains logic for executing "queries" that
combine data extracted from the original site with
data maintained by the user, and sort/filter the result.
The query results aren't stored anywhere; they get recomputed
every time the underlying state changes in any way. This makes it trivial
to show correct data in the table UI whenever new data comes in,
either from the site adapter or the user.

### Actions

Per the Redux pattern, system state is only modified through specified actions,
which come from the site adapter or the UI.

For example, the site adapter can dispatch a "load records" action when new
data is available, or the UI can dispatch a "sort table" action.

See `src/core/actions.ts` for a full list of actions.

## Site adapters

A Wildcard site adapter connects a specific site/application to Wildcard.
All site adapters must fulfill this abstract interface, which boils down to:

* Read data from the site, updating when necessary
* When data updates (eg user sorts or adds annotations), reify changes in the site

```ts
export interface SiteAdapter {
  // =====================
  // Reading data from the site
  // =====================

  /** Return latest data from the site */
  loadRecords():Array<Record>;

  /** Register a callback function which will be called with a new table
   *  of data anytime the data changes. */
  subscribe (callback:(table:Table) => void):void;

  // =====================
  // Modifying the site UI
  // =====================

  /** Apply a new sort order to the UI */
  applySort(finalRecords:Array<Record>, sortConfig:SortConfig):void;

  /** Apply a new annotation to the UI */
  annotateRecordInSite(id:id, newValues:any, userAttributes:Array<Attribute>):void;

  // I'm considering replacing the two functions above with a generalized
  // version that can apply arbitrary table state to the UI:

  /** Update the UI to match arbitrary table state
   *  (To implement performantly, probably do a diff inside the adapter
   *  and only update the UI where necessary) */
  update?(table:Table):void;
}
```

Currently there's one specific type of site adapter used in the system:
DOM Scraping adapters, which scrape the website DOM to fetch data,
and manipulate the DOM to update the page.

`DomScrapingBaseAdapter` is an abstract base class that new adapters
can inherit from to implement DOM scraping. A concrete DOM scraping adapter
only needs to implement one main function that scrapes data,
and the base class takes care of the rest—
see `src/site_adapters/newHN.ts` for one example of a concrete scraping adapter.

In the future we anticipate having other categories of site adapters,
which will fulfill the same abstract interface with different techniques:

* AJAX Scraping: scrape data out of AJAX JSON requests
* Redux adapter: extract data directly out of the application's internal Redux store

## UI

A Wildcard UI has these responsibilities:

* Display the table resulting from a query
* Dispatch semantic events based on user interactions

Currently there's just one UI, the `WcPanel` React Component that is a stateless table editor
component built on Handsontable. (`src/ui/WcPanel.tsx`)

The most important thing to realize is that the UI is **stateless**.
It is a pure function of the Redux state, and displays the "query view"
computed by the Core. All mutation happens by triggering Redux events.
This makes the UI have minimal responsibility, and allows for future
other UIs that view the tabular data in different ways.

`src/wildcard.ts` is the final file that pulls everything together and
injects Wildcard into the page.


