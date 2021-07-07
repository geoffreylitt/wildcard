'use strict';

// A sample new HN site adapter.

import { urlExact, urlContains, extractNumber } from "../utils";
import { createDomScrapingAdapter } from "./domScrapingBase"

// Configuration options for the Hacker News adapter
const HNAdapter = createDomScrapingAdapter({
  name: "Hacker News",
  enabled () {
    return urlExact("news.ycombinator.com/") ||
           urlContains("news.ycombinator.com/news") ||
           urlContains("news.ycombinator.com/newest")
  },
  attributes: [
    { name: "id", type: "text", hidden: true },
    { name: "rank", type: "numeric" },
    { name: "title", type: "element", editable: true },
    { name: "link", type: "text" },
    { name: "points", type: "numeric" },
    { name: "user", type: "text" },
    { name: "comments", type: "numeric" }
  ],
  scrapePage() {
    return Array.from(document.querySelectorAll("tr.athing")).map(el => {
      let detailsRow = el.nextElementSibling
      let spacerRow = detailsRow.nextElementSibling

      return {
        id: String(el.getAttribute("id")),
        rowElements: [el, detailsRow, spacerRow],
          // todo: Both of these steps should be handled by the framework...
          // .filter(e => e) // Only include if the element is really there
          // .map(e => (e)), // Convert to HTMLElement type
        dataValues: {
          rank: el.querySelector("span.rank"),
          title: el.querySelector("a.storylink"),
          link: el.querySelector("a.storylink").getAttribute("href"),
          // These elements contain text like "162 points";
          // Wildcard takes care of extracting a number automatically.
          points: detailsRow.querySelector("span.score"),
          user: detailsRow.querySelector("a.hnuser"),
          comments: extractNumber(Array.from(detailsRow.querySelectorAll("a"))
            .find(e => e.textContent.indexOf("comment") !== -1), 0)
        },
        annotationContainer: detailsRow.querySelector("td.subtext") as HTMLElement,
        annotationTemplate: `| <span style="color: #f60;">$annotation</span>`
      }
    })
  },
  onRowSelected: (row) => {
      row.rowElements.forEach(el => {
          if (el.style) {
              el.style["background-color"] = "#def3ff"
          }
      });
      row.rowElements[0].scrollIntoView({ behavior: "smooth", block: "center" })
  },
  onRowUnselected: (row) => {
      row.rowElements.forEach(el => {
          if(el.style) {
              el.style["background-color"] = ``
          }
      })
  },
})

export default HNAdapter;
