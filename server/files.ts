/**
 * @file Read and write note data from the filesystem.
 */
import { mkdir, writeFile, readdir, unlink, stat } from "fs/promises";
import { join } from "path";
import { getFormattedDate, matchFormattedDate } from "../client/js/dates";


export interface Note {
  id: string,
  title?: string,
  content: string,
  created_at: string,
  updated_at: string,
}

export interface NoteSummary {
  id: string,
  title?: string,
  created_at: string
}

const dailyTemplate = `# todo

# links

`.trim();

const DIRS: Record<string, string> = {
  daily: "",
  named: ""
};

function idToPath(id: string): string {
  if (matchFormattedDate(id)) {
    return join(DIRS.daily, id + ".md");
  }
  return join(DIRS.named, id + ".md");
}

function noteSortUpdate(a: Note, b: Note) {
  return new Date(a.updated_at) < new Date(b.updated_at) ? 1 : -1;
}

function noteSortCreate(a: Note, b: Note,) {
  return new Date(a.created_at) < new Date(b.created_at) ? 1 : -1;
}


export class Files {
  static async init(daily: string, named: string) {
    DIRS.daily = daily;
    DIRS.named = named;
    await Promise.all([
      mkdir(DIRS.daily, { recursive: true }),
      mkdir(DIRS.named, { recursive: true }),
    ]);
    console.log({ DIRS })
  }

  /**
   * @param {Partial<Note>} note [description]
   * @param {boolean} write [description]
   * @return {Promise<Note>} [description]
   */
  static async create(note: Partial<Note>, write = true): Promise<Note> {
    const date = new Date();
    const timestamp = date.toISOString();
    const id = getFormattedDate(timestamp);

    const n: Note = {
      id: id,
      content: note.content ?? "",
      created_at: timestamp,
      updated_at: timestamp,
    };

    if (note.title) {
      n.title = note.title;
      n.id = randomId();
    } else {
      if (note.content === "") {
        n.content = dailyTemplate;
      }
    }

    const file = note.title ? join(DIRS.named, n.id + ".md") : join(DIRS.daily, n.id + ".md");

    if (write) {
      await writeFile(file, noteToString(n));
    }
    return n;
  }

  static async load(path: string): Promise<Note | undefined> {
    const file = Bun.file(path);

    if (!await file.exists()) {
      return undefined;
    }

    const { mtime } = await stat(path);
    const note = stringToNote(await file.text());
    if (new Date(note.updated_at) < new Date(mtime)) {
      note.updated_at = new Date(mtime).toISOString();
    }
    return note;
  }

  static async allInDir(dir: string, update: boolean = true): Promise<NoteSummary[]> {
    const list = (await readdir(dir)).filter(f => !f.startsWith("."));
    const notes = await Promise.all(list.map(f => {
      const id = f.slice(0, f.indexOf("."));
      return Files.load(idToPath(id));
    }));

    return notes
      .filter(note => note !== undefined)
      .sort(update ? noteSortUpdate : noteSortCreate)
      .map(note => ({
        title: note.title,
        id: note.id
      }) as NoteSummary);
  }

  static async allDaily(): Promise<NoteSummary[]> {
    // Default sort by id works for the daily notes with their ids.
    return Files.allInDir(DIRS.daily, false);
  }

  static async allNamed(): Promise<NoteSummary[]> {
    // Sort named notes by update time.
    return Files.allInDir(DIRS.named, true);
  }

  static async getById(id: string): Promise<Note | undefined> {
    if (id.startsWith("n-")) {
      return await Files.load(join(DIRS.named, id + ".md"));
    } else {
      return await Files.load(join(DIRS.daily, id + ".md"));
    }
  }

  static async update(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    const note = await Files.getById(id);
    if (!note) return;

    const updated: Note = {
      ...note,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const path = join((id.startsWith("n-") ? DIRS.named : DIRS.daily), id + ".md");
    await writeFile(path, noteToString(updated));
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const note = await Files.getById(id);
    if (!note) return false;

    const path = join((id.startsWith("n-") ? DIRS.named : DIRS.daily), id + ".md");
    await unlink(path);
    return true;
  }
}


function noteToString(note: Note): string {
  const lines = [`id: ${note.id}`];
  if (note.title) {
    lines.push(`title: ${note.title}`);
  }
  lines.push(`created_at: ${note.created_at}`, `updated_at: ${note.updated_at}`);
  lines.push("---", note.content);
  return lines.join("\n");
}


function stringToNote(str: string): Note {
  const lines = str.split("\n");
  const meta: Record<string, string> = {};
  let contentStart = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("---")) {
      contentStart = i + 1;
      break;
    }
    const [k, v] = lines[i].split(": ");
    meta[k] = v.trim();
  }

  return {
    id: meta.id ?? "unknown",
    title: meta.title ?? "",
    created_at: meta.created_at ?? new Date().toISOString(),
    updated_at: meta.updated_at ?? new Date().toISOString(),
    content: lines.slice(contentStart).join("\n"),
  };
}


function cleanName(name: string): string {
  const out: string[] = [];
  for (let i = 0; i < name.length; ++i) {
    let char = name[i];
    if (char >= 'A' && char <= 'Z') {
      out.push(char.toLowerCase());
    }
    if (char >= 'a' && char <= 'z') {
      out.push(char);
    }
    if (char === ' ' && out[out.length - 1] !== "-" && i !== name.length - 1) {
      out.push('-')
    }
  }
  return out.join('');
}


function randomId(len = 8): string {
  return "n-" + crypto.getRandomValues(new Uint8Array(8)).reduce((p, n) => {
    return p + n.toString(36);
  }, "").slice(-len);
}