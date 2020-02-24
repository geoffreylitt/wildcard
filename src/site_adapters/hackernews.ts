'use strict';

import { extractNumber, urlExact, urlContains } from "../utils"

const rowContainerClass = "_fhph4u"
const rowClass = "_8ssblpx"
const titleClass = "_1jbo9b6h"
const priceClass = "_1p7iugi"
const ratingClass = "_3zgr580"
const listingLinkClass = "_i24ijs"

export const HNAdapter = {
  name: "Hacker News",
  enable: () => {
    return urlExact("news.ycombinator.com/") ||
           urlContains("news.ycombinator.com/news") ||
           urlContains("news.ycombinator.com/newest")
  },
  colSpecs: [
  { name: "id", type: "text" },
  { name: "rank", type: "numeric" },
  { name: "title", type: "text" },
  { name: "link", type: "text" },
  { name: "points", type: "numeric" },
  { name: "user", type: "text" },
  { name: "comments", type: "numeric" }
  ],
  getDataRows: () => {
    return Array.from(document.querySelectorAll("tr.athing")).map(el => {
      let detailsRow = el.nextElementSibling
      let spacerRow = detailsRow.nextElementSibling

      return {
        id: String(el.getAttribute("id")),
        els: [el, detailsRow, spacerRow]
          // Both of these steps should be handled by the framework...
          .filter(e => e) // Only include if the element is really there
          .map(e => (e as HTMLElement)), // Convert to HTMLElement type
        dataValues: {
          rank: el.querySelector("span.rank"),
          title: el.querySelector("a.storylink"),
          link: el.querySelector("a.storylink").getAttribute("href"),
          // These elements contain text like "162 points";
          // Wildcard takes care of extracting a number automatically.
          points: detailsRow.querySelector("span.score"),
          user: detailsRow.querySelector("a.hnuser"),
          comments: extractNumber(Array.from(detailsRow.querySelectorAll("a"))
        .find(e => e.textContent.indexOf("comments") !== -1), 0)
        },
        annotationContainer: detailsRow.querySelector("td.subtext") as HTMLElement,
        annotationTemplate: `| <span style="font-weight: bold">$annotation</span>`
      }
    })
  },
}

