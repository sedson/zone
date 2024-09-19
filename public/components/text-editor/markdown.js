// @ts-check
/**
 * @typedef {Object} Token
 * @prop {string} type
 * @prop {string} value
 * @prop {number} line
 * @prop {number} column
 * @range {[number, number]} token 
 */



/**
 * @param {string} data
 * @return {Record<string, Function>}
 */
function createReader(data) {
  let ndx = 0;
  return {
    peek: () => data[ndx],
    next: () => data[ndx++],
    done: () => ndx >= data.length,
    prev: () => data[Math.max(ndx - 1, 0)],
    grab: ([start, end]) =>  data.slice(start, end),
    ndx: () => ndx,
  }
}


export function parse(input) {
  const reader = createReader(input);

  /** @type {Token[]} */
  const tokens = [];

  let line = 0;
  let col = 0;

  let tokenStart = 0;

  while(!reader.done()) {
    tokenStart = reader.ndx();
    const char = reader.next();
  }
}

/**
 * [highlight description]
 * @param {string} sourceString
 * @param {Set<string>} dictionary
 * @return {HTMLElement[]}
 */
export function highlight(sourceString, dictionary) {
  const lines = sourceString.split("\n");
  
  
  let highlighted = [];
  for (let line of lines) {
    const elem = document.createElement('span');
    elem.classList.add('line');
    elem.innerText = line || " ";
    if (line.startsWith("#")) {
      elem.classList.add('h')
    }
    highlighted.push(elem)
  }
  return highlighted;
  // const outputLines = [];
  // let lineNumber = 0;
  // let currentLine = span("", "line");

  // // Add front padding to the first line.
  // currentLine.append(space(tokens[0].range[0]));

  // for (let i = 0; i < tokens.length; i++) {
  //   const token = tokens[i];

  //   if (token.type === SlopToken.enum.EOF) continue;

  //   // Make a new line.
  //   if (token.line !== lineNumber) {
  //     outputLines.push(currentLine);

  //     while (lineNumber < token.line - 1) {
  //       outputLines.push(span("", "line"));
  //       lineNumber += 1;
  //     }
  //     lineNumber += 1;

  //     currentLine = span("", "line");

  //     // Search backwards for a line break.
  //     const prevLineBreak = sourceString.lastIndexOf("\n", token.range[0]);

  //     // Fill new line with leading space.
  //     currentLine.append(space(token.range[0] - prevLineBreak - 1));
  //   }

  //   // Make a syntax highlighted span for the token.
  //   const className = SlopToken.getString(token.type).toLowerCase();
  //   const tokenSpan = span(sourceString.substring(...token.range), className);

  //   if (token.depth > -1) {
  //     tokenSpan.classList.add(`depth-${token.depth % 5}`);
  //   }

  //   if (keywords.has(token.str)) {
  //     tokenSpan.classList.add("keyword");
  //   }

  //   if (token.subpath && token.subpath.length) {
  //     tokenSpan.classList.add("dynamic");
  //   }

  //   currentLine.append(tokenSpan);

  //   if (tokens[i + 1].type === "eof") continue;

  //   const spaceToNext = tokens[i + 1].range[0] - token.range[1];
  //   currentLine.append(space(spaceToNext));
  // }

  // outputLines.push(currentLine);

  // while (outputLines.length < stringTools.countLinebreaks(sourceString)) {
  //   outputLines.push(span("", "line"));
  // }
  // return outputLines;
}
