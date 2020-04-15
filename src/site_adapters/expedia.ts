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

  subscribe (callback) {
    onDomReady(() => {
      callback(this.loadRecords());
      document.addEventListener("click", (e) => { callback(this.loadRecords()); })
      document.addEventListener("keydown", (e) => { callback(this.loadRecords()); })
    });
  }
}

export default ExpediaAdapter;
