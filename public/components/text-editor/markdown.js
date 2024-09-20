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
 * @param {(MarkdownNode | LeafNode)[]} children
 * @return {MarkdownNode}
 */
function wrap(type, children) {
  return {
    type,
    content: children,
  };
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
function parseInline(text) {
  return [{
    type: 'text',
    content: text,
  }];
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
    return { type: "empty", content: [] };
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
  let body = parseInline(rest);

  if (subtype) {
    body = [{
      type: subtype,
      content: [{
        type: "marker", 
        content: submarker,
      }, spaceNode(1), ...body],
    }];
  }

  if (type) {
    children.push({
      type: "marker",
      content: marker,
    }, spaceNode(1));
  }
  
  children.push(...body);

  return {
    type: type ?? "paragraph",
    content: children,
  };
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

const testString1 = "# this is an h1!";
const testString2 = "this is an paragraph!";
const testString3 = "- this is an list-item!";
const testString4 = "- [ ] this is an list-item with a todo";
const testString5 = "[ ] this is an list-item with a todo";




console.log(highlightOffline(testString5));
