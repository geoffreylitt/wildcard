'use strict';

// A sample new HN site adapter.

import { urlExact, urlContains, extractNumber } from "../utils";
import { createDomScrapingAdapter } from "./domScrapingBase"

// Configuration options for the Hacker News adapter
const HarvardBookWarehouse = createDomScrapingAdapter({
  name: "Harvard Book Warehouse",
  enabled() {
    return urlContains("https://hbswarehousesale.com/")
  },
  attributes: [
    { name: "id", type: "text", hidden: true },
    { name: "title", type: "text" },
    { name: "priceRegular", type: "numeric" },
    { name: "priceSale", type: "numeric" },
    { name: "soldOut", type: "checkbox" },
  ],
  scrapePage() {
    return Array.from(document.querySelectorAll(".grid__item.grid__item--collection-template")).map(el => {
      return {
        id: el.querySelector("a.grid-view-item__link").getAttribute('href'),
        rowElements: [el],
        // todo: Both of these steps should be handled by the framework...
        // .filter(e => e) // Only include if the element is really there
        // .map(e => (e)), // Convert to HTMLElement type
        dataValues: {
          title: el.querySelector("a.grid-view-item__link span.visually-hidden"),
          priceRegular: el.querySelector(".price__regular .price-item--regular"),
          priceSale: el.querySelector(".price__sale .price-item--regular"),
          soldOut: el.querySelector(".price__badge--sold-out") && window.getComputedStyle(el.querySelector(".price__badge--sold-out")).getPropertyValue('display') !== 'none'
        },
        // annotationContainer: el.querySelector("td.subtext") as HTMLElement,
        // annotationTemplate: `| <span style="color: #f60;">$annotation</span>`
      }
    })
  },
  onRowSelected: (row) => {
    row.rowElements.forEach(el => {
      if (el.style) {
        el.style["background-color"] = "#def3ff"
      }
    });
    row.rowElements[0].scrollIntoView({ behavior: "smooth", block: "center" })
  },
  onRowUnselected: (row) => {
    row.rowElements.forEach(el => {
      if (el.style) {
        el.style["background-color"] = ``
      }
    })
  },
})

export default HarvardBookWarehouse;
