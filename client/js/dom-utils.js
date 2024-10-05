// @ ts-check
/**
 * @file Dom utilities.
 */


/**
 * @param {HTMLElement | string} selector A selector or an HTMLElement.
 * @returns {HTMLElement | null}
 */
export function select(selector) {
  if (selector instanceof HTMLElement) {
    return selector;
  }
  
  if (selector[0] === "#") {
    return document.getElementById(selector.slice(1));
  }

  const elem = document.querySelector(selector);
  return elem ?? null;
}


/**
 * @param {HTMLElement | string} selector A selector or an HTMLElement.
 * @returns {HTMLElement[] | null}
 */
export function selectAll(selector) {
  if (selector[0] === "#") {
    return [document.getElementById(selector.slice(1))];
  }

  const elems = document.querySelector(selector);
  if (!elems) {
    return null;
  }
  return elems;
}



/**
 * Proxy for document.createElement with some extra utility for adding ids and 
 * classes.
 * @param {string} tag The tag to make. Examples: 'a', 'div.container',
 *     'p#bio.large-text.red', or 'p #bio .large-text .red'.
 * @param {object} styleObject 
 * @returns {HTMLElement}
 */
export function tag(string, props) {
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
    if (propName === "children") {
      elem.append(...props.children);
      continue;
    }
    const prop = props[propName];
    if (typeof prop === 'object') {
      Object.assign(elem[propName], props[propName]);
      continue;
    }
    elem[propName] = prop;
  }
  return elem;
}