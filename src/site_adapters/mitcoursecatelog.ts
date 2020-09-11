'use strict';

import { urlMatches } from "../utils";
import { createDomScrapingAdapter } from "./domScrapingBase";

const MITCourseCatalog = createDomScrapingAdapter({
    name: "MIT Course Catalog",
    enabled: () => {
        return urlMatches(/http(s)?:\/\/student\.mit\.edu\/catalog\/[\w0-9]+\.html/)
    },
    attributes: [
        { name: "id", type: "text", hidden: true },
        { name: "code", type: "text" },
        { name: "name", type: "text"},
        { name: "level", type: "text" } 
    ],
    scrapePage: () => {
        return Array.from(document.querySelectorAll('h3'))
        .slice(1)
        .filter(el => {
            const element = el as HTMLElement;
            return /[A-Z0-9]+\.[0-9]+(\[[A-Z]\])?\s.+/.test(element.textContent);
        }).map(el => {
            const element = el as HTMLElement;
            const [match, id, symbol, name] = /([A-Z0-9]+\.[0-9]+(\[[A-Z]\])?)\s(.+)/.exec(element.textContent);
            const rowElements = [element];
            let currentElement = element.nextSibling as HTMLElement;
            while (currentElement && currentElement.tagName !== "H3" ) {
                rowElements.push(currentElement);
                currentElement = currentElement.nextSibling as HTMLElement;
            }
            let level; 
            for (let i = 1; i < rowElements.length; i++) {
                const rowElement = rowElements[i];
                if (rowElement.tagName === 'IMG') {
                    if ((rowElement as HTMLImageElement).title === 'Undergrad') {
                        level = 'U';
                        break;
                    } else if ((rowElement as HTMLImageElement).title === 'Graduate') {
                        level = 'G';
                        break;
                    }
                }
            }
            return {
                id,
                rowElements,
                dataValues: {
                    code: id,
                    name,
                    level
                },
                annotationContainer: rowElements[rowElements.length - 1],
                annotationTemplate: '<span style="color: #b12b28;">$annotation</span>'
            }
        });
    },
    onRowSelected: (row) => {
        const rowElement = row.rowElements[0];
        rowElement.style.border = `solid 2px #b12b28`;
        rowElement.scrollIntoView({ behavior: "smooth", block: "center" })
      },
      onRowUnselected: (row) => {
        const rowElement = row.rowElements[0];
        rowElement.style.border = '';
      }
});

export default MITCourseCatalog;

