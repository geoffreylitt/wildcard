'use strict';
import { urlMatches, extractNumber } from "../utils";
import { createDomScrapingAdapter } from "./domScrapingBase"

const GithubAdapter = createDomScrapingAdapter({
  name: "Github",
  enabled: () => false,
  attributes: [
    { name: "name"   , type: "text"},
    { name: "stars"  , type: "numeric"},
    { name: "forks"  , type: "text"},
    { name: "updated", type: "text"},
    // TODO datetime type would be nice? not everything has ISO formatted strings
  ],
  scrapePage() {
    return Array.from(document.querySelectorAll("li.source")).map(el => {
      let name_el = el.querySelector('a[itemprop="name codeRepository"]')
      let name = name_el.textContent.trim()

      let stars_el = el.querySelector('*[href*="/stargazers"')
      let stars = extractNumber(stars_el, 0)

      let forks_el = el.querySelector('*[href*="/network/members"]')
      let forks = extractNumber(forks_el, 0)

      let lang_el = el.querySelector('*[itemprop="programmingLanguage"]')
      // some repos don't have language set
      let lang = lang_el == null ? null : lang_el.textContent.trim()

      let updated_el = el.querySelector('relative-time')
      let updated = updated_el.getAttribute('datetime')

      return {
          id: name,
          rowElements: [el],
          dataValues: {
              name: name,
              stars: stars,
              forks: forks,
              updated: updated,
          },
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

export default GithubAdapter;
