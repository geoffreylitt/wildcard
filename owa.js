(function () {
  'use strict';

  // convert HTML to a dom element
  function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  }

  function setupStyles() {
    var link = window.document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css';
    document.getElementsByTagName("head")[0].appendChild(link);
  }

  function createToggleButton() {
    // set up button to open the table
    let toggleBtn = htmlToElement(`<button style="
      font-weight: bold;
      border-radius: 10px;
      z-index: 100000;
      padding: 10px;
      position: fixed;
      top: 20px;
      left: 50%;
      background-color: white;
      box-shadow: 0px 0px 10px -1px #d5d5d5;
      border: none;
      " class="open-apps-trigger">💡Table View</button>'`)
    toggleBtn.addEventListener('click', () => { newDiv.style.visibility = (newDiv.style.visibility === "visible") ? "hidden" : "visible" })
    document.body.appendChild(toggleBtn)
  }
  

  // given column names and data array...
  // render a handsontable
  const createTable = (colSpecs) => {
    setupStyles();

    // add wrapper div
    let newDiv = htmlToElement("<div id=\"open-apps\" class=\"mydiv\" style=\"border-top: solid thin #ddd; position: fixed; overflow: hidden; background-color: white; height: 300px; width: 100%; z-index: 1000; bottom: 0;\"><div id=\"open-apps-table\"></div></div>")
    document.body.appendChild(newDiv);
    var container = document.getElementById('open-apps-table');

    let rows = getDataRows();

    // set up data for table
    let data = rows.map(rowEl => {
      let row = {}
      colSpecs.forEach(spec => {
        row[spec.fieldName] = spec.el(rowEl).value;
      })

      return row
    })

    var hot = new Handsontable(container, {
      data: data,
      rowHeaders: true,
      colHeaders: colSpecs.map(col => col.fieldName),
      filters: true,
      formulas: true,
      stretchH: 'none',
      dropdownMenu: true,
      columnSorting: true,
      columns: colSpecs.map(col => ({
        data: col.fieldName,
        readOnly: col.readOnly,
        type: col.type,
        dateFormat: col.dateFormat
      })),
      afterChange: (changes) => {
        if (changes) {
          changes.forEach(([row, prop, oldValue, newValue]) => {
            let colSpec = colSpecs.find(spec => spec.fieldName == prop)
            if (colSpec.readOnly) { return; }

            let rowEl = rows[row]
            let el = colSpec.el(rowEl)
            el.value = newValue
          });
        }
      },
      licenseKey: 'non-commercial-and-evaluation'
    });

    createToggleButton();

    // set up handlers to react to div changes
    // todo: this is inefficient; can we make fewer handlers?
    rows.forEach((row, idx) => {
      colSpecs.forEach(col => {
        let el = col.el(row)
        el.addEventListener("change", e => {
          hot.setDataAtRowProp(idx, col.fieldName, e.target.value)
        })
      })
    })
  }

  const runExtension = () => {
    createTable(colSpecs);
  };

  if (document.readyState === "complete") {
    runExtension();
  } else {
    window.addEventListener("load", runExtension);
  }
})();