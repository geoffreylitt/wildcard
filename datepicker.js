(function () {
  'use strict';

  // convert HTML to a dom element
  function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  }

  const columns = ["depart", "return"]
  const data = [
    {
      depart: "12/15/2019",
      return: "12/20/2019"
    }
  ]

  // given column names and data array...
  // render a handsontable
  const createTable = (columns, data) => {
    // add wrapper div
    let newDiv = htmlToElement("<div id=\"open-apps\" class=\"mydiv\" style=\"border-top: solid thin #ddd; position: fixed; overflow: hidden; background-color: white; height: 300px; width: 100%; z-index: 1000; bottom: 0;\"><div id=\"open-apps-table\"></div></div>")
    document.body.appendChild(newDiv);

    // import styles
    var link = window.document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css';
    document.getElementsByTagName("head")[0].appendChild(link);

    var container = document.getElementById('open-apps-table');

    var hot = new Handsontable(container, {
      data: data,
      rowHeaders: true,
      colHeaders: ["depart", "return"],
      filters: true,
      formulas: true,
      stretchH: 'none',
      dropdownMenu: true,
      columnSorting: true,
      columns: columns
    });

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

  const runExtension = () => {
    // let departDatepicker = document.getElementById("package-departing-hp-package")
    // let returnDatepicker = document.getElementById("package-returning-hp-package")

    // departDatepicker.value = "12/01/2019"
    // returnDatepicker.value = "12/31/2019"

    createTable(columns, data);
  };

  if (document.readyState === "complete") {
    runExtension();
  } else {
    window.addEventListener("load", runExtension);
  }
})();