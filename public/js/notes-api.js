// @ts-check
/**
 * @typedef {import("../../src/files").Note} Note
 * @typedef {import("../../src/files").NoteSummary} NoteSummary
 */


/**
 * Get a note by id.
 * @param {string} id
 * @return {Promise<Note | undefined>}
 */
export async function get(id) {
  const res = await fetch(`/notes/${id}`);
  if (!res.ok) {
    return;
  }
  return await res.json();
}


/**
 * Get all notes.
 * @return {Promise<NoteSummary[]>}
 */
export async function all() {
  const res = await fetch(`/notes`);
  if (!res.ok) return [];
  return await res.json();
}


/**
 * Get all daily notes.
 * @return {Promise<NoteSummary[]>}
 */
export async function daily() {
  const res = await fetch(`/notes/daily`);
  if (!res.ok) return [];
  return await res.json();
}


/**
 * Get all daily notes.
 * @return {Promise<NoteSummary[]>}
 */
export async function named() {
  const res = await fetch(`/notes/named`);
  if (!res.ok) return [];
  return await res.json();
}


/**
 * Create a note.
 * @param {Partial<Note>} payload
 * @return {Promise<boolean>} true if successfully created
 */
export async function create(payload) {
  const res = await fetch(`/notes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.ok;
}


/**
 * Update a note.
 * @param {string} id
 * @param {Partial<Note>} payload
 * @return {Promise<boolean>} true if successfully created
 */
export async function update(id, payload) {
  const res = await fetch(`/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.ok;
}


/**
 * Update a note.
 * @param {string} id
 * @return {Promise<boolean>} true if successfully deleted
 */
export async function del(id) {
  const res = await fetch(`/notes/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}
