'use strict';

import { extractNumber, urlExact, urlContains } from "../utils"

export const YoutubeAdapter = {
    name: "Weather Channel",
    enable: () => {
        return urlContains("youtube.com")
    },
    colSpecs: [
        { name: "id", type: "text", hidden: true },
        { name: "Title", type: "text" },
        { name: "Time", type: "text"},
        { name: "Uploader", type: "text"},
        { name: "Watched?", type: "checkbox"}
    ],
    getDataRows: () => {
        let tableRows = document.querySelector('#contents').children;
        return Array.from(tableRows).map((el, index) => {
            let elAsHTMLElement : HTMLElement = <HTMLElement>el;

            if(el.querySelector('#video-title-link') !== null && el.querySelector('#overlays') != null && el.querySelector('#overlays').children[0] != null){

                let overlayChildrenAmount = el.querySelector('#overlays').children.length;
                let timeStampExists = el.querySelector('#overlays').children[overlayChildrenAmount - 2].children[1] !== undefined;
                let timeStamp = timeStampExists
                    ? el.querySelector('#overlays').children[overlayChildrenAmount - 2].children[1].textContent.replace((/  |\r\n|\n|\r/gm),"")
                    : "N/A";

                return {
                    els: [elAsHTMLElement],
                    dataValues: {
                        id: el.querySelector('#video-title-link').getAttribute("href"),
                        Title: el.querySelector('#video-title'),
                        Time: timeStamp,
                        Uploader: el.querySelector('#text').children[0],
                        'Watched?': el.querySelector('#progress') !== null
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
    setupReloadTriggers: (reload) => {
        document.addEventListener("click", (e) => { reload() });
        document.addEventListener("keydown", (e) => { reload() });
    }
};

