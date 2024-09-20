// @ts-check
import { nextNonSpaceChar, fillString } from "./string-tools.js";

/**
 * @typedef {Object} Token
 * @prop {string} type
 * @prop {string} value
 * @prop {number} line
 * @prop {number} column
 * @range {[number, number]} token 
 */

/**
 * @typedef {Object} LeafNode
 * @prop {"text" | "space" | "marker"} type
 * @prop {string} content
 */

/**
 * @typedef {Object} MarkdownNode
 * @prop {string} type
 * @prop {(MarkdownNode | LeafNode)[]} content
 */

/**
 * @typedef {Object} Line
 * @prop {string} content
 * @prop {[number, number]} range
 */

/**
 * @typedef {Object} Block
 * @prop {string} content
 * @prop {[number, number]} range
 */

/**
 * @type {Map<string, string>}
 */
const lineTypes = new Map(Object.entries({
  "#" : "h1",
  "##" : "h2",
  "###" : "h3",
  "####" : "h4",
  "#####" : "h5",
  "######" : "h6",
  "-": "list-item",
  "+": "list-item",
}));


/**
 * @param {string} line
 * @return {[string, string] | null}
 */
function getLineType(line) {
  for (const [pattern, type] of lineTypes) {
    if (line.startsWith(pattern + " ")) {
      return [type, pattern];
    }
  }
  return null;
}


/**
 * @type {Map<string, string>}
 */
const lineSubtypes = new Map(Object.entries({
  "[ ]": "todo",
  "[x]": "todo-done",
  "[.]": "todo-progress",
}));


/**
 * @param {string} line
 * @return {[string, string] | null}
 */
function getLineSubtype(line) {
  for (const [pattern, type] of lineSubtypes) {
    if (line.startsWith(pattern + " ")) {
      return [type, pattern];
    }
  }
  return null;
}


/**
 * create a span
 * @param {string[]} classes list of class names
 * @return {HTMLSpanElement}
 */
function span(...classes) {
  const s = document.createElement("span");
  s.classList.add(...classes);
  return s;
}


/**
 * @param {string} type
 * @param {(MarkdownNode | LeafNode)[] | string} children
 * @return {MarkdownNode | LeafNode}
 */
function wrap(type, children) {
  if (Array.isArray(children)) {
    return /** @type {MarkdownNode} */ ({
      type,
      content: children,
    });  
  } else {
    return /** @type {LeafNode} */ ({
      type,
      content: children,
    });  
  }
}


/**
 * Split the input string into lines with ranges
 * @param {string} input
 * @return {Line[]} a list of lines
 */
function parseText(input) {
  console.log(input.length)
  const lines = [];
  let lineStart = 0;
  while (lineStart < input.length) {
    for (let lineEnd = lineStart; lineEnd < input.length; ++lineEnd) {
      
      if (lineEnd === input.length - 1) {
        lines.push({
          content: input.slice(lineStart),
          range: /** @type {[number, number]} */ ([lineStart, input.length]),
        });
        return lines;
      }

      if (input[lineEnd] === "\n") {
        lines.push({
          content: input.slice(lineStart, lineEnd),
          range: /** @type {[number, number]} */ ([lineStart, lineEnd]),
        });
        lineStart = lineEnd + 1;
        break;
      }
    }
  }
  return lines;
}


/** 
 * @param {string} text
 * @return {(MarkdownNode | LeafNode)[]}
 */
