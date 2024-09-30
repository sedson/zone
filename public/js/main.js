// @ts-check
/**
 * @typedef {import("../../src/files").Note} Note
 */
import { select, tag } from "./dom-utils.js";
import { TextareaPlus } from "../components/text-editor/text-editor.js";
import { getFormattedDate, matchFormattedDate, prettyPrintDate } from "./dates.js";
import * as notesApi from "./notes-api.js";

const today = getFormattedDate();

const editor = /** @type {TextareaPlus} */ (select("#editor-text"));
const title = /** @type {HTMLElement} */ (select("#editor-title"));
const meta = /** @type {HTMLElement} */ (select("#meta"));
const search = /** @type {HTMLElement} */ (select("#search"));



let noteId = '';

let searchMap = new Map();

/**
 * @type {Record<string, string>}
 */
let globalNotes = {};

/**
 * @param {string} str
 */
function getSearchable(str) {
  return str.split(/\-\s/)
    .filter(x => x.length > 0)
    .map(x => x.toLowerCase())
    .join(" ");
}


async function hashChange() {
  const id = window.location.hash.slice(1);
  
  if (id === "today") {
    window.location.hash = today;
    return;
  }
  
  if (id) {
    let note = await notesApi.get(id);
    if (note === undefined) return;
    if (!note.id) {

      // failed to fetch make a note for today.
      if (id === today) {
        const created = await notesApi.create({ id: today });
        if (created) {
          window.location.reload();  
        }
        return;
      }

      editor.text = `note ${id} not found : (`;
      title.contentEditable = "false";
      title.innerText = "error";
      noteId = "";
      return;
    }

    editor.text = note.content ?? '';
    title.innerText = note.title || prettyPrintDate(note.id);
    if (note.id === today) {
      title.append(tag('span.tag.today', { innerText: 'today' }));
    }
    noteId = id;

    if (matchFormattedDate(noteId)) {
      title.contentEditable = "false";
    } else {
      title.contentEditable = "true";
    }

    const root = document.querySelector(':root');

    document.querySelectorAll(".note-link")?.forEach(e => {
      e.classList.remove('selected');
    });

    select(`.note-link[data-id="${noteId}"`)?.classList.add('selected');

    buildMetaView();

    search.classList.add("hidden");
    const searchInput = select("search-input");
    if (searchInput && searchInput.value) {
      searchInput.value = "";
    }
  }
}


async function fillSidebar () {
  const daily = select("#daily");
  
  for (let note of await notesApi.daily()) {
    let link = tag("a.note-link", {
      innerText: note.id,
      dataset: { id: note.id },
      href: `#${note.id}`,
    });
    daily?.append(tag("li", { children: [ link ] }))
  }

  const named = select("#named-notes");
  
  for (let note of await notesApi.named()) {
    let link = tag("a.note-link", {
      innerText: note.title || "[]",
      dataset: { id: note.id },
      href: `#${note.id}`,
    });
    named?.append(tag("li", { 
      children: [ link ],
      tabIndex: 0,
      role: "link"
    }))

    if (note.id !== undefined && note.title !== undefined) {
      searchMap.set(note.id, getSearchable(note.title ?? ""));
      globalNotes[note.id] = note.title;  
    }
  }
}


editor.listen(editor.source, 'input', (e) => {
  if (noteId) {
    notesApi.update(noteId, { content: editor.text });
  }
  buildMetaView();
});

editor.mapkey("tab", (e) => {
  if (e.target !== editor) return;
  editor.indent()
});
editor.mapkey("shift+tab", (e) => {
  if (e.target !== editor) return;
  editor.indent(true);
});



select("#editor-title")?.addEventListener('input', (e) => {
  let title = e.target?.innerText ?? '';
  title = title.trim().replaceAll("\n", " ");
  
  notesApi.update(noteId, { title });

  const sideBarElem = select(`[data-id=${noteId}`);
  if (sideBarElem) {
    sideBarElem.innerText = title;
  }
  searchMap.set(noteId, getSearchable(title));
  globalNotes[noteId] = title;
  buildSearchResults("");
});


async function newNote() {
  console.log('new')
  
  const res = await fetch("/notes", {
    method: "POST",
    body: JSON.stringify({ title: 'New Note' })
  });

  if (!res.ok) return;
  const note = await res.json();

  select("#links")?.append(tag("a.note-link", {
    innerText: note.title,
    dataset: { id: note.id },
    href: `#${note.id}`,
  }));
  window.location.hash = note.id;
}


select("#new")?.addEventListener("click", newNote);



function buildMetaView() {
  const linkArea = meta.querySelector("#meta-links");
  if (linkArea === null) return;
  linkArea.innerHTML = "";
  
  
  for (let [url, text] of Object.entries(editor.meta.links)) {
    const href = url.slice(1, -1);
    const external = (href.startsWith("http://") || href.startsWith("https://") || href.indexOf(".") > -1);
    const link = tag("a.link-card", {
      href: href,
      target: external ? "_blank" : "",
    });
    const linkDiv = tag("div", {
      innerText: text.slice(1, -1),
    });
    link.append(linkDiv);
    linkArea.append(link);
  }
}


/**
 * @param {string} str
 */
function buildSearchResults(str) {
  const results = select("#results");
  if (results === null) return;

  results.innerHTML = "";

  const query = str.toLowerCase();
  for (let [id, safeTitle] of searchMap) {
    if (safeTitle.indexOf(query) > -1) {
      results.append(tag("li.search-result", {
        role: "option",
        children: [tag("a", {
          innerText: globalNotes[id],
          href: `#${id}`,
        })],
      }));
    }
  }
}

select("#search-input")?.addEventListener("input", e => {
  buildSearchResults(e.target.value);
});

window.addEventListener("keydown", async (e) => {
  if (e.key === "Escape") {
    search.classList.add("hidden");
    return;
  }

  if (e.key === "1" && e.metaKey) {
    window.location.href = "/";
    e.preventDefault();
    return;
  }
  if (e.key === "2" && e.metaKey) {
    window.location.href = "/editor";
    e.preventDefault();
    return;
  }
  if (e.key === "m" && e.metaKey) {
    e.preventDefault();
    await newNote();
  }
  if ((e.key === "/" || e.key === "p") && e.metaKey) {
    search.classList.toggle("hidden");
    if (!search.classList.contains("hidden")) {
      select("#search-input")?.focus();
    }
    e.preventDefault();
    return;
  }
});

select("#search-button")?.addEventListener("click", () => {
  search.classList.toggle("hidden");
  if (!search.classList.contains("hidden")) {
    select("#search-input")?.focus();
  }
});

window.addEventListener('hashchange', hashChange);

if (!window.location.hash) {
  window.location.hash = today;
}

await fillSidebar();
hashChange();
buildSearchResults("");
