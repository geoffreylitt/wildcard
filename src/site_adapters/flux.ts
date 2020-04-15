'use strict';

import { urlContains, extractNumber } from "../utils"

export const FluxAdapter = {
  name: "Flux",
  enable: () => ,
  colSpecs:
  getDataRows: () => {

  },
  setupReloadTriggers: (reload) => {
    document.addEventListener("click", (e) => { reload() })
  }
}



'use strict';

// A sample new HN site adapter.

import { urlExact, urlContains, extractNumber, onDomReady } from "../utils";
import DomScrapingBaseAdapter from "./domScrapingBase"

class FluxAdapter extends DomScrapingBaseAdapter {
  static enabled () {
    return urlContains("flux2.luar.dcc.ufmg.br")
  }

  siteName = "Flux Table"

  colSpecs = [
    { name: "id", type: "text" },
    { name: "DataDoPreenchimento", type: "text", editable: true },
    { name: "FatorDeDiluição", type: "numeric", editable: true },
  ],

  scrapePage() {
    let container = document.querySelector("#j_id_7y") as HTMLElement
    let dateInput = document.querySelector("#dataDoPreenchimento_input") as HTMLElement
    let fatorInput = document.querySelector("#fatorDeDiluicao") as HTMLElement

    return [
      {
        els: [container],
        dataValues: {
          id: "123",
          "DataDoPreenchimento": dateInput,
          "FatorDeDiluição": fatorInput
        }
      }
    ]
  }

  subscribe() {
    onDomReady(() => {
      // todo: this is an antipattern,
      // shouldn't need to load on subscribe.
      // caller should explicitly call load up front
      callback(this.loadRecords());

      // todo: find a better trigger for this site
      document.addEventListener("click", (e) => { reload() })
    }
  }
}

export default FluxAdapter;
