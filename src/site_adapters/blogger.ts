import { RichTextEditor } from '../cell_editors/richTextEditor.js'

export const BloggerAdapter = {
    name: "Blogger",
    urlPattern: "blogger.com",
    colSpecs: [
        { name: "id", type: "text", hidden: true },
        { name: "document", editable: true, renderer: 'html', type: "text", editor: RichTextEditor },
        { name: "source", editable: true, renderer: 'html', type: "text", editor: RichTextEditor },
    ],
    getDataRows: () => {
        let container = document.getElementById("blogger-app");
        console.log(container);
        let container2 : HTMLElement = container;
        return [
            {
                el: container2,
                dataValues: {
                    id: 1, // only one row so we can just hardcode an ID
                    document: container.querySelector("#postingComposeBox"),
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

