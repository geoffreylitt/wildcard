import { urlContains } from '../utils'
import { createDomScrapingAdapter } from "./domScrapingBase"

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

export const AmazonAdapter = createDomScrapingAdapter({
  name: "Amazon",
  enable: () => urlContains("amazon.com"),
  colSpecs: [
  { name: "id", type: "text", hidden: true },
  { name: "total_price", editable: true, type: "numeric" },
  { name: "delivery_detail", editable: true, type: "text" },
  { name: "rating", editable: true, type: "numeric" }
  ],
  getDataRows: () => {

    var group = document.getElementById(rowContainerID).getElementsByClassName(rowClass);

    return Array.from(group).map(el => {
      console.log(el);
      var price = 0;

      var price_el = <HTMLElement> el.getElementsByClassName(priceClass)[0];
      var price_text = price_el.innerText;

      var start_idx = price_text.indexOf("$");
      var end_idx = price_text.indexOf(" ");

      //find every "$" sign and add the number behind it to the total_price
      while(start_idx != -1){
        price += parseFloat(price_text.substring(start_idx + 1, end_idx));
        start_idx = price_text.indexOf("$", end_idx);
        end_idx = price_text.indexOf(" ", start_idx);
      }


      var delivery_el = <HTMLElement>el.getElementsByClassName(arrivalClass)[0];
      var delivery_text = "";
      if (delivery_el == undefined){
        delivery_text = "Unavailable";
      }
      else {
        delivery_text = delivery_el.innerText;
      }


      var rating_el = <HTMLElement> el.getElementsByClassName(sellerClass)[0].getElementsByClassName(ratingClass)[0];
      var rating_text = "";
      if (rating_el == undefined){
        rating_text = "Unavailable";
      }
      else{
        rating_text = rating_el.innerText;
      }

      var seller_name = <HTMLElement> el.getElementsByClassName(sellerName)[0];
      var seller_href = "";
      if (seller_name.querySelector("a") === null){
        seller_href = "Null";
      }
      else{
        seller_href = seller_name.querySelector("a").href;
      }


      return {
        id: seller_href,
        els: [el as HTMLElement],
        dataValues: {
          total_price: price.toFixed(2),
          delivery_detail: delivery_text,
          rating: rating_text
        }
      }
    })
  },
  // Reload data anytime there's a click or keypress on the page
  setupReloadTriggers: (reload) => {
    document.addEventListener("click", (e) => { reload() })
    document.addEventListener("keydown", (e) => { reload() })
  }
});

export default AmazonAdapter;
