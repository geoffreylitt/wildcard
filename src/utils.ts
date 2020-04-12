/** Try to extract the first integer from a text string or HTML element */
export function extractNumber(input:any, defaultValue?:number):number {
  let text, result;

  if (input instanceof HTMLElement)  {
    text = input.textContent
  } else if (typeof input === "string") {
    text = input
  }
  if (text) { result = text.match(/[^0-9]*([0-9\.]*).*/)[1] }

  if (result) {
    return Number(result)
  } else if (defaultValue !== undefined) {
    return defaultValue
  } else {
    return null
  }
}

/** Returns true if current page URL contains given URL as substring.
 *  Mainly used in [[SiteAdapterOptions]] enable functions
*/
export function urlContains(fragment:string):boolean {
  return String(window.location).indexOf(fragment) !== -1
}

export function urlExact(url:string):boolean {
  return String(window.location) === url ||
         String(window.location) === "https://" + url
}

export function htmlToElement(html):HTMLElement {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild as HTMLElement;
}

export function onDomReady(fn) {
  if (document.readyState!='loading') fn();
  else document.addEventListener('DOMContentLoaded', fn)
}
