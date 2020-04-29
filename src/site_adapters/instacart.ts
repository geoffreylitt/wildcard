'use strict';

import {urlContains} from "../utils";
import { createDomScrapingAdapter } from "./domScrapingBase"

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
      if (quantityDropdown) {
        itemQuantity = quantityDropdown.textContent;
      } else if (quantityText) {
        itemQuantity = quantityText.textContent;
      }

      return {
        id: itemName,
        rowElements: [el],
        dataValues: {
          name: itemName,
          price: itemPrice,
          quantity: itemQuantity
        },
        annotationContainer: el.querySelector(".order-status-item-actions") as HTMLElement,
        annotationTemplate: `<p>$annotation</p>`
      }
    })
  },

  scrapeAjax: (request) => {
    if(request.url.includes("https://www.instacart.com/api/v2/orders")){

      console.log("scraping!");
      console.log(request.data);

      const ajaxResults = request.data.data.order_items.map(item => ({
        id: item.item.display_name,
        dataValues: {
          department_name: item.item.department_name,
          aisle_name: item.item.aisle_name,
          category: item.item.product_category.l4_category,
          code: item.item.product_codes && item.item.product_codes[0],
          allow_replacements: item.allow_replacements
        }
      }));

      console.log("ajax results", ajaxResults);

      return ajaxResults;
    }
  },

  // Reload data anytime the form changes or there's a click on the page
  addScrapeTriggers: (loadTable) => {
    // document.addEventListener("click", e => loadTable())
  }
});

export default InstacartAdapter;
