'use strict';

import { urlContains, extractNumber } from "../utils"

const rowContainerClass = "_fhph4u"
const rowClass = "_8ssblpx"
const titleClass = "_1jbo9b6h"
const priceClass = "_1p7iugi"
const ratingClass = "_3zgr580"
const listingLinkClass = "_i24ijs"

export const AirbnbAdapter = {
  name: "Airbnb",
  enable: () => urlContains("airbnb.com/s/"),
  colSpecs: [
  { name: "id", type: "text" },
  { name: "name", type: "text" },
  { name: "price", type: "numeric" },
  { name: "rating", type: "numeric" }
  ],
  getDataRows: () => {
    return Array.from(document.getElementsByClassName(rowClass)).map(el => {
      let path = el.querySelector("." + listingLinkClass).getAttribute('href')
      let id = path.match(/\/rooms\/([0-9]*)\?/)[1]

      return {
        els: [el as HTMLElement],
        dataValues: {
          id: id,
          name: el.querySelector(`.${titleClass}`),
          price: el.querySelector(`.${priceClass}`).textContent.match(/\$([\d]*)/)[1],
          rating: extractNumber(el.querySelector(`.${ratingClass}`))
        }
      }
    })
  },
  setupReloadTriggers: (reload) => {
    document.addEventListener("click", (e) => { reload() })
  }
}

