import { urlContains } from '../utils'

export const AmazonAdapter = {
  name: "Amazon",
  enable: () => urlContains("amazon.com"),
  colSpecs: [
  { name: "id", type: "text", hidden: true },
  { name: "name", editable: true, type: "text" },
  { name: "price", editable: true, type: "text" },
  { name: "rating", editable: true, type: "text" }
  ],
  getDataRows: () => {
    let form = document.getElementById("");

    let items_class = Array.from(document.getElementsByClassName("s-search-results"));
    let one_item_class = items_class[1];

    // console.log(items_class[1]);
    // console.log(one_item_class.find("span"));
    return [
    {
      els: [form],
      dataValues: {
        id: 1, // only one row so we can just hardcode an ID
        name: form.querySelector("#package-origin-hp-package"),
        price: form.querySelector("#package-destination-hp-package"),
        rating: form.querySelector("#package-departing-hp-package")
      }
    }
    ]
  },
  // Reload data anytime there's a click or keypress on the page
  setupReloadTriggers: (reload) => {
    document.addEventListener("click", (e) => { reload() })
    document.addEventListener("keydown", (e) => { reload() })
  }
}

