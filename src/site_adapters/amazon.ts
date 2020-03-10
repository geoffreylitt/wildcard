// import { urlContains } from '../utils'

// const rowContainerClass = "s-result-list s-search-results sg-row";
// const nameClass = "a-row a-size-base a-color-secondary";
// const altNameClass = "a-size-medium a-color-base a-text-normal";
// const priceClass = "a-price";
// var counter = 0;

// export const AmazonAdapter = {
//   name: "Amazon",
//   enable: () => urlContains("amazon.com"),
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

const rowContainerClass = "s-result-list s-search-results sg-row";
const nameClass = "a-size-base-plus a-color-base a-text-normal";
const priceClass = "a-price";
var counter = 0;

export const AmazonAdapter = {
  name: "Amazon",
  enable: () => urlContains("amazon.com"),
  colSpecs: [
  { name: "id", type: "text", hidden: true },
  { name: "name", editable: true, type: "text" },
  { name: "price", editable: true, type: "numeric" },
  { name: "rating", editable: true, type: "numeric" }
  ],
  getDataRows: () => {

    var group = document.getElementsByClassName(rowContainerClass)[1].children;

    return Array.from(group).map(el => {
      //extract data from div
      var pdt_name_el;
      var pdt_name;
      var price_el;
      var price;
      var rating_el;
      var rating;

      try {
        let prefix = el.children[0].children[0].children[0];
        pdt_name_el = <HTMLElement> prefix.getElementsByClassName(nameClass)[0];
        pdt_name = pdt_name_el.innerText;
      }

      catch{
        pdt_name = "N/A";
      }

      try{
        let prefix = el.children[0].children[0].children[0];
        price_el = <HTMLElement> prefix.getElementsByClassName(priceClass)[0];
        let price_offscreen_el = <HTMLElement> price_el.getElementsByClassName("a-offscreen")[0];
        let price_text = price_offscreen_el.innerText
        price = parseFloat(price_text.substring(1,price_text.length));
      }
      catch{
        price = 0;
      }

      try{
        let prefix = el.children[0].children[0].children[0];
        rating_el = <HTMLElement> prefix.getElementsByClassName("a-icon-alt")[0];
        let rat_text = rating_el.innerText;
        let rat_end_idx = rat_text.indexOf("o"); 
        rating = parseFloat(rat_text.substring(0, rat_end_idx));
      }

      catch{
        rating = 0;
      }

      //use document.getElementsByClassName("s-result-list s-search-results sg-row")[1].children[16].children[0].children[0].children[0].getElementsByClassName("a-size-base-plus a-color-base a-text-normal")

      counter += 1;
      return {
        els: [el as HTMLElement],
        dataValues: {
          id: counter,
          name: pdt_name,
          price: price,
          rating: rating
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