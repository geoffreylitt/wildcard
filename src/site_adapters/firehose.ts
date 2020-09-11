'use strict';

import { urlExact, urlContains, extractNumber } from "../utils";
import { createDomScrapingAdapter } from "./domScrapingBase"
import debounce from 'lodash/debounce'

export const FirehoseAdapter = createDomScrapingAdapter({
  name: "Firehose Guide",
  enabled: () => urlContains("firehose.guide"),
  attributes: [
    { name: "id", type: "text", hidden: true },
    { name: "number", type: "text" },
    { name: "name", type: "text" },
    { name: "hours", type: "text" },
    { name: "rating", type: "text" },
  ],
  scrapePage: () => {
    return Array.from(document.querySelectorAll("tr[role]"))
      .filter(e1 => e1.getElementsByTagName("a").length > 0)
      .map(el => {
        let courseNumber = el.getElementsByTagName("a")[0].innerText;

        return {
          id: courseNumber,
          rowElements: [el],
          dataValues: {
            number: courseNumber,
            name: el.getElementsByTagName("td")[3].innerText,
            hours: el.getElementsByTagName("td")[2].innerText,
            rating: el.getElementsByTagName("td")[1].innerText,
          }
        }
      })
  },
  // Reload data anytime there's a click or keypress on the page
  addScrapeTriggers: (reload) => {
    document.addEventListener("click", (e) => { reload() });
    document.addEventListener("keydown", (e) => { reload() });
    document.addEventListener("scroll", debounce((e) => { reload() }, 50));
  },
  onRowSelected: (row) => {
    row.rowElements.forEach(el => {
      if (el.style) {
        el.style["background-color"] = `#c9ebff`
      }
    });
    row.rowElements[0].scrollIntoView({ behavior: "smooth", block: "center" })
  },
  onRowUnselected: (row) => {
    row.rowElements.forEach(el => {
      if (el.style) {
        el.style["background-color"] = ``
      }
    })
  }
});

export default FirehoseAdapter;
