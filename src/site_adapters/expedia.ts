import { FullCalendarEditor } from '../cell_editors/fullCalendarEditor.js'
import { urlContains } from '../utils'

export const ExpediaAdapter = {
  name: "Expedia2",
  enable: () => urlContains("expedia.com"),
  colSpecs: [
  { name: "id", type: "text", hidden: true },
  { name: "origin", editable: true, type: "text" },
  { name: "destination", editable: true, type: "text" },
  { name: "departDate", editable: true, type: "text", editor: FullCalendarEditor },
  { name: "returnDate", editable: true, type: "text", editor: FullCalendarEditor }
  ],
  getDataRows: () => {
    let form = document.getElementById("gcw-packages-form-hp-package")
    return [
    {
      els: [form],
      dataValues: {
        id: 1, // only one row so we can just hardcode an ID
        origin: form.querySelector("#package-origin-hp-package"),
        destination: form.querySelector("#package-destination-hp-package"),
        departDate: form.querySelector("#package-departing-hp-package"),
        returnDate: form.querySelector("#package-returning-hp-package")
      }
    }
    ]
  },
  // Reload data anytime there's a click or keypress on the page
  setupReloadTriggers: (reload) => {
    document.addEventListener("click", (e) => { reload() })
    document.addEventListener("keydown", (e) => { reload() })
  }
}

