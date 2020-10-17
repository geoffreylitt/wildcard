import { 
    readFromChromeLocalStorage, 
    saveToChromeLocalStorage,
    removeFromChromeLocalStorage
} from './utils';

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
    return  !!nodes.find(_node => _node.isSameNode(node));
}
function generateNodeSelector(node) {
    let selector = node.tagName.toLowerCase();
    if (node.classList && node.classList.length) {
        selector += `.${Array.from(node.classList).join('.')}`;
    }
    return selector;
}
function generateNodeSelectorFrom(node, from) {
    if (node.isSameNode(from)) {
        return null;
    }
    const selectors = [];
    let _node = node;
    while (!_node.isSameNode(from)) {
        selectors.unshift(generateNodeSelector(_node));
        _node = _node.parentNode;
    }
    return selectors.join(">");
}
function generateIndexedNodeSelector(node) {
    const tag = node.tagName.toLowerCase();
    const index = Array.prototype.indexOf.call(node.parentNode.children, node) + 1;
    return `${tag}:nth-child(${index})`;
}
function generateIndexedNodeSelectorFrom(node, from) {
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
function findLCA(nodes) {
    const ancestors = nodes.map(node => getAncestors(node));
    const [first, ...rest] = ancestors;
    const common = [];
    while (rest.length) {
        const branch = rest.pop();
        for (let i = 0; i < first.length; i++) {
            let found = false;
            for (let j = 0; j < branch.length; j++) {
                if (first[i].isEqualNode(branch[j])) {
                    if (!containsNode(common, first[i])) {
                        common.push(first[i]);
                    }
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
    }
    if (common.length > 1) {
        return findLCA(common);
    } else if (common.length === 1) {
        return common[0];
    } else {
        return nodes[0];
    }
}
function findRowElement(nodes, lca) {
    const candidates = [];
    let selectors = nodes.map(node => generateIndexedNodeSelectorFrom(node, lca)).filter(selector => selector);
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
        if (selectors.length) {
            selectors = selectors.map(selector => `${generateIndexedNodeSelector(candidate)}>${selector}`);
        } else {
            selectors = [generateIndexedNodeSelector(candidate)];
        }
        candidate = candidate.parentNode;
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
          rowElementSelector: generateNodeSelectorFrom(candidates[0].candidate, document.body),
          targetNodeSelectors: candidates[0].targetNodeSelectors
      };
    }
    return null
}

function generateScraper(targetSelectors, rowElementSelector) {
    const name = document.title
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
 
function scrapingListener(run) {
    const _matchesClick = new Map();
    const _matchesMouseMove = new Map();
    const targetNodes = [];
    const adaptersBaseKey = 'localStorageAdapter:adapters';
    document.body.addEventListener('click', (event) => {
        const wcRoot = document.getElementById('wc--root');
        const target = event.target as HTMLElement;
        if (wcRoot && wcRoot.contains(target)) {
            return;
        }
        event.preventDefault();
        _matchesClick.forEach((_style, _match) => {
            _match.style = _style;
        });
        _matchesClick.clear();
        if (target.textContent) {
            const targetNodeIndex = targetNodes.indexOf(target);
            if (targetNodeIndex === -1) {
                targetNodes.push(target);
            } else {
                targetNodes.splice(targetNodeIndex, 1);
            }
            if (targetNodes.length) {
                const lca = findLCA(targetNodes);
                const result = findRowElement(targetNodes, lca);
                if (result) {
                    const { rowElementSelector, targetNodeSelectors } = result;
                    Array.from(document.querySelectorAll(rowElementSelector))
                    .forEach((rowElement) => {
                        targetNodeSelectors.forEach(selector => {
                            const match = rowElement.querySelector(selector);
                            if (match && match.nodeType === Node.ELEMENT_NODE) {
                                _matchesClick.set(match, match.style)
                                match.style.border =  "1px solid red";
                            }
                        });
                    });
                    const { name, config } = generateScraper(targetNodeSelectors, rowElementSelector);
                    const adapterKey = `${adaptersBaseKey}:${name}`;
                    readFromChromeLocalStorage([adaptersBaseKey], (results) => {
                        const adapters = results[adaptersBaseKey];
                        if (!adapters.includes(name)) {
                            adapters.push(name);
                            saveToChromeLocalStorage({ 
                                [adaptersBaseKey]: adapters,
                                [adapterKey]: config
                            }, () => {
                                run();
                            })
                        } else {
                            saveToChromeLocalStorage({ [adapterKey]: config }, () => {
                                run();
                            });
                        }
                    });
                }
            } else {
                readFromChromeLocalStorage([adaptersBaseKey], (results) => {
                    const adapters = results[adaptersBaseKey];
                    const name = document.title;
                    const adapterKey = `${adaptersBaseKey}:${name}`;
                    const adapaterIndex = adapters.indexOf(name);
                    if (adapaterIndex !== -1) {
                        adapters.splice(adapaterIndex, 1);
                        saveToChromeLocalStorage({ [adaptersBaseKey]: adapters }, () => {
                            removeFromChromeLocalStorage([adapterKey, `query:${name}`], () => {
                                run();
                            });
                        });
                    }
                }); 
            }
        }
    });
    document.body.addEventListener('mousemove', (event) => {
        const wcRoot = document.getElementById('wc--root');
        const target = event.target as HTMLElement;
        if (wcRoot && wcRoot.contains(target)) {
            return;
        }
        _matchesMouseMove.forEach((_style, _match) => {
           _match.style.backgroundColor = _style;
        });
        _matchesMouseMove.clear();
        if (!target.childElementCount && target.textContent) {
            _matchesMouseMove.set(target, target.style.backgroundColor)
            target.style.backgroundColor =  "red";  
        }
    });
}

export function startScrapingListener(run) {
  scrapingListener(run);
}