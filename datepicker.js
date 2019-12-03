// Return all the "item" divs in a list
const dataRows = () => {
  return [
    document.getElementById("gcw-packages-form-hp-package")
  ]
}

// provide column names, column config, and lambda for finding that column's div within a row
const colSpecs = [
  {
    fieldName: "origin",
    el: (row) => row.querySelector("#package-origin-hp-package"),
    readOnly: true,
    type: "text"
  },
  {
    fieldName: "destination",
    el: (row) => row.querySelector("#package-destination-hp-package"),
    readOnly: true,
    type: "text"
  },
  {
    fieldName: "departDate",
    el: (row) => row.querySelector("#package-departing-hp-package"),
    readOnly: false,
    type: "date",
    dateFormat: "MM/DD/YYYY"
  },
  {
    fieldName: "returnDate",
    el: (row) => row.querySelector("#package-returning-hp-package"),
    readOnly: false,
    type: "date",
    dateFormat: "MM/DD/YYYY"
  }
];