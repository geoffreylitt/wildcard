'use strict';

import { urlContains } from "../utils";
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
        dataValues: {
          title: el.querySelector("a.grid-view-item__link span.visually-hidden"),
          priceRegular: el.querySelector(".price__regular .price-item--regular"),
          priceSale: el.querySelector(".price__sale .price-item--regular"),
          soldOut: el.querySelector(".price__badge--sold-out") &&
            window.getComputedStyle(el.querySelector(".price__badge--sold-out")).getPropertyValue('display') !== 'none'
        },
      }
    })
  },
})

export default HarvardBookWarehouse;
