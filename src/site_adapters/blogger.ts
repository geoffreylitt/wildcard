import { RichTextEditor } from '../cell_editors/richTextEditor.js'
import {urlContains} from "../utils";

const BloggerAdapter = createDomScrapingAdapter({
    name: "Blogger",
    enabled () => urlContains("blogger.com"),
    attributes: [
        { name: "id", type: "text", hidden: true },
        { name: "document", editable: true, renderer: 'html', type: "text", editor: RichTextEditor },
        { name: "source", editable: true, type: "text", editor: RichTextEditor },
    ],
    scrapePage: () => {
        let container : HTMLElement = document.getElementById("blogger-app");
        let iframeLoaded = document.querySelectorAll('iframe').length == 3;
        let doc = iframeLoaded ? document.querySelectorAll('iframe')[2].contentDocument.body : container.querySelector("#postingComposeBox");
        return [
            {
                id: 1,
                rowElements: [container],
                dataValues: {
                    document: doc,
                    source: container.querySelector("#postingHtmlBox"),
                }
            }
        ]
    },
    // Reload data anytime there's a click or keypress on the page
    addScrapeTriggers: (reload) => {
        document.addEventListener("click", (e) => { reload() });
        document.addEventListener("keydown", (e) => { reload() });
    },
    iframe: true
});

export default BloggerAdapter
