import { FullCalendarEditor } from '../cell_editors/fullCalendarEditor.js'

export const ExpediaAdapter = {
  name: "Expedia2",
  urlPattern: "expedia.com",
  tableOptions: {
    getRowContainer: () => {
      return document.getElementById("gcw-packages-form-hp-package")
    },
    getDataRows: () => {
      return [
      document.getElementById("gcw-packages-form-hp-package")
      ]
    },
    colSpecs: [
    {
      fieldName: "id",
      colValue: 1,
      // a phantom element -- ugly.
      // can we change the API so that not all columns need this?
      el: (row) => document.createElement("div"),
      type: "text",
      hidden: true,
      readOnly: true
    },
    {
      fieldName: "origin",
      el: (row) => row.querySelector("#package-origin-hp-package"),
      readOnly: false,
      type: "text"
    },
    {
      fieldName: "destination",
      el: (row) => row.querySelector("#package-destination-hp-package"),
      readOnly: false,
      type: "text"
    },
    {
      fieldName: "departDate",
      el: (row) => row.querySelector("#package-departing-hp-package"),
      readOnly: false,
      type: "text",
      editor: FullCalendarEditor
    },
    {
      fieldName: "returnDate",
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
}

