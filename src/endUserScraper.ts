function getAncestors(node) {
    const ancestors = [node];
    let ancestor = node.parentNode;
    while(ancestor && ancestor.tagName !== 'BODY') {
        ancestors.push(ancestor);
        ancestor = ancestor.parentNode;
    }
    return ancestors;
}
function containsNode(nodes, node) {
    const found = nodes.find(_node => _node.isEqualNode(node));
    const isParent = nodes.some(_node => node.contains(_node));
    return !!found || !!isParent;
}
function findLCA(nodes) {
    const ancestors = nodes.map(node => getAncestors(node));
    const first = ancestors[0];
    const common = [];
    for (let i = 0; i < first.length; i++) {
        for (let j = 1; j < ancestors.length; j++) {
            for (let k = 0; k < ancestors[j].length; k++) {
                if (first[i].isEqualNode(ancestors[j][k]) && !containsNode(common, first[i])) {
                    common.push(first[i]);
                    break;
                }
            }
        }
    }
    if (common.length > 1) {
        return findLCA(common);
    }
    return common[0];
}
function generateNodeSelector(node){
    const nodeSelector = `${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : `.${Array.from(node.classList).join('.')}`}`;
    const selectorArray = [nodeSelector];
    let _node = node.parentNode;
    while(_node && _node.tagName !== "BODY") {
        selectorArray.unshift(_node.tagName.toLowerCase());
        _node = _node.parentNode;
    }
    return selectorArray.join(">");
}
export function generateScraper(selectors) {
    const nodes = selectors.map(selector => document.querySelector(selector));
    const lca = findLCA(nodes);
    const lcaSelector = generateNodeSelector(lca);
    const name = document.title;
    const attributes = selectors.map((_, index) => {
        return {
            name: String(index),
            type: "text"
        }
    });
    const config =
    `{
        name: "${name}",
        contains: "${window.location.href}",
        attributes: ${JSON.stringify(attributes)},
        scrapePage: () => {
            return Array.from(document.querySelectorAll("${lcaSelector}")).map((element, index) => {
                const dataValues = {};
                ${JSON.stringify(selectors)}.forEach((selector, index) => {
                    const selected = element.querySelector(selector);
                    dataValues[index] = selected? selected.textContent : "";
                });
                return {
                    id: "${lcaSelector}" + index,
                    dataValues,
                    rowElements: [element]
                }
            });
        }
    }`.trim();
    return {
        name,
        config
    };
}
