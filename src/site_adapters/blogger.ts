import { RichTextEditor } from '../cell_editors/richTextEditor.js'
import {urlContains} from "../utils";

export const BloggerAdapter = {
    name: "Blogger",
    enable: () => urlContains("blogger.com"),
    colSpecs: [
        { name: "id", type: "text", hidden: true },
        { name: "document", editable: true, renderer: 'html', type: "text", editor: RichTextEditor },
        { name: "source", editable: true, type: "text", editor: RichTextEditor },
    ],
    getDataRows: () => {
        let container : HTMLElement = document.getElementById("blogger-app");
        let iframeLoaded = document.querySelectorAll('iframe').length == 3;
        let doc = iframeLoaded ? document.querySelectorAll('iframe')[2].contentDocument.body : container.querySelector("#postingComposeBox");
        return [
            {
                els: [container],
                dataValues: {
                    id: 1, // only one row so we can just hardcode an ID
                    document: doc,
                    source: container.querySelector("#postingHtmlBox"),
                }
            }
        ]
    },
    // Reload data anytime there's a click or keypress on the page
    setupReloadTriggers: (reload) => {
        document.addEventListener("click", (e) => { reload() });
        document.addEventListener("keydown", (e) => { reload() });
    }
};