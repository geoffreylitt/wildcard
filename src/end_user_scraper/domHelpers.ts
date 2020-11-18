function getAllClassCombinations(chars) {
    const result = [];
    const f = (prefix, chars) => {
        for (let i = 0; i < chars.length; i++) {
            result.push(`${prefix}.${chars[i]}`);
            f(`${prefix}.${chars[i]}`, chars.slice(i + 1));
        }
    };
    f('', chars);
    return result;
}

function generateNodeSelector(node) {
    let selector = node.tagName.toLowerCase();
    if (node.classList && node.classList.length) {
        let selectors = [];
        const siblings = Array.from(node.parentNode.children)
            .filter((element: HTMLElement) => !element.isSameNode(node));
        getAllClassCombinations(Array.from(node.classList))
            .forEach((selector, i) => {
                selectors[i] = {
                    selector,
                    score: 0
                }
                const selectorClassNames= selector.substring(1).split('.');
                siblings
                    .filter((sibling: HTMLElement) => sibling.classList && sibling.classList.length)
                    .map((sibling: HTMLElement) => Array.from(sibling.classList))
                    .forEach(classList => {
                        const allInClasslist = selectorClassNames.every(className => classList.includes(className));
                        if (allInClasslist) {
                            selectors[i].score += 1;
                        }
                    });
            });
        if (selectors.length) {
            selectors.sort((a, b) => b.score - a.score);
            const highestScore = selectors[0].score;
            selectors = selectors.filter(({ score }) => score === highestScore);
            selectors.sort((a, b) => b.selector.split('.').length - a.selector.split('.').length);
            selector = selectors.shift().selector;
        }
    }
    return selector;
}

export function generateIndexedNodeSelector(node) {
    const tag = node.tagName.toLowerCase();
    const index = Array.prototype.indexOf.call(node.parentNode.children, node) + 1;
    return `${tag}:nth-child(${index})`;
}

export function getElementsBySelector(selector) {
    return document.querySelectorAll<HTMLElement>(selector);
}

export function areAllSiblings(node, selector) {
    return Array
        .from(document.querySelectorAll(selector))
        .every(element => element.parentNode.isSameNode(node.parentNode));
}

export function generateNodeSelectorFrom(node, from) {
    if (node.isSameNode(from)) {
        return null;
    }
    const selectors = [];
    let _node = node;
    while (!_node.isSameNode(from)) {
        selectors.unshift(generateNodeSelector(_node));
        if (areAllSiblings(_node,  selectors.join('>'))) {
            return selectors.join('>')
        }
        _node = _node.parentNode;
    }
    return selectors.join(">");
}

export function generateIndexedSelectorFrom(node, from) {
    if (node.isSameNode(from)) {
        return null;
    }
    const selectors = [];
    let _node = node;
    while (!_node.isSameNode(from)) {
        selectors.unshift(generateIndexedNodeSelector(_node));
        _node = _node.parentNode;
    }
    return selectors.join('>');
}

export function inSelectorElements({ selector, node }) {
    const result = Array
    .from(document.querySelectorAll(selector))
    .filter(element => element.contains(node));
    return result.length === 1;
}
