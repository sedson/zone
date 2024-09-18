// @ ts-check
/**
 * @file Dom utilities.
 */


/**
 * Proxy for document.querySelector with improved type checking.
 * @param {HTMLElement | string} selector A selector or an HTMLElement.
 * @returns {HTMLElement | null}
 */
export function select(selector) {
  if (selector instanceof HTMLElement) {
    return selector;
  }
  const elem = document.querySelector(selector);
  return elem ?? null;
}


/**
 * Proxy for document.createElement with some extra utility for adding ids and 
 * classes.
 * @param {string} tag The tag to make. Examples: 'a', 'div.container',
 *     'p#bio.large-text.red', or 'p #bio .large-text .red'.
 * @param {object} styleObject 
 * @returns {HTMLElement}
 */
export function tag (string, props) {
  const tag = string.split(/#|\./)[0].trim();
  const elem = document.createElement(tag);

  const idRegEx = /#(\w|-)+/g;
  const id = string.match(idRegEx);
  if (id) {
    elem.id = id[0].replace('#', '');
  }

  const classRegEx = /\.(\w|-)+/g;
  const classList = string.match(classRegEx);
  if (classList) {
    classList.forEach((x) => elem.classList.add(x.replace('.', '')));
  }
  
  for (let propName in props) {
    const prop = props[propName];
    if (typeof prop === 'object') {
      Object.assign(elem[propName], props[propName]);
      continue;
    }
    elem[propName] = prop;
  }
  return elem;
}