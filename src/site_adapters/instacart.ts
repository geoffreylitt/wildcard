'use strict';

import {urlContains} from "../utils";

export const InstacartAdapter = createDomScrapingAdapter({
  name: "Instacart",
  enabled () => {
    return urlContains("instacart.com/store/orders")
  },
  attributes: [
    // { name: "id", type: "text" },
    { name: "name", type: "text" },
    { name: "price", type: "numeric" },
    { name: "quantity", type: "numeric" },
  ],
  scrapePage: () => {
    return Array.from(document.querySelectorAll("li.order-status-item")).map (el => {
      const itemName = el.querySelector("div.order-status-item-details h5").textContent;
      const itemPrice = el.querySelector("div.order-status-item-price p").textContent.substring(1);
      const itemQuantity = el.querySelector("div.icDropdown button span").textContent;

      return {
        id: itemName,
        rowElements: [el],
        dataValues: {
          name: itemName,
          price: itemPrice,
          quantity: itemQuantity
        }
      }
    })
  },
});

export default InstacartAdapter;
