// This is the output file that the browser runs on each page.
// It compiles the framework and all the site adapters into one file.

'use strict';

import { createTable } from './core'
import { ExpediaAdapter } from './site_adapters/expedia';
import { AirbnbAdapter } from './site_adapters/airbnb';
import {BloggerAdapter} from "./site_adapters/blogger";
import {UberEatsAdapter} from "./site_adapters/ubereats";
import { HNAdapter } from './site_adapters/hackernews';
import { AmazonAdapter } from './site_adapters/amazon';
import {WeatherChannelAdapter} from "./site_adapters/weatherchannel";
import {YoutubeAdapter} from "./site_adapters/youtube";
import { InstacartAdapter } from "./site_adapters/instacart";

const siteAdapters = [
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

const run = function () {
  // super simple substring check for now
  let adaptersForPage = siteAdapters.filter(adapter => adapter.enable())

  if (adaptersForPage.length === 0) { return; }
  if (adaptersForPage.length > 1) {
    let activeAdapter = adaptersForPage[0]
    console.log(`Wildcard: Multiple adapters matched this site: ${adaptersForPage.map(a => a.name)}`)
  }

  let activeAdapter = adaptersForPage[0]
  console.log(`Wildcard: activating site adapter: ${activeAdapter.name}`)

  createTable(activeAdapter)
}

run()
