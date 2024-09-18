// @ts-check
/**
 * @typedef {import("../../src/files").Note} Note
 */

import { select, tag } from "./dom-utils.js";
import { getFormattedDate, matchFormattedDate, prettyPrintDate } from "./dates.js";

const today = getFormattedDate();

const editor = /** @type {HTMLTextAreaElement} */ (select("#editor-text"));
const title = /** @type {HTMLElement} */ (select("#editor-title"));

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

    editor.value = note.content ?? '';
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
    root?.style?.setProperty('--active', id)

    document.querySelectorAll(".note-link")?.forEach(e => {
      e.classList.remove('selected');
    });

    select(`.note-link[data-id="${noteId}"`)?.classList.add('selected');
  }


}


async function fillSidebar () {
  const res = await fetch('/notes');
  if (!res.ok) return;
  
  const notes = await res.json();

  const sidebar = select("#links");
  sidebar?.append(tag('h2', {
    innerText: 'daily'
  }));

  for (let note of notes.daily) {
    sidebar?.append(tag("a.note-link", {
      innerText: note.id,
      dataset: { id: note.id },
      href: `#${note.id}`,
    }));
  }

  sidebar?.append(tag('h2', {
    innerText: 'notes'
  }));

  for (let note of notes.named) {
    sidebar?.append(tag("a.note-link", {
      innerText: note.title,
      dataset: { id: note.id },
      href: `#${note.id}`,
    }));
  }
}


select("#editor-text")?.addEventListener('input', (e) => {
  fetch(`/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify({ content: e.target.value }),
  });
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



window.addEventListener('hashchange', hashChange);

if (!window.location.hash) {
  window.location.hash = today;
}

await fillSidebar();
hashChange();