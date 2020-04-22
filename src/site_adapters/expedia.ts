'use strict';

// todo: doesn't make sense to import cell editors here.... should be in UI?
import { FullCalendarEditor } from '../ui/cell_editors/fullCalendarEditor.js'
import { RichTextEditor } from '../ui/cell_editors/richTextEditor.js'
import { urlContains } from '../utils'
import { createDomScrapingAdapter } from "./domScrapingBase"

const ExpediaAdapter = createDomScrapingAdapter({
  name: "Expedia",
  enabled: () => urlContains("expedia.com"),
  attributes: [
    { name: "id", type: "text", hidden: true },
    { name: "origin", editable: true, type: "text" },
    { name: "destination", editable: true, type: "text", editor: RichTextEditor },
    { name: "departDate", editable: true, type: "text", editor: FullCalendarEditor },
    { name: "returnDate", editable: true, type: "text", editor: FullCalendarEditor }
  ],
  scrapePage: () => {
    const form = document.getElementById("gcw-packages-form-hp-package")
    return [
      {
        id: "1", // only one row so we can just hardcode an ID
        rowElements: [form],
        dataValues: {
          origin: form.querySelector("#package-origin-hp-package"),
          destination: form.querySelector("#package-destination-hp-package"),
          departDate: form.querySelector("#package-departing-hp-package"),
          returnDate: form.querySelector("#package-returning-hp-package")
        }
      }
    ]
  },
  // Reload data anytime the form changes or there's a click on the page
  addScrapeTriggers: (loadTable) => {
    document.addEventListener("click", e => loadTable())

    const form = document.getElementById("gcw-packages-form-hp-package")
    form.addEventListener("change", loadTable())
  }
})

export default ExpediaAdapter;

