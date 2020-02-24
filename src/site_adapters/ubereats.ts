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
        id: el.querySelector("a").getAttribute("href"),
        els: [el],
        dataValues: {
          name: el.querySelector(".b4.b5.br.b7.ej.ek.el.b1")
        },
      }
    })
  },
}

