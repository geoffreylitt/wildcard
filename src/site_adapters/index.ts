// Registry of all the site adapters

import { ExpediaAdapter } from './expedia';
import { AirbnbAdapter } from './airbnb';
import { BloggerAdapter } from "./blogger";
import { UberEatsAdapter } from "./ubereats";
import { HNAdapter } from './hackernews';
import { AmazonAdapter } from './amazon';
import { WeatherChannelAdapter } from "./weatherchannel";
import { YoutubeAdapter } from "./youtube";
import { InstacartAdapter } from "./instacart";

export const siteAdapters = [
  ExpediaAdapter,
  AirbnbAdapter,
  BloggerAdapter,
  HNAdapter,
  UberEatsAdapter,
  AmazonAdapter,
  WeatherChannelAdapter,
  YoutubeAdapter,
  InstacartAdapter
]

export function getActiveAdapter() {
  const adaptersForPage = siteAdapters.filter(adapter => adapter.enable())

  if (adaptersForPage.length === 0) { return undefined; }

  const activeAdapter = adaptersForPage[0];

  console.log(`Wildcard: activating site adapter: ${activeAdapter.name}`);
  return activeAdapter;
}

// Definition of what an adapter has to define

/**
* Defines the schema for one column of the table being extracted.
*/
interface ColSpec {
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

  /** Is this a formula column? */
  formula?: boolean;

  /** Is this a column added by the user to the table? */
  userCol?: boolean;

  /** If a user column, should it display in the page? */
  showUserCol?: boolean;
}

type DataValue = string | number | boolean

// Todo:
// There are checks in the code for whether a PageValue is an element;
// e.g. for updating values in the page or for highlighting values in the page.
// A more principled way would be to use tagged unions and "pattern match".
// (although it's a bit annoying that we have to manually add tags in our
// runtime data to get this to work...)
// More info here: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions

/** A data value extracted from the page.
*   There are two options for specifying a value:
*
*   * Element: You can specify a DOM element and Wildcard will extract its
*     contents. If the column is writable, Wildcard will also replace the
*     contents of the DOM element when the value is edited in the table.
*   * [[DataValue]] You can run arbitrary code (e.g. regexes) to
*     extract a value from the DOM and show it in the table.
*     **Not compatible with editable columns.**
*     Note on types: the data type specified in the colSpec will ultimately
*     determine how the value gets displayed.
*/
type PageValue = Element | DataValue

/** A data structure representing a row of data from the page.
*   Must specify both an HTML element and an object containing data values.
*   (The HTML element is used for things like highlighting and sorting rows.)
*/
interface DataRow {
  /** The element(s) representing the row */
  // todo: use the full tagged union style here, rather than bare sum type,
  // to get exhaustiveness checking everywhere
  els: Array<HTMLElement>;

  /** A stable ID for the row */
  id: any;

  /** The data values for the row, with column names as keys */
  dataValues: { [key: string]: PageValue };

  /** A container for adding user annotations */
  annotationContainer?: HTMLElement;

  /** The actual div for storing annotations in.
   *  Maintained internally by the framework, no need to set in the site adapter
  */
  annotationTarget?: HTMLElement

  /** An HTML template for storing an annotation on this row.
   *  should include "$annotation", which will be replaced by annotation text
   */
  annotationTemplate?: string;
}

/** A site adapter describes how to extract data from a specific website.
*   See examples of existing adapters in `src/site_adapters`.
*
*   To create a new site adapter, copy an existing site adapter file, e.g.
*   `src/site_adapters/airbnb.ts`, and mimic the format of that file.
*   Use these docs below for more info on the various settings.
*
*   To activate your adapter, register it in `src/wildcard.ts`:
*
*   ```
*   import { AirbnbAdapter } from './site_adapters/airbnb';
*
*   const siteAdapters = [
*   //...
*   AirbnbAdapter
*   //...
*   ]
*   ```
*
*  You'll probably find it helpful to register the adapter first, and then
*  you can insert console log statements in your getDataRows() function to
*  start debugging your data extraction.
*/

export interface SiteAdapter {
  /** A user visible name for the adapter */
  name: string;

  // todo: bring back a short form of enable that just specifies URLs?
  /** Returns true if the adapter should run on this page.
  *   Should be as fast as possible; usually a URL substring check is enough.
  *   If needed, can perform arbitrary checks on the page as well.
  */
  enable():boolean;

  /** A schema for the columns; see [[ColSpec]] for details.
  *  The first [[ColSpec]] in the array must be named "id" and contain
  *  a stable identifier for the row, e.g. a server-provided ID.
  *  (todo: write more about what to do if that's not available.)
  */
  colSpecs: Array<ColSpec>;

  /** Return the extracted data from the page. See [[DataRow]] for details. */
  getDataRows(): Array<DataRow>;

  /** React to live changes in the page and trigger data reloads.
  *
  * Wildcard has some default behavior to react to changes in the page,
  * but it doesn't handle all cases.
  *
  * In this function you can add site-specific handlers
  * (e.g. listening for click events) which listen for relevant changes.
  * When a change occurs, call the `reload` callback, which will reload data
  * from the page.
  *
  * If the adapter doesn't need to react to live changes, this can be omitted.
  */
  setupReloadTriggers?(reload: any): any;

  /** Return element containing the rows.
  * If not provided, default container is the parent element of the first row,
  * which often works fine.
  */
  getRowContainer?(): HTMLElement;

  /** Does this site adapter deal with iframes?
      (Enables special handling of certain HTML elements, which doesn't
       work well on all sites) */
  iframe?: boolean;
}
