import { FullCalendarEditor } from '../cell_editors/fullCalendarEditor.js'

export const ExpediaAdapter = {
  name: "Expedia2",
  urlPattern: "expedia.com",
  getDataRows: () => {
    return [
    document.getElementById("gcw-packages-form-hp-package")
    ]
  },
  colSpecs: [
  {
    name: "id",
    colValue: 1,
    // a phantom element -- ugly.
    // can we change the API so that not all columns need this?
    //
    // YES WE CAN
    // just return 1 as the id for all rows
    // and don't return an el
    el: (row) => document.createElement("div"),
    type: "text",
    hidden: true,
    readOnly: true
  },
  {
    name: "origin",
    el: (row) => row.querySelector("#package-origin-hp-package"),
    readOnly: false,
    type: "text"
  },
  {
    name: "destination",
    el: (row) => row.querySelector("#package-destination-hp-package"),
    readOnly: false,
    type: "text"
  },
  {
    name: "departDate",
    el: (row) => row.querySelector("#package-departing-hp-package"),
    readOnly: false,
    type: "text",
    editor: FullCalendarEditor
  },
  {
    name: "returnDate",
    el: (row) => row.querySelector("#package-returning-hp-package"),
    readOnly: false,
    type: "text",
    editor: FullCalendarEditor
  }
  ],
  setupReloadTriggers: (reload) => {
    document.addEventListener("click", (e) => {
      reload()
    })
  }
}

