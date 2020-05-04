'use strict';

import { extractNumber, urlExact, urlContains } from "../utils"
import { createDomScrapingAdapter } from "./domScrapingBase"

const UberEatsAdapter = createDomScrapingAdapter({
  name: "Uber Eats",
  enabled: () => {
    return urlContains("ubereats.com")
  },
  attributes: [
  { name: "id", type: "text"},
  { name: "name", type: "text" },
  { name: "eta", type: "text" },
  { name: "categories", type: "text" },
  { name: "price_bucket", type: "text" },
  { name: "rating", type: "numeric" },
  { name: "fee", type: "numeric" }
  ],
  scrapePage: () => {
    return Array.from(document.querySelectorAll("a")).map(el => {
      var prefix;

        //check that el has restaurant
        if (el.getAttribute("href").includes("food-delivery/") == true){

          var url_elts = el.getAttribute("href").split("/");
          var title = url_elts[url_elts.length-2];

          if (el.children[0].children.length == 2){
            prefix = el.children[0].children[1];
          }

          else if (el.children[0].children.length == 3){
            prefix = el.children[0].children[2];
          }

          let restaurant = "N/A";
          if (!(prefix.children[0] == undefined)){
            restaurant = prefix.children[0].innerText.split("\n")[0];
          }

          return {
            id: title.toString(),
            rowElements: [el],
            dataValues: {
                name: restaurant
            },
          }

        }
    }).filter(row => row != undefined);
  },

  scrapeAjax: (request) => {
    if(request.url.includes("https://www.ubereats.com/api/getFeedV1")){
      try{
        let listings = request.data.data.storesMap;
     
        return Object.keys(listings).map(key => {
          let listing = listings[key];
          let l_eta = "";
          let l_categories = "";
          let l_price_bucket = "";
          let l_rating = 0;
          let l_fee = 0;

          if (!(listing.etaRange == null)){
            l_eta = listing.etaRange.text;
          }

          if (!(listing.meta.categories == null)){
            l_categories = listing.meta.categories;
          }

          if (!(listing.meta.priceBucket == null)){
            l_price_bucket = listing.meta.priceBucket;
          }

          if (!(listing.meta.deliveryFee == null)){
            l_fee = listing.meta.deliveryFee.text.split(" ")[0];
          }

          if (!(listing.feedback == null)){
            l_rating = listing.feedback.rating;
          }

          return {
            id: listing.slug.toString(),
            dataValues: {
              eta: l_eta,
              categories: l_categories,
              price_bucket: l_price_bucket,
              rating: l_rating,
              fee: l_fee
            }
          }
        });
      }
      catch(e){
        console.log(e);
      }
  }
  return undefined;
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