function parseLinks(text) {

  /** @type {(MarkdownNode | LeafNode)[]} */
  const children = [];

  let currentText = "";
  let linkText = "";
  let linkUrl = "";
  
  let state = {
    inLinkText: false,
    inLinkUrl: false,
    spaceOnly: true,
  }

  for (let i = 0; i < text.length; i++) {
    let char = text[i];

    if (char === '[' && !state.inLinkText && !state.inLinkUrl) {
      
      if (currentText) {
        if (state.spaceOnly) {
          children.push(wrap("space", currentText));
        } else {
          children.push(wrap("text", currentText));
        }
        currentText = ""
        state.spaceOnly = true;
      }
      state.inLinkText = true;
      linkText += char;

    } else if (char === "]" && state.inLinkText) {
      
      state.inLinkText = false;
      linkText += char;

      if (text[i + 1] === "(") {
        state.inLinkUrl = true;
        i++;
        linkUrl += "(";
      } else {
        currentText += linkText;
        linkText = "";
      }

    } else if (char === ")" && state.inLinkUrl) {
      
      linkUrl += char;
      state.inLinkUrl = false;
      children.push(wrap("link-text", linkText), wrap("link-url", linkUrl));
      linkText = "";
      linkUrl = "";

    } else if (state.inLinkText) {
      
      linkText += char;

    } else if (state.inLinkUrl) {

      linkUrl += char;

    } else {

      currentText += char;
      if (char !== " ") {
        state.spaceOnly = false;
      }
    }
  }

  if (currentText) {
    children.push(wrap("text", currentText));
  }
  if (linkText) {
    children.push(wrap("text", linkText));
  }
  if (linkUrl) {
    children.push(wrap("text", linkUrl));
  }

  return children;
}


/** 
 * @param {number} amt
 * @return {LeafNode}
 */
function spaceNode(amt) {
  return {
    type: "space",
    content: fillString(amt, " "),
  };
}


/** 
 * @param {Line} line
 * @return {MarkdownNode | LeafNode} [description]
 */
function parseLine(line) {
  if (line.content.length === 0) {
    return wrap("empty", []);
  }
  
  /** @type {(MarkdownNode | LeafNode)[]} */
  const children = [];

  let [ leadingSpace ] = nextNonSpaceChar(line.content, 0);

  if (leadingSpace > 0) {
    children.push(spaceNode(leadingSpace));
  }

  let rest = line.content.slice(leadingSpace);
  const [ type, marker ] = getLineType(rest) || [ null, null ];

  rest = marker ? rest.slice(marker.length + 1) : rest;
  const [ subtype, submarker] = getLineSubtype(rest) || [ null, null ];

  rest = submarker ? rest.slice(submarker.length + 1) : rest;

  /** @type {(MarkdownNode | LeafNode)[]} */
  let body = parseLinks(rest);

  if (subtype) {
    body = [wrap(subtype, [wrap("marker", submarker), spaceNode(1), ...body])];
  }

  if (type) {
    children.push(wrap("marker", marker), spaceNode(1));
  }

  children.push(...body);
  return wrap(type ?? "paragraph", children);
}


/**
 * @param { MarkdownNode | LeafNode } node
 * @return {HTMLSpanElement}
 */
function renderNode(node) {
  if (typeof node.content === "string") {
    const elem = span(node.type);
    elem.innerText = node.content;
    return elem;  
  }
  const elem = span(node.type);
  elem.append(...node.content.map(renderNode));
  return elem;
}
  
/**
 * [highlight description]
 * @param {string} sourceString
 * @return {HTMLSpanElement[]}
 */
export function highlight(sourceString) {

  const lines = parseText(sourceString);
  const nodes = lines.map(parseLine);
  
  let highlighted = [];

  for (let node of nodes) {
    const elem = span("line");

    if (node.type === "empty") {
      elem.innerText = " ";
      highlighted.push(elem);
      continue;
    }

    elem.append(renderNode(node));

    highlighted.push(elem)
  }
  return highlighted;
}

/**
 * @param { MarkdownNode | LeafNode } node
 * @return {[string, (string | any[])]}
 */
function renderNodeOffline(node) {
  if (typeof node.content === "string") {
    return [node.type, node.content];
  }
  return [node.type, node.content.map(renderNodeOffline)];
}

/**
 * @param {string} sourceString
 */
function highlightOffline(sourceString) {
  const lines = parseText(sourceString);
  const nodes = lines.map(parseLine);
  let out = [];
  for (let node of nodes) {
    out.push(renderNodeOffline(node));
  }
  return JSON.stringify(out, null, 2);
}

