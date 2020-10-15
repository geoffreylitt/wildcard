function evaluateXpath(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
}
function xpathQuerySelector(xpath) {
    const elements = [];
    const iterator = evaluateXpath(xpath);
    let element = iterator.iterateNext();
    while (element) {
        elements.push(element);
        element = iterator.iterateNext();
    }
    return elements;
}
function getRowElementXPath(node){
    let xpath = generateXpath(node);
    if (xpath) {
        let score = xpathQuerySelector(xpath).length;
        let done = false;
        while (!done) {
            const matches = xpathQuerySelector(xpath + '/..').length;
            if (matches < score){
                done = true;
            } else {
                score = matches;
                xpath += '/..';
            }
        }
        return { 
            xpath,
            matches: xpathQuerySelector(xpath)
        }
    }
    return null;
}
function xpathBasedListener() {
    const _matches = new Map();
    document.body.addEventListener('mousemove', (event) => {
        const result = getRowElementXPath(event.target);
        if (result) {
            const { xpath, matches } = result;
            _matches.forEach((_style, _match) => {
                _match.style = _style;
            });
            _matches.clear();
            matches.forEach(match => {
                if (match.nodeType === Node.ELEMENT_NODE) {
                    _matches.set(match, match.style)
                    match.style.border =  "1px solid red";
                }
            });
        }
    });
}
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
    const found = nodes.find(_node => _node.isSameNode(node));
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
    } else if (common[0]) {
        return common[0];
    } else {
        return nodes[0];
    }
}
function generateNodeSelector(node) {
    let selector = node.tagName.toLowerCase();
    if (node.classList && node.classList.length) {
        selector += `.${Array.from(node.classList).join('.')}`;
    }
    return selector;
}
function generateIndexedNodeSelector(node) {
    const tag = node.tagName.toLowerCase();
    const index = Array.prototype.indexOf.call(node.parentNode.children, node) + 1;
    return `${tag}:nth-child(${index})`;
}
function generateNodeSelectorFromBody(node) {
    const selectors = [];
    let _node = node;
    while (_node && _node.tagName !== "BODY") {
        selectors.unshift(generateNodeSelector(_node));
        _node = _node.parentNode;
    }
    return selectors.join(">");
}
function generateIndexedNodeSelectorFrom(node, from) {
    const selectors = [];
    let _node = node;
    while (!_node.isSameNode(from)) {
        selectors.unshift(generateIndexedNodeSelector(_node));
        _node = _node.parentNode;
    }
    return selectors.join('>');
}
function findRowElement(nodes, lca) {
    const candidates = [];
    let selectors = nodes.map(node => generateIndexedNodeSelectorFrom(node, lca));
    let candidate = lca;
    while (candidate && candidate.tagName !== 'BODY') {
        const candidateEntry = {
            candidate: candidate,
            score: 0,
            targetNodeSelectors: selectors
        };
        let nextSibling = candidate.nextElementSibling;
        let previousSibling = candidate.previousElementSibling;
        while (nextSibling) {
            selectors.forEach(selector => {
                if (nextSibling.querySelector(selector)) {
                    candidateEntry.score += 1;
                }
            });
            nextSibling = nextSibling.nextElementSibling;
        }
        while (previousSibling) {
            selectors.forEach(selector => {
                if (previousSibling.querySelector(selector)) {
                    candidateEntry.score += 1;
                }
            });
            previousSibling = previousSibling.previousElementSibling;
        }
        candidates.push(candidateEntry);
        candidate = candidate.parentNode;
        selectors = selectors.map(selector => `${generateIndexedNodeSelector(candidate)}>${selector}`);
    }
    if (candidates.length) {
      candidates.sort(function (a, b) {
          if (a.score > b.score) {
              return -1;
          }
          else if (a.score < b.score) {
              return 1;
          }
          else {
              return 0;
          }
      });
      return {
          rowElement: candidates[0].candidate,
          rowElementSelector: generateNodeSelectorFromBody(candidates[0].candidate),
          targetNodeSelectors: candidates[0].targetNodeSelectors
      };
    }
    return null
}
 
function generateXpath(node) {
    const xpath = [];
    let _node = node;
    let selector;
    while (_node && _node.tagName && _node.tagName !== 'BODY') {
        selector = _node.tagName;
        if (_node.classList && _node.classList.length) {
            selector += `[contains(@class, '${Array.from(_node.classList).join(' ')}')]`;
        }
        xpath.push(selector);
        _node = _node.parentNode;
    }
    if (xpath.length) {
        xpath.reverse();
        xpath[0] = `//BODY/${xpath[0]}`;
        return xpath.join('/');
    }
    return null;
}
function cssBasedListner() {
    const _matches = new Map();
    const targetNodes = [];
    document.body.addEventListener('mousedown', (event) => {
        _matches.forEach((_style, _match) => {
            _match.style = _style;
        });
        _matches.clear();
        const target = event.target as HTMLElement;
        if (targetNodes.indexOf(target) === -1) {
            targetNodes.push(target);
            let lca = findLCA(targetNodes);
            if (lca.isSameNode(targetNodes[0])) {
                lca = lca.parentNode;
            }
            const result = findRowElement(targetNodes, lca);
            if (result) {
                const { rowElementSelector, targetNodeSelectors } = result;
                Array.from(document.querySelectorAll(rowElementSelector))
                .forEach((rowElement) => {
                    targetNodeSelectors.forEach(selector => {
                        const match = rowElement.querySelector(selector);
                        if (match && match.nodeType === Node.ELEMENT_NODE) {
                            _matches.set(match, match.style)
                            match.style.border =  "1px solid red";
                        }
                    });
                });
                const { config } = generateScraper(targetNodeSelectors, rowElementSelector);
                console.log(config);
            }
        }
    });
    document.body.addEventListener('mousemove', (event) => {
        const target = event.target as HTMLElement;
        _matches.forEach((_style, _match) => {
           _match.style.backgroundColor = _style;
        });
        _matches.clear();
        _matches.set(target, target.style.backgroundColor)
        target.style.backgroundColor =  "red";
    });
}

export function startScraper() {
  cssBasedListner();
}

export function generateScraper(targetSelectors, rowElementSelector) {
    const attributes = targetSelectors.map((_, index) => {
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
                ${JSON.stringify(targetSelectors)}.forEach((selector, index) => {
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
