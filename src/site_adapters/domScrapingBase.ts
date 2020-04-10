'use strict';

import { urlExact, urlContains, extractNumber } from "../utils";
import mapValues from "lodash/mapValues";

function onDomReady(fn) {
  if (document.readyState!='loading') fn();
  else document.addEventListener('DOMContentLoaded', fn)
}

// convert scraper-internal data structure to
// the standard format for all wildcard adapters
function convertScrapedElementsToRecords(elements) {
  // hmm, don't love creating parallel data structures for values + elements;
  // maybe better:
  // * user constructs just elements
  // * base DOMScrapingAdapter constructs elements + values
  // * base DOMScrapingAdapter uses that to output the "just values" version
  return elements.map(el => ({
    id: el.id,
    attributes: mapValues(el.attributes, value => {
      if (value instanceof HTMLElement) {
        return value.textContent;
      } else {
        return value;
      }
    })
  }))
}

class DomScrapingBaseAdapter {
  scrapedElements: any;

  constructor() {
    this.scrapedElements = null;
  }

  loadRecords() {
    this.scrapedElements = this.scrapePage();
    return convertScrapedElementsToRecords(this.scrapedElements);
  }

  // Currently, just load data once on dom ready
  // todo: reload data on different triggers
  subscribe (callback) {
    onDomReady(() => callback(this.loadRecords()))
  }

  scrapePage() {
    throw("Not implemented, child class must override.")
  }

  // todo: support incoming events like sort, annotate
}

export default DomScrapingBaseAdapter;

