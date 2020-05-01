'use strict';

import {urlContains} from "../utils";
import { createDomScrapingAdapter } from "./domScrapingBase"

import './instacart-demo.css'

export const InstacartAdapter = createDomScrapingAdapter({
  name: "Instacart",
  enabled: () => {
    return urlContains("instacart.com/store/orders")
  },
  attributes: [
    // { name: "id", type: "text" },
    { name: "name", type: "text" },
    { name: "price", type: "numeric" },
    { name: "quantity", type: "numeric" },
    { name: "aisle_name", type: "text" },
    { name: "department_name", type: "text" },
    { name: "category", type: "text" },
    { name: "code", type: "text" },
    { name: "allow_replacements", type: "checkbox" },
  ],
  scrapePage: () => {
    return Array.from(document.querySelectorAll("li.order-status-item")).map (el => {
      const itemName = el.querySelector("div.order-status-item-details h5").textContent;
      const itemPrice = el.querySelector("div.order-status-item-price p").textContent.substring(1);

      let itemQuantity = null;
      let quantityDropdown = el.querySelector("div.icDropdown button span");
      let quantityText = el.querySelector("div.order-status-item-qty p");
      if (quantityDropdown) { itemQuantity = quantityDropdown.textContent; }
      else if (quantityText) { itemQuantity = quantityText.textContent; }

      return {
        id: itemName,
        rowElements: [el],
        dataValues: { name: itemName, price: itemPrice, quantity: itemQuantity },
        annotationContainer: el.querySelector(".order-status-item-actions") as HTMLElement,
        annotationTemplate: `<p>$annotation</p>`
      }
    })
  },
});

export default InstacartAdapter;
