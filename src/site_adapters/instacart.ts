'use strict';

import {urlContains} from "../utils";

export const InstacartAdapter = createDomScrapingAdapter({
  name: "Instacart",
  enable: () => {
    return urlContains("instacart.com/store/orders")
  },
  colSpecs: [
    // { name: "id", type: "text" },
    { name: "name", type: "text" },
    { name: "price", type: "numeric" },
    { name: "quantity", type: "numeric" },
  ],
  getDataRows: () => {
    return Array.from(document.querySelectorAll("li.order-status-item")).map (el => {
      const itemName = el.querySelector("div.order-status-item-details h5").textContent;
      const itemPrice = el.querySelector("div.order-status-item-price p").textContent.substring(1);
      const itemQuantity = el.querySelector("div.icDropdown button span").textContent;

      return {
        id: itemName,
        els: [el as HTMLElement],
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
