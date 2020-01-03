(function () {
  'use strict';

  var rows;

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
    { data: "latitude", type: "numeric" },
    { data: "longitude", type: "numeric" },
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
          }, 500)
        }
      }, 500)
    }, 500)
  }

  // Given an array of row data, re-render it
  // todo: this should really take in an object, not an array...
  // the interface to the site should deal in objects, not tables
  function renderRow(rowToChange) {
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

  // given rows data, formats for handsontable
  function hotDataFromRows(rowsData) {
    return rowsData.map(r => {
      return {
        id: r.id,
        img: '<img style="max-height: 50px;" src="' + r.imgUrl + '"/>', 
        name: r.title,
        price: r.price,
        rating: r.rating,
        userdata: r.userdata,
        latitude: r.latitude,
        longitude: r.longitude
      }
    })
  }

  // takes string IDs and shows only those rows
  function showRows(ids) {
    let rowContainer = findRowContainer()
    rowContainer.innerHTML = ""
    ids.forEach (id => {
      let row = rows.find(r => r.id === id)
      rowContainer.appendChild(row.div)
    })
  }

  const setupTable = () => {
    // set up the table
    let rowContainer = findRowContainer()

    let rawRows = findRows()
    rows = rawRows.map(row => {
      let path = row.querySelector("." + listingLinkClass) && row.querySelector("." + listingLinkClass).getAttribute('href')
      let id = path.match(/\/rooms\/([0-9]*)\?/) && path.match(/\/rooms\/([0-9]*)\?/)[1]
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
        userdata: GM_getValue(key) || "",
        latitude: 0,
        longitude: 0
      }
    })

    let newDiv = htmlToElement("<div id=\"open-apps\" class=\"mydiv\" style=\"visibility: hidden; border-top: solid thin #ddd; position: fixed; overflow: hidden; background-color: white; height: 300px; width: 100%; z-index: 1000; bottom: 0;\"><div id=\"open-apps-table\"></div></div>")
    document.body.appendChild(newDiv);

    var link = window.document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css';
    document.getElementsByTagName("head")[0].appendChild(link);

    var data = hotDataFromRows(rows)

    var container = document.getElementById('open-apps-table');

    var hot = new Handsontable(container, {
      data: data,
      rowHeaders: true,
      colHeaders: columns.map(c => c.data),
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
          // "row_above": {}, "row_below": {}, "col_left": {}, "col_right": {}, "---------": {},
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
      columns: columns,
      licenseKey: 'non-commercial-and-evaluation'
    });

    // register hooks to re-sort the list
    ['afterColumnSort', 'afterFilter'].forEach(hook => {
      Handsontable.hooks.add(hook, (c, d) => { 
        let ids = hot.getDataAtCol(0)
        showRows(ids)
      }, hot)
    })

    Handsontable.hooks.add('afterChange', (changes) => { 
      if (changes) {
        changes.forEach(change => {
          let [changedRow, prop, _, val] = change
          if (prop === "userdata") {
            // hacky formula evaluation
            let formulaMatch = val && val.match(/=walkscore\((.*), (.*)\)/)
            if(formulaMatch) {
              let lat = hot.getDataAtCell(changedRow, colIndex(formulaMatch[1]))
              let long = hot.getDataAtCell(changedRow, colIndex(formulaMatch[2]))
              const apikey = "75bb7422674ae495291290bf8a4ad7fd"

              // hot.setDataAtCell(changedRow, colIndex("userdata"), `${lat}, ${long}`)
              hot.setDataAtCell(changedRow, colIndex("userdata"), `loading...`)

              let url = `http://api.walkscore.com/score?format=json&lat=${lat}&lon=${long}&transit=1&bike=1&wsapikey=${apikey}`

              GM_xmlhttpRequest({
                method: "GET",
                url: url,
                onload: (response) => {
                  if (response.status === 200) {
                    let responseObj = JSON.parse(response.response)
                    hot.setDataAtCell(changedRow, colIndex("userdata"), `${responseObj.walkscore} (${responseObj.description})`)
                  } else {
                    hot.setDataAtCell(changedRow, colIndex("userdata"), "error")
                  }
                }
              });
            } else {
              let newRowData = hot.getDataAtRow(changedRow)
              renderRow(newRowData)
    
              let key = userdataKey(newRowData[colIndex("id")], "notes")
              GM_setValue(key, val)
            }
          }
        })
      }
    }, hot)

    Handsontable.hooks.once('afterRender', () => {
      rows.forEach((r, i) => {
        let newRowData = hot.getDataAtRow(i)
        renderRow(newRowData)
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

    unsafeWindow.updateListings = (rawListings) => {
      setTimeout(() => {
        let newRows = _.keyBy(document.querySelector("." + rowContainerClass).children, (row) => {
          let path = row.querySelector("." + listingLinkClass) && row.querySelector("." + listingLinkClass).getAttribute('href')
          let id = path.match(/\/rooms\/([0-9]*)\?/) && path.match(/\/rooms\/([0-9]*)\?/)[1]
          return id
        })

        rows = rawListings.filter(rl => {
          return newRows.hasOwnProperty(String(rl.listing.id))
        }).map(rl => {
          let id = String(rl.listing.id)
          let key = userdataKey(id, "notes")

          return {
            id: String(rl.listing.id),
            imgUrl: rl.listing.picture_url,
            title: rl.listing.name,
            price: rl.pricing_quote.rate.amount,
            rating: rl.listing.avg_rating,
            userdata: GM_getValue(key) || "",
            latitude: rl.listing.lat,
            longitude: rl.listing.lng,
            div: newRows[id],
            href: "https://www.airbnb.com/rooms/" + id
          }
        })

        let newData = hotDataFromRows(rows)
        hot.loadData(newData)
      }, 1000) // yuck, hacky but it works....
    }

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