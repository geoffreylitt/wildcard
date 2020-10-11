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
function findRowElement(selectors, lca) {
    const candidates = [];
    const point = 1/selectors.length;
    let candidate = lca;
    while (candidate && candidate.tagName !== 'BODY') {
        const candidateEntry = {
            candidate,
            weight: 0
        };
        let sibling = candidate.nextElementSibling;
        while (sibling) {
            selectors.forEach(selector => {
                if (sibling.querySelector(selector)) {
                    candidateEntry.weight += point;
                }
            });
            sibling = sibling.nextElementSibling;
        }
        candidates.push(candidateEntry);
        candidate = candidate.parentNode;
    }
    candidates.sort((a, b) => {
        if (a.weight > b.weight) {
            return -1
        } else if (a.weight < b.weight) {
            return 1
        } else {
            return 0;
        }
    });
    return candidates[0].candidate;
}
function generateNodeSelector(node){
    let selector = node.tagName.toLowerCase();
    if (node.id) {
        selector += `#${node.id}`;
    } else if (node.classList && node.classList.length) {
        selector += `.${Array.from(node.classList).join('.')}`;
    }
    return selector;
}
function generateRowElementSelector(rowElement) {
    const selectorArray = [];
    let _node = rowElement;
    let selector;
    while(_node && _node.tagName !== "BODY") {
        selector = generateNodeSelector(_node)
        selectorArray.unshift(selector);
        _node = _node.parentNode;
        if (/[#]+/.test(selector)) {
            break;
        }
    }
    return selectorArray.join(">");
}
export function generateScraper(selectors) {
    const nodes = selectors.map(selector => document.querySelector(selector));
    const lca = findLCA(nodes);
    const rowElement = findRowElement(selectors, lca);
    const rowElementSelector = generateRowElementSelector(rowElement);
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
            return Array.from(document.querySelectorAll("${rowElementSelector}")).map((element, index) => {
                const dataValues = {};
                ${JSON.stringify(selectors)}.forEach((selector, index) => {
                    const selected = element.querySelector(selector);
                    dataValues[index] = selected? selected.textContent : "";
                });
                return {
                    id: String(index),
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
