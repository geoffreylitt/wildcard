'use strict';

import { extractNumber, urlExact, urlContains } from "../utils"

export const UberEatsAdapter = {
  name: "Uber Eats",
  enable: () => {
    return urlContains("ubereats.com")
  },
  colSpecs: [
  { name: "id", type: "text", hidden: true },
  { name: "name", type: "text" },
  { name: "notes", type: "text" },
  { name: "priceyness", type: "text" },
  { name: "rating", type: "numeric" },
  { name: "fee", type: "numeric" }
  ],
  getDataRows: () => {
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

          let r_name = prefix.children[0].innerText;
   
          let pricey_html = <HTMLElement> prefix.children[1];
          let pricey_text = pricey_html.innerText;
          let bullet_idx = pricey_text.indexOf("•"); 
          let r_pricey = pricey_text.substring(0, bullet_idx);
          let r_category = pricey_text.substring(bullet_idx+1,pricey_text.length);

          let delivery_metadata = prefix.children[2].children[0];
          let r_rating = 0;
          let r_fee = 0;

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

          return {
            id: el.getAttribute("href"),
            els: [el as HTMLElement],
            dataValues: {
                name: r_name,
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
  setupReloadTriggers: (reload) => {
    document.addEventListener("click", (e) => { 
      console.log("clicked");
      reload() });
    document.addEventListener("keydown", (e) => { reload() });
  }
}

