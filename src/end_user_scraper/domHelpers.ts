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

export function generateClassSeleector(node, rowElement, isRow) {
    if (node.classList && node.classList.length) {
        let selectors = [];
        const nodeTagName = node.tagName.toLowerCase();
        const allClassCombinations = getAllClassCombinations(Array.from(node.classList));
        if (isRow) {
            const siblings = Array
                .from(node.parentNode.children)
                .filter((element: HTMLElement) => !element.isSameNode(node));
            allClassCombinations.forEach((selector, i) => {
                selector = `${nodeTagName}${selector}`;
                selectors[i] = {
                    selector,
                    score: 0
                }
                const selectorClassNames= selector.substring(nodeTagName.length+1).split('.');
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
        } else {
            allClassCombinations.forEach((selector, i) => {
                selector = `${nodeTagName}${selector}`;
                selectors[i] = {
                    selector,
                    score: 0
                }
                const selectorMatchesInRow = rowElement.querySelectorAll(selector);
                if (selectorMatchesInRow.length === 1 && selectorMatchesInRow[0].isSameNode(node)) {
                    selectors[i].score += 1;
                }
            });
        }
        if (selectors.length && selectors.some(({ score }) => score > 0)) {
            selectors.sort((a, b) => b.score - a.score);
            const highestScore = selectors[0].score;
            selectors = selectors.filter(({ score }) => score === highestScore);
            selectors.sort((a, b) => a.selector.split('.').length - b.selector.split('.').length);
            const shortestLength = selectors[0].selector.split('.').length;
            selectors = selectors.filter(({ selector }) => selector.split('.').length === shortestLength);
            return selectors.map(s => s.selector);
        }
    }
    return [];
}

export function generateIndexSelector(node) {
    const tag = node.tagName.toLowerCase();
    const index = Array.prototype.indexOf.call(node.parentNode.children, node) + 1;
    return `${tag}:nth-child(${index})`;
}

export function getElementsBySelector(selector) {
    return document.querySelectorAll<HTMLElement>(selector);
}

export function areAllSiblings(node, selector) {
    return Array
        .from(getElementsBySelector(selector))
        .every(element => element.parentNode.isSameNode(node.parentNode));
}

export function generateClassSelectorFrom(node, from, isRow) {
    if (node.isSameNode(from)) {
        return null;
    }
    const selectors = [];
    let _node = node;
    if (isRow) {
        while (!_node.isSameNode(from)) {
            const selector = generateClassSeleector(_node, from, isRow)[0] || _node.tagName.toLowerCase();
            selectors.unshift(selector);
            if (areAllSiblings(_node,  selectors.join(' '))) {
                return selectors.join(' ');
            }
            _node = _node.parentNode;
        }
        return selectors.join(" ");
    }
    return generateClassSeleector(_node, from, isRow)[0]  
}

export function generateIndexSelectorFrom(node, from) {
    if (node.isSameNode(from)) {
        return null;
    }
    const selectors = [];
    let _node = node;
    while (!_node.isSameNode(from)) {
        selectors.unshift(generateIndexSelector(_node));
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
