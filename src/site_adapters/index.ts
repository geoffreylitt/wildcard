// Registry of all the site adapters

// import { ExpediaAdapter } from './expedia';
// import { AirbnbAdapter } from './airbnb';
// import { BloggerAdapter } from "./blogger";
// import { UberEatsAdapter } from "./ubereats";
// // import { HNAdapter } from './hackernews';
// import { AmazonAdapter } from './amazon';
// import { WeatherChannelAdapter } from "./weatherchannel";
// import { YoutubeAdapter } from "./youtube";
// import { InstacartAdapter } from "./instacart";

// export const oldSiteAdapters = [
//   ExpediaAdapter,
//   AirbnbAdapter,
//   BloggerAdapter,
//   UberEatsAdapter,
//   AmazonAdapter,
//   WeatherChannelAdapter,
//   YoutubeAdapter,
//   InstacartAdapter
// ]

import HNAdapter from './newHN'

export const siteAdapters = [
  HNAdapter
]

export function getActiveAdapter():any {
  const adaptersForPage = siteAdapters.filter(adapter => adapter.enabled())

  if (adaptersForPage.length === 0) { return undefined; }

  const activeAdapter = new adaptersForPage[0]();

  console.log(`Wildcard: activating site adapter: ${activeAdapter.siteName}`);

  return activeAdapter;
}
