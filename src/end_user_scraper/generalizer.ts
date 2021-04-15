import {
    generateIndexSelectorFrom,
    generateIndexSelector,
    generateClassSelectorFrom,
    getElementsBySelector
} from './domHelpers';

export function findRowElement(nodes, lca) {
    const candidates = [];
    let selectors = nodes.map(node => generateIndexSelectorFrom(node, lca)).filter(selector => selector);
    let candidate = lca;
    while (candidate && candidate.tagName !== 'BODY') {
        const candidateEntry = {
            candidate,
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
            selectors = selectors.map(selector => `${generateIndexSelector(candidate)}>${selector}`);
        } else {
            selectors = [generateIndexSelector(candidate)];
        }
        candidate = candidate.parentNode;
    }
    if (candidates.length) {
      candidates.sort((a, b) => b.score - a.score);
      const  { candidate } = candidates[0];
      const rowElementSelector = generateClassSelectorFrom(candidate, document.querySelector('body'), true);
      return {
          rowElement: candidate,
          rowElementSelector,
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
                let selector;
                const indexSelector = generateIndexSelectorFrom(nodes[i], rowElements[j]);
                const classSelector = generateClassSelectorFrom(nodes[i], rowElements[j], false);
                const classSelectorMatches = classSelector ? rowElements[j].querySelectorAll(classSelector) : [];
                if (classSelectorMatches.length === 1 && classSelectorMatches[0].isSameNode(nodes[i])) {
                    selector = classSelector;
                } else {
                    selector = indexSelector;
                }
                //const selector = generateIndexSelectorFrom(nodes[i], rowElements[j]);
                selectors.push(selector);
                break;
            }
        }
    }
    return selectors;
}