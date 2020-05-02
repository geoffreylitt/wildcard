'use strict';

import { urlContains, extractNumber } from "../utils"
import { createDomScrapingAdapter } from "./domScrapingBase"

const rowContainerClass = "_fhph4u"
const rowClass = "_8ssblpx"
const titleClass = "_1jbo9b6h"
const priceClass = "_1p7iugi"
const ratingClass = "_3zgr580"
const listingLinkClass = "_i24ijs"

const AirbnbAdapter = createDomScrapingAdapter({
  name: "Airbnb",
  enabled: () => urlContains("airbnb.com/s"),
  attributes: [
  { name: "id", type: "text" },
  { name: "name", type: "text" },
  { name: "price", type: "numeric" },
  { name: "rating", type: "numeric" },
    {name: "latitude", type: "numeric"},
    {name: "longitude", type: "numeric"}
  ],
  scrapePage: () => {
    return Array.from(document.getElementsByClassName(rowClass)).map(el => {
      let path = el.querySelector("." + listingLinkClass).getAttribute('href')
      let id = path.match(/\/rooms\/([0-9]*)\?/)[1]

      return {
        id: id,
        rowElements: [el],
        dataValues: {
          name: el.querySelector(`.${titleClass}`),
          price: el.querySelector(`.${priceClass}`).textContent.match(/\$([\d]*)/)[1],
          rating: extractNumber(el.querySelector(`.${ratingClass}`))
        }
      }
    })
  },
  scrapeAjax: (request) => {
    if(request.url.includes("https://www.airbnb.com/api/v3?")){
        try{
          let listings = request.data.data.dora.exploreV3.sections["1"].items;
          return Object.keys(listings).map(key => {
            let listing = listings[key].listing;

            return {
              id: listing.id,
              dataValues: {
                latitude: listing.lat,
                longitude: listing.lng
              }
            }
          });
        }
        catch{

        }
    }
    return undefined;
  },
});

export default AirbnbAdapter;

