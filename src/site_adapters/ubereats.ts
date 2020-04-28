'use strict';

import { extractNumber, urlExact, urlContains } from "../utils"
import { createDomScrapingAdapter } from "./domScrapingBase"

const UberEatsAdapter = createDomScrapingAdapter({
  name: "Uber Eats",
  enabled: () => {
    return urlContains("ubereats.com")
  },
  attributes: [
  { name: "id", type: "text", hidden: true },
  { name: "name", type: "text" },
  { name: "notes", type: "text" },
  { name: "priceyness", type: "text" },
  { name: "rating", type: "numeric" },
  { name: "fee", type: "numeric" }
  ],
  scrapePage: () => {
    return Array.from(document.querySelectorAll("a")).map(el => {
      var prefix;

        //check that el has restaurant
        if (el.getAttribute("href").includes("food-delivery/") == true){
          if (el.children[0].children.length == 2){
            prefix = el.children[0].children[1];
          }

          else if (el.children[0].children.length == 3){
            prefix = el.children[0].children[2];
          }

          let restaurant = "N/A";
          if (!(prefix.children[0] == undefined)){
            restaurant = prefix.children[0].innerText;
          }

          let pricey_text = "N/A";
          let r_category = "N/A";
          let r_pricey = "N/A";
          if (!(prefix.children[1] == undefined)){
            let pricey_html = <HTMLElement> prefix.children[1];
            pricey_text = pricey_html.innerText;
            let bullet_idx = pricey_text.indexOf("•");
            r_pricey = pricey_text.substring(0, bullet_idx);
            r_category = pricey_text.substring(bullet_idx+1,pricey_text.length);
          }          

         
          let r_rating = 0;
          let r_fee = 0;

          if (!(prefix.children[2] == undefined || prefix.children[2].children[0] == undefined)){
              let delivery_metadata = prefix.children[2].children[0];
              //there are no ratings for the restaurant
              if (delivery_metadata.children.length == 3){

                let fee_html = <HTMLElement> delivery_metadata.children[2].children[1];
                let fee_text = fee_html.innerText;
                let fee_end = fee_text.indexOf("D");
                r_fee = parseFloat(fee_text.substring(1,fee_end));
              }

              else if (delivery_metadata.children.length > 3) {
                let rat_html = <HTMLElement> delivery_metadata.children[2].children[1];
                let rat_text = rat_html.innerText;
                let rat_end = rat_text.indexOf("\n");
                r_rating = parseFloat(rat_text.substring(0,rat_end));

                let fee_html = <HTMLElement> delivery_metadata.children[4].children[1];
                let fee_text = fee_html.innerText;
                let fee_end = fee_text.indexOf("D");
                r_fee = parseFloat(fee_text.substring(1,fee_end));
              }
          }

          return {
            id: el.getAttribute("href"),
            rowElements: [el],
            dataValues: {
                name: restaurant,
                notes: r_category,
                priceyness: r_pricey,
                rating: r_rating,
                fee: r_fee
            },
          }

        }
    }).filter(row => row != undefined);
  },
  // Reload data anytime there's a click or keypress on the page
  addScrapeTriggers: (reload) => {
    document.addEventListener("click", (e) => {
      console.log("clicked");
      reload() });
    document.addEventListener("keydown", (e) => { reload() });
  }
});

export default UberEatsAdapter;
