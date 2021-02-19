import {
    generateIndexedSelectorFrom,
    generateIndexedNodeSelector,
    generateNodeSelectorFrom,
    getElementsBySelector
} from './domHelpers';

export function findRowElement(nodes, lca) {
    const candidates = [];
    let selectors = nodes.map(node => generateIndexedSelectorFrom(node, lca)).filter(selector => selector);
    let candidate = lca;
    while (candidate && candidate.tagName !== 'BODY') {
        const candidateEntry = {
            candidate: candidate,
            score: 0
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
      candidates.sort((a, b) => b.score - a.score);
      return {
          rowElement: candidates[0].candidate,
          rowElementSelector: generateNodeSelectorFrom(candidates[0].candidate, document.body),
      };
    }
    return null
}

export function generateColumnSelectors(rowElementSelector, nodes) {
    const selectors = [];
    const rowElements = getElementsBySelector(rowElementSelector);
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < rowElements.length; j++) {
            if (rowElements[j].contains(nodes[i])) {
                selectors.push(generateIndexedSelectorFrom(nodes[i], rowElements[j]));
                break;
            }
        }
    }
    return selectors;
}