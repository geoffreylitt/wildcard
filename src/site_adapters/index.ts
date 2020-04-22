// Registry of all the site adapters

import HNAdapter from './hackerNews'
import FluxAdapter from './flux'
import ExpediaAdapter from './expedia'
import AirbnbAdapter from './airbnb'
import { Table, Record, SortConfig, recordId, Attribute } from '../core/types'

export const siteAdapters = [
  HNAdapter,
  FluxAdapter,
  ExpediaAdapter,
  AirbnbAdapter
]

export function getActiveAdapter():any {
  const adaptersForPage = siteAdapters.filter(adapter => adapter.enabled())

  if (adaptersForPage.length === 0) { return undefined; }

  const activeAdapter = adaptersForPage[0];

  console.log(`Wildcard: activating site adapter: ${activeAdapter.name}`);

  return activeAdapter;
}
