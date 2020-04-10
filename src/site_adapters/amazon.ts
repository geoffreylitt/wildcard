// import { urlContains } from '../utils'

// const rowContainerClass = "s-result-list s-search-results sg-row";
// const nameClass = "a-row a-size-base a-color-secondary";
// const altNameClass = "a-size-medium a-color-base a-text-normal";
// const priceClass = "a-price";
// var counter = 0;

// export const AmazonAdapter = {
//   name: "Amazon",
//   enabled: () => urlContains("amazon.com"),
//   colSpecs: [
//   { name: "id", type: "text", hidden: true },
//   { name: "name", editable: true, type: "text" },
//   { name: "price", editable: true, type: "numeric" },
//   { name: "rating", editable: true, type: "numeric" }
//   ],
//   getDataRows: () => {

//     //group will generate some values if it is used for grid view or row view
//     var outermost_container = document.getElementsByClassName(rowContainerClass);
//     var rows: HTMLCollection;

//     var pdt_name_el;
//     var pdt_name;
//     var price_el;
//     var price;
//     var rating_el;
//     var rating;

//     //if it is not one of these views, check for the other sellers view
//     if (outermost_container == undefined || outermost_container.length == 0){
//       rows = document.getElementsByClassName("a-row a-spacing-mini olpOffer");

//       //if all tries fail, it is not one of the views we know.
//       //return empty
//       if (rows == undefined){
//         return [{
//           els: [<HTMLElement> outermost_container[0]],
//           dataValues: {
//             id: 0,
//             name: "1",
//             price: "1",
//             rating: "0"
//           }}];
//       }

//       //otherwise we are in the other sellers category
//       //pass array over for manipulation
//     }

//     //otherwise you are good to go with initial group, extract the names
//     else {
//       var inner_container = outermost_container[1];

//       //extract rows for grid
//       rows = inner_container.getElementsByClassName("a-section a-spacing-medium a-text-center");

//       //extract rows for row view
//       if (rows.length == 0){
//         console.log("in row view");
//         rows = inner_container.getElementsByClassName("a-section a-spacing-medium");

//         return Array.from(rows).map(el => {
//           console.log(el);

//           var node_of_interest = el.getElementsByClassName("sg-col-inner")[0].querySelectorAll("a");

//           pdt_name_el = <HTMLElement> el.getElementsByClassName(nameClass)[0];
//           pdt_name = pdt_name_el.innerText;

//           if (!(el.getElementsByClassName(priceClass)[0] == undefined)){
//               price_el = <HTMLElement> el.getElementsByClassName(priceClass)[0].getElementsByClassName("a-offscreen")[0];
//               let price_text = price_el.innerText
//               price = parseFloat(price_text.substring(1,price_text.length));
//           }

//           if (!(el.getElementsByClassName("a-icon-alt")[0] == undefined)){
//             rating_el = <HTMLElement> el.getElementsByClassName("a-icon-alt")[0];
//             let rat_text = rating_el.innerText;
//             let rat_end_idx = rat_text.indexOf("o");
//             rating = parseFloat(rat_text.substring(0, rat_end_idx));
//           }

//           return {
//                 els: [el as HTMLElement],
//                 dataValues: {
//                   id: counter,
//                   name: pdt_name,
//                   price: price,
//                   rating: rating
//                 }
//               }
//         });
//       }

//       return Array.from(rows).map(el => {
//         console.log("in grid view");

//         pdt_name_el = <HTMLElement> el.getElementsByClassName(nameClass)[0];
//         pdt_name = pdt_name_el.innerText;

//         if (!(el.getElementsByClassName(priceClass)[0] == undefined)){
//             price_el = <HTMLElement> el.getElementsByClassName(priceClass)[0].getElementsByClassName("a-offscreen")[0];
//             let price_text = price_el.innerText
//             price = parseFloat(price_text.substring(1,price_text.length));
//         }

//         if (!(el.getElementsByClassName("a-icon-alt")[0] == undefined)){
//           rating_el = <HTMLElement> el.getElementsByClassName("a-icon-alt")[0];
//           let rat_text = rating_el.innerText;
//           let rat_end_idx = rat_text.indexOf("o");
//           rating = parseFloat(rat_text.substring(0, rat_end_idx));
//         }

//         return {
//               els: [el as HTMLElement],
//               dataValues: {
//                 id: counter,
//                 name: pdt_name,
//                 price: price,
//                 rating: rating
//               }
//             }
//       });
//     }

//     return [{
//       els: [<HTMLElement> outermost_container[0]],
//       dataValues: {
//         id: 0,
//         name: "1",
//         price: "1",
//         rating: "0"
//       }}];


//     //
//     //   //extract data from div
//     //   var pdt_name_el;
//     //   var pdt_name;
//     //   var price_el;
//     //   var price;
//     //   var rating_el;
//     //   var rating;

//     //   try {
//     //     let prefix = el.children[0].children[0].children[0];
//     //     pdt_name_el = <HTMLElement> prefix.getElementsByClassName(nameClass)[0];
//     //     pdt_name = pdt_name_el.innerText;
//     //   }

//     //   catch{

//     //     try{
//     //       pdt_name = el.children[1].getElementsByClassName()[0].innerText;

//     //     }

//     //     catch{
//     //       pdt_name = "N/A";
//     //     }
//     //   }

