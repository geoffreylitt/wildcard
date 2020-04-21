// 'use strict';

// import { urlExact, urlContains, extractNumber, onDomReady } from "../utils";
// import DomScrapingBaseAdapter, { ScrapedRow } from "./domScrapingBase"

// class FluxAdapter extends DomScrapingBaseAdapter {
//   static enabled () {
//     return urlContains("flux2.luar.dcc.ufmg.br")
//   }

//   initialize () {
//     onDomReady(() => {
//       this.loadTable();

//       // listen for clicks or input changes on the table
//       const tbody = document.querySelector("div[xpdlid='valorBrutoAbs'] tbody")
//       tbody.addEventListener("click", (e) => { this.loadTable() });
//       tbody.addEventListener("change", (e) => { this.loadTable() });
//     })
//   }

//   siteName = "Flux Table"

//   attributes = [
//     { name: "0", type: "numeric", editable: true},
//     { name: "1", type: "numeric", editable: true},
//     { name: "2", type: "numeric", editable: true},
//     { name: "3", type: "numeric", editable: true},
//     { name: "4", type: "numeric", editable: true},
//     { name: "5", type: "numeric", editable: true},
//     { name: "6", type: "numeric", editable: true},
//     { name: "7", type: "numeric", editable: true},
//     { name: "8", type: "numeric", editable: true},
//     { name: "9", type: "numeric", editable: true},
//     { name: "10", type: "numeric", editable: true},
//   ]

//   scrapePage() {
//     let result = []
//     let tbody = document.querySelector("div[xpdlid='valorBrutoAbs'] tbody")

//     for (let i = 0; i < 8; i++) {
//       const newScrapedRow:ScrapedRow =
//         {
//           id: String(i),
//           rowElements: [tbody.children[i] as HTMLElement],
//           attributes: {
//             "0": document.querySelector(`#valorBrutoAbs--${i}--0`),
//             "1": document.querySelector(`#valorBrutoAbs--${i}--1`),
//             "2": document.querySelector(`#valorBrutoAbs--${i}--2`),
//             "3": document.querySelector(`#valorBrutoAbs--${i}--3`),
//             "4": document.querySelector(`#valorBrutoAbs--${i}--4`),
//             "5": document.querySelector(`#valorBrutoAbs--${i}--5`),
//             "6": document.querySelector(`#valorBrutoAbs--${i}--6`),
//             "7": document.querySelector(`#valorBrutoAbs--${i}--7`),
//             "8": document.querySelector(`#valorBrutoAbs--${i}--8`),
//             "9": document.querySelector(`#valorBrutoAbs--${i}--9`),
//             "10": document.querySelector(`#valorBrutoAbs--${i}--10`),
//           }
//         }

//       result.push(newScrapedRow)
//     }

//     return result
//   }
// }

// export default FluxAdapter;
