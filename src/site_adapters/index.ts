// Registry of all the site adapters

import HNAdapter from './hackerNews'
import FluxAdapter from './flux'
// expedia adapter has a css issue with esbuild
// import ExpediaAdapter from './expedia'
import AirbnbAdapter from './airbnb'
import AmazonAdapter from './amazon'
import InstacartAdapter from './instacart'
import UberEatsAdapter from './ubereats'
import BloggerAdapter from './blogger'
import WeatherChannelAdapter from './weatherchannel'
import YoutubeAdapter from './youtube'
import GithubAdapter from './github'
import HarvardBookWarehouse from './harvardbookwarehouse'
import { adapterStore } from '../localStorageAdapter'
import { TableAdapter } from '../core/types'
import { createInitialAdapter } from '../end_user_scraper/adapterHelpers'
import { getCreatingAdapter } from '../end_user_scraper/state'

export const siteAdapters = [
  HNAdapter,
  FluxAdapter,
  // ExpediaAdapter,
  AirbnbAdapter,
  AmazonAdapter,
  InstacartAdapter,
  UberEatsAdapter,
  BloggerAdapter,
  WeatherChannelAdapter,
  YoutubeAdapter,
  GithubAdapter,
  HarvardBookWarehouse
]

export async function getActiveAdapter(): Promise<undefined | TableAdapter> {
  const creatingAdapter = getCreatingAdapter();
  const localAdapters = await adapterStore.getLocalAdapters();
  const adaptersForPage = [
    ...localAdapters,
    ...siteAdapters
  ].filter(adapter => adapter.enabled())

  let activeAdapter;

  if (adaptersForPage.length === 0 && !creatingAdapter) { 
    return undefined; 
  } else if (creatingAdapter) {
    activeAdapter = createInitialAdapter();
  } else {
    activeAdapter = adaptersForPage[0];
  }

  console.log(`Wildcard: activating site adapter: ${activeAdapter.name}`);

  return activeAdapter;
}