//     //   try{
//     //     let prefix = el.children[0].children[0].children[0];
//     //     price_el = <HTMLElement> prefix.getElementsByClassName(priceClass)[0];
//     //     let price_offscreen_el = <HTMLElement> price_el.getElementsByClassName("a-offscreen")[0];
//     //     let price_text = price_offscreen_el.innerText
//     //     price = parseFloat(price_text.substring(1,price_text.length));
//     //   }
//     //   catch{
//     //     price = 0;
//     //   }

//     //   try{
//     //     let prefix = el.children[0].children[0].children[0];
//     //     rating_el = <HTMLElement> prefix.getElementsByClassName("a-icon-alt")[0];
//     //     let rat_text = rating_el.innerText;
//     //     let rat_end_idx = rat_text.indexOf("o");
//     //     rating = parseFloat(rat_text.substring(0, rat_end_idx));
//     //   }

//     //   catch{
//     //     rating = 0;
//     //   }

//     //   //use document.getElementsByClassName("s-result-list s-search-results sg-row")[1].children[16].children[0].children[0].children[0].getElementsByClassName("a-size-base-plus a-color-base a-text-normal")

//     //   counter += 1;
//     //   return {
//     //     els: [el as HTMLElement],
//     //     dataValues: {
//     //       id: counter,
//     //       name: pdt_name,
//     //       price: price,
//     //       rating: rating
//     //     }
//     //   }
//     // })


//   },
//   // Reload data anytime there's a click or keypress on the page
//   setupReloadTriggers: (reload) => {
//     document.addEventListener("click", (e) => { reload() })
//     document.addEventListener("keydown", (e) => { reload() })
//   }
// }

import { urlContains } from '../utils'

const rowContainerID = "olpOfferList";
const rowClass = "a-row a-spacing-mini olpOffer";
const priceClass = "a-column a-span2 olpPriceColumn";
const shippingPriceClass = "olpShippingPrice";
const estTaxClass = "olpEstimatedTaxText";
const conditionClass = "a-size-medium olpCondition a-text-bold";
const arrivalClass = "a-expander-content a-expander-partial-collapse-content";
const sellerClass = "a-column a-span2 olpSellerColumn";
const sellerName = "a-spacing-none olpSellerName";
const ratingClass = "a-icon-alt";

var counter = 0;

export const AmazonAdapter = {
  name: "Amazon",
  enabled: () => urlContains("amazon.com"),
  colSpecs: [
  { name: "id", type: "text", hidden: true },
  { name: "total_price", editable: true, type: "numeric" },
  { name: "delivery_detail", editable: true, type: "text" },
  { name: "seller_rating", editable: true, type: "numeric" }
  ],
  getDataRows: () => {

    var group = document.getElementById(rowContainerID).getElementsByClassName(rowClass);

    return Array.from(group).map(el => {

      var price = 0;

      var price_el = <HTMLElement> el.getElementsByClassName(priceClass)[0];
      var price_text = price_el.innerText;

      var base_start_idx = price_text.indexOf("$");
      var base_end_idx = price_text.indexOf("+");
      var base_price_text = price_text.substring(base_start_idx + 1, base_end_idx);
      var base_price = parseFloat(base_price_text);
      // console.log("base:", base_price);

      var ship_price = 0;
      var tax_price = 0;
      if (price_text.toLowerCase().includes("free shipping")){
        //check for free shipping
       var tax_start_idx = price_text.indexOf("$", base_end_idx);
       var tax_end_idx = price_text.indexOf("e");
       var tax_price_text = price_text.substring(tax_start_idx + 1, tax_end_idx);
       tax_price = parseFloat(tax_price_text);
      }

      else{
        //no free shipping - there should be a number
      var ship_start_idx = price_text.indexOf("$", base_end_idx);
      var ship_end_idx = price_text.indexOf("s");
      var ship_price_text = price_text.substring(ship_start_idx + 1, ship_end_idx);
      ship_price = parseFloat(ship_price_text);
      // console.log("ship:", ship_price);

      var tax_start_idx = price_text.indexOf("$", ship_end_idx);
      var tax_end_idx = price_text.indexOf("e", tax_start_idx);
      var tax_price_text = price_text.substring(tax_start_idx + 1, tax_end_idx);
      var tax_price = parseFloat(tax_price_text);
      // console.log("tax_price:", tax_price);
    }


      //TO-DO: calculate total price
      price = base_price + ship_price + tax_price;

      var delivery_el = <HTMLElement>el.getElementsByClassName(arrivalClass)[0];
      var delivery_text = delivery_el.innerText;

      var rating_el = <HTMLElement> el.getElementsByClassName(sellerClass)[0].getElementsByClassName(ratingClass)[0];
      var rating_text = rating_el.innerText;

      var seller_name = <HTMLElement> el.getElementsByClassName(sellerName)[0];
      // var link_text = seller_name.querySelectorAll("a").href'


      counter += 1;
      return {
        id: seller_name.querySelector("a").href,
        els: [el as HTMLElement],
        dataValues: {
          total_price: price.toFixed(2),
          delivery_detail: delivery_text,
          seller_rating: rating_text
        }
      }
    })
  },
  // Reload data anytime there's a click or keypress on the page
  setupReloadTriggers: (reload) => {
    document.addEventListener("click", (e) => { reload() })
    document.addEventListener("keydown", (e) => { reload() })
  }
}
