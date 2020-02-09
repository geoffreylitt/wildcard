'use strict';

// Obscure class names for various page elements.
// They have remained stable for several months,
// so actually seem unlikely to change regularly.
const rowContainerClass = "_fhph4u"
const rowClass = "_8ssblpx"
const titleClass = "_1jbo9b6h"
const priceClass = "_1p7iugi"
const ratingClass = "_3zgr580"
const listingLinkClass = "_i24ijs"

export const AirbnbAdapter = {
  name: "Airbnb",
  urlPattern: "airbnb.com/s/",
  // Find the divs for the data rows
  getDataRows: () => {
    return Array.from(document.getElementsByClassName(rowClass)).map(el => {
      let path = el.querySelector("." + listingLinkClass) && el.querySelector("." + listingLinkClass).getAttribute('href')
      let id = path.match(/\/rooms\/([0-9]*)\?/) && path.match(/\/rooms\/([0-9]*)\?/)[1]

      return {
        el: el as HTMLElement,
        dataValues: {
          id: id,
          name: el.querySelector(`.${titleClass}`).textContent,
          price: el.querySelector(`.${priceClass}`).textContent.match(/\$([\d]*)/)[1],
          rating: el.querySelector(`.${ratingClass}`).textContent
        }
      }
    })
  },
  // Specify the columns to extract
  colSpecs: [{
    fieldName: "id",
    readOnly: true,
    type: "text"
  },
  {
    fieldName: "name",
    readOnly: true,
    type: "text"
  },
  {
    fieldName: "price",
    readOnly: true,
    type: "numeric"
  },
  {
    fieldName: "rating",
    readOnly: true,
    type: "numeric"
  }],
}

