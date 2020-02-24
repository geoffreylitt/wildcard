'use strict';

import { extractNumber, urlExact, urlContains } from "../utils"

export const UberEatsAdapter = {
  name: "Uber Eats",
  enable: () => {
    return urlContains("ubereats.com")
  },
  colSpecs: [
  { name: "id", type: "text" },
  { name: "name", type: "text" }
  ],
  getDataRows: () => {
    return Array.from(document.querySelectorAll("li")).map(el => {
      return {
        els: [el],
        dataValues: {
          id: el.querySelector("a").getAttribute("href"),
          name: el.children[0].children[0].children[1].children[0]
        },
      }
    })
  },
}

