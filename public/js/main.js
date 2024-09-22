// @ts-check
/**
 * @typedef {import("../../src/files").Note} Note
 */

import { select, tag } from "./dom-utils.js";
import { TextareaPlus } from "../components/text-editor/text-editor.js";
import { getFormattedDate, matchFormattedDate, prettyPrintDate } from "./dates.js";

const today = getFormattedDate();

const editor = /** @type {TextareaPlus} */ (select("#editor-text"));
const title = /** @type {HTMLElement} */ (select("#editor-title"));
const meta = /** @type {HTMLElement} */ (select("#meta"));


let noteId = '';


/**
 * @param {string} id
 * @return {Promise<Partial<Note> | undefined>}
 */
async function fetchNote(id) {
  try {
    const res = await fetch(`/notes/${id}`);
    if (!res.ok) {
      throw new Error('res not ok')
    }
    return await res.json();
  } catch (e) {

    return;
  }
}

async function hashChange() {
  const id = window.location.hash.slice(1);
  
  if (id === "today") {
    window.location.hash = today;
    return;
  }
  
  if (id) {
    let note = await fetchNote(id);
    if (note === undefined) return;
    if (!note.id) {

      // failed to fetch make a note for today.
      if (id === today) {
        const res = await fetch("/notes", {
          method: "POST",
          body: JSON.stringify({ id: today })
        });
        window.location.reload();
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
  }



}


async function fillSidebar () {
  const res = await fetch('/notes');
  if (!res.ok) return;
  
  const notes = await res.json();
  console.log(notes)

  const daily = select("#daily");
  for (let note of notes.daily) {
    let link = tag("a.note-link", {
      innerText: note.id,
      dataset: { id: note.id },
      href: `#${note.id}`,
    });
    daily?.append(tag("li", { children: [ link ] }))
  }

  const named = select("#named-notes");
  for (let note of notes.named) {
    let link = tag("a.note-link", {
      innerText: note.title,
      dataset: { id: note.id },
      href: `#${note.id}`,
    });
    named?.append(tag("li", { children: [ link ]}))
  }
}


editor.listen(editor.source, 'input', (e) => {
  if (noteId) {
    fetch(`/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify({ content: editor.text }),
    });  
  }
  
  buildMetaView();
});

editor.mapkey("tab", () => editor.indent())
editor.mapkey("shift+tab", () => editor.indent(true))
editor.mapkey("meta+'", (e) => {
  e.preventDefault();
  const contextMenuEvent = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    view: window,
    button: 2, 
  });
  console.log(contextMenuEvent);
  // Dispatch the event
  editor.source.dispatchEvent(contextMenuEvent);
});



select("#editor-title")?.addEventListener('input', (e) => {
  let title = e.srcElement?.innerText ?? '';
  title = title.trim().replaceAll("\n", " ");
  fetch(`/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });

  const sideBarElem = select(`[data-id=${noteId}`);
  if (sideBarElem) {
    sideBarElem.innerText = title;
  }
});


select("#new")?.addEventListener("click", async () => {
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
});



function buildMetaView() {
  const linkArea = meta.querySelector("#meta-links");
  if (linkArea === null) return;
  linkArea.innerHTML = "";
  
  for (let [url, text] of Object.entries(editor.meta.links)) {
    const link = tag("a.link-card", {
      href: url.slice(1, -1),
      target: "_blank",
    });
    const linkDiv = tag("div", {
      innerText: text.slice(1, -1),
    });
    link.append(linkDiv);
    linkArea.append(link);
  }
}


window.addEventListener('hashchange', hashChange);

if (!window.location.hash) {
  window.location.hash = today;
}

await fillSidebar();
hashChange();