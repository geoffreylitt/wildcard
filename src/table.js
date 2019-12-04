(function () {
  'use strict';

  // These might change...
  const rowContainerClass = "_fhph4u"
  const rowClass = "_8ssblpx"
  const imageClass = "_1i2fr3fi"
  const titleClass = "_1ebt2xej"
  const priceClass = "_1p7iugi"
  const ratingClass = "_ky9opu0"
  const listingLinkClass = "_i24ijs"
  const likeListClass = "_v44ajx"
  const closeModalClass = "_1rp5252"
  const notesClass = "_1s7voim"

  const columns = [
    { data: "id" },
    { data: "img", renderer: "html" },
    { data: "name" },
    { data: "price",
      type: "numeric",
      numericFormat: {
        pattern: '$0,0',
        culture: 'en-US' // this is the default culture, set up for USD
      }
    },
    { data: "rating", type: "numeric", numericFormat: { pattern: '0,0.0' } },
    { data: "userdata" }
  ]

  // get numerical index for a given prop in our HOT
  // (should be a better way to deal with objects rather than tables)
  function colIndex(prop) {
    return columns.findIndex(e => e.data === prop)
  }

  // key for a given userdata val in storage
  function userdataKey(id, prop) {
    return `userdata_${id}_${prop}`
  }

  // convert HTML to a dom element
  function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  }

  // helper function: insert a DOM node after a given node
  function insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
  }

  function findRowContainer() {
    return document.querySelector("." + rowContainerClass)
  }

  function findRows() {
    return [...findRowContainer().children]
  }
  
  // perform a like action on a row
  function likeRow(row, rest) {
    let likeButton = row.div.querySelectorAll("button")[2] // so brittle...
    likeButton.click()
    setTimeout(() => {
      let list = document.querySelector("." + likeListClass)
      list.click()

      setTimeout(() => {
        let closeButton = document.querySelector("." + closeModalClass)
        closeButton.click()

        if (rest.length !== 0) {
          setTimeout(() => {
            likeRow(rest[0], rest.slice(1))
          }, 1000)
        }
      }, 1000)
    }, 1000)
  }

  // Given an array of row data, re-render it
  // todo: this should really take in an object, not an array...
  // the interface to the site should deal in objects, not tables
  function renderRow(rowToChange, rows) {
    let rowId = rowToChange[colIndex("id")]
    let userData = rowToChange[colIndex("userdata")]
    let divToChange = rows.find(r => r.id === rowId).div
    let userDataDiv = divToChange.querySelector(".oa-user-data")

    // if the user data div doesn't exist yet, make one
    if (!userDataDiv) {
      userDataDiv = htmlToElement(`<div class="${notesClass} oa-user-data" style="margin-top: 4px; font-weight: bold !important; color: #ff5722 !important;"></div>`)
      let lastNotesRow = [...divToChange.querySelectorAll("." + notesClass)].slice(-1)[0]
      insertAfter(userDataDiv, lastNotesRow)
    }

    userDataDiv.innerHTML = userData
  }

  const setupTable = () => {

    // set up the table
    let rowContainer = findRowContainer()
    let rawRows = findRows()

    let rows = rawRows.map(row => {
      let id = row.querySelectorAll("meta[itemprop=position]")[0].getAttribute("content")
      let path = row.querySelector("." + listingLinkClass) && row.querySelector("." + listingLinkClass).getAttribute('href')
      let url = `https://airbnb.com${path}`
      let key = userdataKey(id, "notes")

      return {
        div: row,
        id: id,
        imgUrl: row.querySelector("." + imageClass).getAttribute("style").match(/url\(\"(.*)\"\)/)[1],
        title: row.querySelector("." + titleClass) && row.querySelector("." + titleClass).textContent,
        price: row.querySelector("." + priceClass) && row.querySelector("." + priceClass).textContent.match(/\$([\d]*)/)[1],
        rating: row.querySelector("." + ratingClass) && row.querySelector("._ky9opu0").textContent,
        href: url,
        userdata: GM_getValue(key) || ""
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

    let newDiv = htmlToElement("<div id=\"open-apps\" class=\"mydiv\" style=\"visibility: hidden; border-top: solid thin #ddd; position: fixed; overflow: hidden; background-color: white; height: 300px; width: 100%; z-index: 1000; bottom: 0;\"><div id=\"open-apps-table\"></div></div>")
    document.body.appendChild(newDiv);

    var link = window.document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css';
    document.getElementsByTagName("head")[0].appendChild(link);

    var data = rows.map(r => {
      return {
        id: r.id,
        img: '<img style="max-height: 50px;" src="' + r.imgUrl + '"/>', 
        name: r.title,
        price: r.price,
        rating: r.rating,
        userdata: r.userdata
      }
    })

    var container = document.getElementById('open-apps-table');

    var hot = new Handsontable(container, {
      data: data,
      rowHeaders: true,
      colHeaders: ['', 'Image', 'Name', 'Price', 'Rating', 'User data'],
      filters: true,
      formulas: true,
      stretchH: 'all',
      hiddenColumns: {
        copyPasteEnabled: true,
        indicators: true,
        columns: [colIndex("id")]
      },
      contextMenu: {
        items: {
          "row_above": {}, "row_below": {}, "col_left": {}, "col_right": {}, "---------": {},
          "favorite": { // Own custom option
            name: "Favorite",
            hidden: false,
            callback: function (key, selection, clickEvent) { // Callback for specific option
              let ids = hot.getData(selection[0].start.row, 0, selection[0].end.row, 0).map(r => r[0]);
              let rowsToLike = ids.map(id => { return rows.find(r => r.id === id) })

              likeRow(rowsToLike[0], rowsToLike.slice(1))

            }
          },
          "openlink": { // Own custom option
            name: "Open link",
            hidden: false,
            callback: function (key, selection, clickEvent) { // Callback for specific option
              let ids = hot.getData(selection[0].start.row, 0, selection[0].end.row, 0).map(r => r[0]);
              let rowsToOpen = ids.map(id => { return rows.find(r => r.id === id) })

              rowsToOpen.forEach(row => {
                GM_openInTab(row.href)
              })
            }
          },
        }
      },
      dropdownMenu: true,
      columnSorting: true,
      columns: columns
    });

    // register hooks to re-sort the list
    ['afterColumnSort', 'afterFilter'].forEach(hook => {
      Handsontable.hooks.add(hook, (c, d) => { 
        let ids = hot.getDataAtCol(0)
        showRows(ids)
      }, hot)
    })

    Handsontable.hooks.add('afterChange', (changes) => { 
      changes.forEach(change => {
        let [changedRow, prop, _, val] = change
        if (prop === "userdata") {
          let newRowData = hot.getDataAtRow(changedRow)
          renderRow(newRowData, rows)

          let key = userdataKey(newRowData[colIndex("id")], "notes")
          GM_setValue(key, val)
        }
      })
    }, hot)

    Handsontable.hooks.once('afterRender', () => {
      console.log("re-rendering rows")
      rows.forEach((r, i) => {
        let newRowData = hot.getDataAtRow(i)
        renderRow(newRowData, rows)
      })
    }, hot)

    // sync UI state to table
    rows.forEach(r => {
      r.div.addEventListener("mouseover", (e) => {
        let indexInTable = hot.getDataAtCol(colIndex("id")).indexOf(r.id)
        hot.scrollViewportTo(Math.max(0, indexInTable - 1), 0)
      })
    })

    // sync table state to UI
    Handsontable.hooks.add('afterSelection', (row, col) => {
      let rowId = hot.getDataAtRow(row)[colIndex("id")]
      let div = rows.find(r => r.id === rowId).div

      // Add a border and scroll selected div into view
      div.style.outline = "solid thin #4b89ff"
      div.scrollIntoView({ behavior: "smooth", block: "center" })

      // Clear border on other divs
      let otherDivs = rows.filter(r => r.id !== rowId).map(r => r.div)
      otherDivs.forEach( d => d.style.outline = "none" )
    }, hot)



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
  };

  if (document.readyState === "complete") {
    setupTable();
  } else {
    window.addEventListener("load", setupTable);
  }
})();