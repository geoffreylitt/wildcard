{
    name: "MIT Course Catalog",
    matches: /http(s)?:\/\/student\.mit\.edu\/catalog\/[\w0-9]+\.html/,
    attributes: [
        { name: "id", type: "text", hidden: true },
        { name: "code", type: "text" },
        { name: "name", type: "text" },
        { name: "level", type: "text" }
    ],
    scrapePage: () => {
        return Array.from(document.querySelectorAll('h3'))
            .slice(1)
            .filter(function (el) {
            var element = el;
            return /[A-Z0-9]+\.[0-9]+(\[[A-Z]\])?\s.+/.test(element.textContent);
        }).map((el) => {
            const element = el;
            const matches = /([A-Z0-9]+\.[0-9]+(\[[A-Z]\])?)\s(.+)/.exec(element.textContent.trim());
            const match = matches[0];
            const id = matches[1];
            const symbol = matches[2]; 
            const name = matches[3];
            const rowElements = [element];
            let currentElement = element.nextSibling;
            while (currentElement && currentElement.tagName !== "H3") {
                rowElements.push(currentElement);
                currentElement = currentElement.nextSibling;
            }
            let level;
            for (var i = 1; i < rowElements.length; i++) {
                var rowElement = rowElements[i];
                if (rowElement.tagName === 'IMG') {
                    if (rowElement.title === 'Undergrad') {
                        level = 'U';
                        break;
                    }
                    else if (rowElement.title === 'Graduate') {
                        level = 'G';
                        break;
                    }
                }
            }
            return {
                id: id,
                rowElements: rowElements,
                dataValues: {
                    code: id,
                    name: name,
                    level: level
                },
                annotationContainer: rowElements[rowElements.length - 1],
                annotationTemplate: '<span style="color: #b12b28;">$annotation</span>'
            };
        });
    },
    onRowSelected: function (row) {
        const rowElement = row.rowElements[0];
        rowElement.style.border = "solid 2px #b12b28";
        rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    onRowUnselected: function (row) {
        const rowElement = row.rowElements[0];
        rowElement.style.border = '';
    }
}