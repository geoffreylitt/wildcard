'use strict';

import { extractNumber, urlExact, urlContains } from "../utils"
import { createDomScrapingAdapter } from "./domScrapingBase"
import debounce from 'lodash/debounce'


const YoutubeAdapter = createDomScrapingAdapter({
    name: "YouTube",
    enabled: () => {
        return urlContains("youtube.com")
    },
    attributes: [
        { name: "id", type: "text", hidden: true },
        { name: "Title", type: "text" },
        { name: "Time", type: "text"},
        { name: "Uploader", type: "text"},
        { name: "% Watched", type: "numeric"}
    ],
    scrapePage: () => {
        let tableRows = document.querySelector('#contents').children;
        if (tableRows.length == 1) {
            // for use on video listing page e.g. https://www.youtube.com/user/*/videos
            tableRows = document.querySelector('#contents #items').children;
        }
        return Array.from(tableRows).map((el, index) => {
            let elAsHTMLElement : HTMLElement = <HTMLElement>el;

            // on /user/*/videos, link is in #thumbnail, not #video-title-link
            if((el.querySelector('#video-title-link') !== null || el.querySelector('#thumbnail') !== null) && el.querySelector('#overlays') != null && el.querySelector('#overlays').children[0] != null){

                let overlayChildrenAmount = el.querySelector('#overlays').children.length;
                let timeStampExists = overlayChildrenAmount > 1 && el.querySelector('#overlays').children[overlayChildrenAmount - 2].children[1] !== undefined;
                let timeStamp = timeStampExists
                    ? el.querySelector('#overlays').children[overlayChildrenAmount - 2].children[1].textContent.replace((/  |\r\n|\n|\r/gm),"")
                    : "N/A";
                let watchedPercentage = el.querySelector('#progress') !== null
                    ? progressToNumber((el.querySelector('#progress') as HTMLElement).style.width)
                    : 0;

                return {
                    rowElements: [elAsHTMLElement],
                    id: (el.querySelector('#video-title-link') || el.querySelector('#thumbnail')).getAttribute("href"),
                    dataValues: {
                        Title: el.querySelector('#video-title'),
                        Time: timeStamp,
                        Uploader: el.querySelector('#text').children[0],
                        '% Watched': watchedPercentage,
                    },
                }
            }
            else
            {
                return null;
            }

        }).filter(el => el !== null)
    },
    // Reload data anytime there's a click or keypress on the page
    addScrapeTriggers: (reload) => {
        document.addEventListener("click", (e) => { reload() });
        document.addEventListener("keydown", (e) => { reload() });
        document.addEventListener("scroll", debounce((e) => { reload() }, 50));
    },
    onRowSelected: (row) => {
        row.rowElements.forEach(el => {
            if (el.style) {
                el.style["background-color"] = `#c9ebff`
            }
        });
        row.rowElements[0].scrollIntoView({ behavior: "smooth", block: "center" })
    },
    onRowUnselected: (row) => {
        row.rowElements.forEach(el => {
            if(el.style) {
                el.style["background-color"] = ``
            }
        })
    },
});

function progressToNumber(progress){
    let strippedProgress = progress.slice(0, -1);
    return parseInt(strippedProgress);
}

export default YoutubeAdapter;
