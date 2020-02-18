'use strict';

import { createTable } from './core'
import { ExpediaAdapter } from './site_adapters/expedia';
import { AirbnbAdapter } from './site_adapters/airbnb';
import {BloggerAdapter} from "./site_adapters/blogger";

const siteAdapters = [
ExpediaAdapter,
AirbnbAdapter,
    BloggerAdapter
]

const run = function () {
  // super simple substring check for now
  let adaptersForPage = siteAdapters.filter(adapter => {
    return (String(window.location).indexOf(adapter.urlPattern) !== -1)
  })

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
