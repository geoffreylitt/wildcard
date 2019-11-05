(function () {
  'use strict';

  // These might change...
  const rowContainerClass = "_fhph4u"
  const rowClass = "_8ssblpx"

  function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  }

  const setupTable = () => {
    let rowContainer = document.querySelector("." + rowContainerClass)

    let rows = [...rowContainer.children].map(row => {
      return {
        id: row.querySelectorAll("meta[itemprop=position]")[0].getAttribute("content"),
        div: row
        // todo: add scraped data here
      }
    })

    // takes string IDs and shows only those rows
    let showRows = function (ids) {
      rowContainer.innerHTML = ""
      ids.forEach (id => {
        let row = rows.find(r => r.id === id)
        rowContainer.appendChild(row.div)
      })
    }

    let newDiv = htmlToElement("<div id=\"open-apps\" class=\"mydiv\" style=\"border-top: solid thin #ddd; position: fixed; overflow: hidden; background-color: white; height: 250px; width: 100%; z-index: 1000; bottom: 0;\"><div id=\"open-apps-table\"></div></div>")
    document.body.appendChild(newDiv);

    var link = window.document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css';
    document.getElementsByTagName("head")[0].appendChild(link);

    var data = [
      {
        id: "1",
        img: '<img style="max-height: 50px;" src="https://a0.muscache.com/im/pictures/865d3131-6c60-465f-bb0d-6176f17334d1.jpg?aki_policy=large" />',
        name: "Sunny South Beach 1min + FREE Parking",
        price: 437,
        rating: 4.88
      },
      {
        id: "2",
        img: '<img style="max-height: 50px;" src="https://a0.muscache.com/im/pictures/5152b9b0-3961-4f5d-a89c-2fb250e0e5eb.jpg?aki_policy=large" />',
        name: "Miami Brickell Downtown",
        price: 469,
        rating: 4.92
      },
      {
        id: "3",
        img: '<img style="max-height: 50px;" src="https://a0.muscache.com/im/pictures/865d3131-6c60-465f-bb0d-6176f17334d1.jpg?aki_policy=large" />',
        name: "Sunny South Beach 1min + FREE Parking",
        price: 437,
        rating: 4.88
      },
      {
        id: "4",
        img: '<img style="max-height: 50px;" src="https://a0.muscache.com/im/pictures/5152b9b0-3961-4f5d-a89c-2fb250e0e5eb.jpg?aki_policy=large" />',
        name: "Miami Brickell Downtown",
        price: 469,
        rating: 4.92
      },
      {
        id: "5",
        img: '<img style="max-height: 50px;" src="https://a0.muscache.com/im/pictures/865d3131-6c60-465f-bb0d-6176f17334d1.jpg?aki_policy=large" />',
        name: "Sunny South Beach 1min + FREE Parking",
        price: 437,
        rating: 4.88
      },
      {
        id: "6",
        img: '<img style="max-height: 50px;" src="https://a0.muscache.com/im/pictures/5152b9b0-3961-4f5d-a89c-2fb250e0e5eb.jpg?aki_policy=large" />',
        name: "Miami Brickell Downtown",
        price: 469,
        rating: 4.92
      },
    ];

    var container = document.getElementById('open-apps-table');

    var hot = new Handsontable(container, {
      data: data,
      rowHeaders: true,
      colHeaders: ['', 'Image', 'Name', 'Price', 'Rating', 'Custom'],
      filters: true,
      stretchH: 'all',
      hiddenColumns: {
        copyPasteEnabled: true,
        indicators: true,
        columns: [0]
      },
      contextMenu: {
        items: {
          "row_above": {}, "row_below": {}, "col_left": {}, "col_right": {}, "---------": {},
          "favorite": { // Own custom option
            name: "Favorite",
            hidden: false,
            callback: function (key, selection, clickEvent) { // Callback for specific option
              let ids = hot.getData(selection[0].start.row, 0, selection[0].end.row, 10);
              console.log("favorited", ids);
            }
          },
          "openlink": { // Own custom option
            name: "Open link",
            hidden: false,
            callback: function (key, selection, clickEvent) { // Callback for specific option
              let ids = hot.getData(selection[0].start.row, 0, selection[0].end.row, 10);
              console.log("open link", ids);
            }
          },
        }
      },
      dropdownMenu: true,
      columnSorting: true,
      columns: [
        { data: "id" },
        { data: "img", renderer: "html" },
        { data: "name" },
        { data: "price" },
        { data: "rating" },
        { data: "other" }
      ]
    });

    Handsontable.hooks.add('afterColumnSort', (c, d) => { 
      let ids = hot.getDataAtCol(0)
      showRows(ids)
    }, hot)
  };


  if (document.readyState === "complete") {
    setupTable();
  } else {
    window.addEventListener("load", setupTable);
  }
})();