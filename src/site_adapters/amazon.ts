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

