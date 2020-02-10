import { FullCalendarEditor } from '../cell_editors/fullCalendarEditor.js'

export const ExpediaAdapter = {
  name: "Expedia2",
  urlPattern: "expedia.com",
  getDataRows: () => {
    let form = document.getElementById("gcw-packages-form-hp-package")
    return [
    {
      el: form,
      dataValues: {
        id: 1, // only one row so it doesn't matter
        origin: form.querySelector("#package-origin-hp-package"),
        destination: form.querySelector("#package-destination-hp-package"),
        departDate: form.querySelector("#package-departing-hp-package"),
        returnDate: form.querySelector("#package-returning-hp-package")
      }
    }
    ]
  },
  colSpecs: [
  {
    name: "id",
    type: "text",
    hidden: true,
    readOnly: true
  },
  {
    name: "origin",
    readOnly: false,
    type: "text"
  },
  {
    name: "destination",
    readOnly: false,
    type: "text"
  },
  {
    name: "departDate",
    readOnly: false,
    type: "text",
    editor: FullCalendarEditor
  },
  {
    name: "returnDate",
    readOnly: false,
    type: "text",
    editor: FullCalendarEditor
  }
  ],
  setupReloadTriggers: (reload) => {
    document.addEventListener("click", (e) => {
      reload()
    })
    document.addEventListener("keydown", (e) => {
      reload()
    })
  }
}

