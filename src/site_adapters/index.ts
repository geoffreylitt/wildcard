// Registry of all the site adapters

import HNAdapter from './newHN'
import FluxAdapter from './flux'
import ExpediaAdapter from './expedia'
import { Table, Record, SortConfig, id, AttrSpec } from '../core/types'

export const siteAdapters = [
  HNAdapter,
  FluxAdapter,
  ExpediaAdapter
]

export function getActiveAdapter():any {
  const adaptersForPage = siteAdapters.filter(adapter => adapter.enabled())

  if (adaptersForPage.length === 0) { return undefined; }

  const activeAdapter = new adaptersForPage[0]();

  console.log(`Wildcard: activating site adapter: ${activeAdapter.siteName}`);

  return activeAdapter;
}

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
  editRecord(id:id, newValues:any, userAttributes:Array<AttrSpec>):void;

  // I'm considering replacing the two functions above with a generalized
  // version that can apply arbitrary table state to the UI:

  /** Update the UI to match arbitrary table state
   *  (To implement performantly, probably do a diff inside the adapter
   *  and only update the UI where necessary) */
  // update?(table:Table):void;
}
