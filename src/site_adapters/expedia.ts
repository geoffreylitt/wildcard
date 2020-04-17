'use strict';

// doesn't make sense to import cell editors here.... should be in UI
import { FullCalendarEditor } from '../ui/cell_editors/fullCalendarEditor.js'
import { RichTextEditor } from '../ui/cell_editors/richTextEditor.js'

import { urlExact, urlContains, extractNumber, onDomReady } from "../utils";
import DomScrapingBaseAdapter from "./domScrapingBase"

class ExpediaAdapter extends DomScrapingBaseAdapter {
  static enabled () {
    return urlContains("expedia.com")
  }

  siteName = "Expedia"

  colSpecs = [
    { name: "id", type: "text", hidden: true },
    { name: "origin", editable: true, type: "text" },
    { name: "destination", editable: true, type: "text", editor: RichTextEditor },
    { name: "departDate", editable: true, type: "text", editor: FullCalendarEditor },
    { name: "returnDate", editable: true, type: "text", editor: FullCalendarEditor }
  ]

  initialize () {
    onDomReady(() => {
      this.loadTable();
      document.addEventListener("click", (e) => { this.loadTable() });
      // add something more performant here than a keydown...
      // document.addEventListener("keydown", (e) => { this.loadTable() });
    })
  }

  scrapePage() {
    let form = document.getElementById("gcw-packages-form-hp-package")
    return [
    {
      id: "1", // only one row so we can just hardcode an ID
      rowElements: [form],
      attributes: {
        origin: form.querySelector("#package-origin-hp-package"),
        destination: form.querySelector("#package-destination-hp-package"),
        departDate: form.querySelector("#package-departing-hp-package"),
        returnDate: form.querySelector("#package-returning-hp-package")
      }
    }
    ]
  }
}

export default ExpediaAdapter;
