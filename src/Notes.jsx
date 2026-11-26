import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import notes from './notes.json'

const noteDate = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta',
})
const markdownPlugins = [remarkGfm]

function UpdatedTime({ timestamp }) {
  const date = new Date(timestamp)
  if (!timestamp || Number.isNaN(date.getTime())) return null

  return <time className="note-updated" dateTime={timestamp}>Updated {noteDate.format(date)} WIB</time>
}

export default function Notes({ noteId }) {
  const [query, setQuery] = useState('')
  const terms = query.normalize('NFKC').trim().toLowerCase().split(/\s+/)
  const matches = notes.filter(({ title, topic, body }) => {
    const text = [title, topic, body].join(' ').normalize('NFKC').toLowerCase()
    return terms.every((term) => text.includes(term))
  })
  const activeNote = noteId ? notes.find((note) => note.id === noteId) : matches[0]

  return (
    <div className="notes-layout" data-view={noteId ? 'note' : 'list'}>
      <section className="notes-index" aria-labelledby="notes-title">
        <div className="notes-search">
          <h1 id="notes-title">Notes</h1>
          <label htmlFor="note-query">Search notes</label>
          <input
            id="note-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {matches.length > 0 ? (
          <ul className="note-list">
            {matches.map((note) => (
              <li key={note.id}>
                <a
                  aria-current={note.id === noteId ? 'page' : undefined}
                  className={!noteId && note.id === activeNote?.id ? 'note-preview-active' : undefined}
                  href={`/notes/${note.id}/`}
                >
                  <strong>{note.title}</strong>
                  <span>{note.topic}</span>
                  <UpdatedTime timestamp={note.updatedAt} />
                </a>
              </li>
            ))}
          </ul>
        ) : <p className="notes-empty" role="status">{notes.length ? 'No matching notes.' : 'No notes yet.'}</p>}
      </section>
      <section className="note-reader" aria-label="Note preview" aria-live="polite">
        {noteId && <a className="note-back" href="/notes/">Back to notes</a>}
        {activeNote ? (
          <article>
            <h2>{activeNote.title}</h2>
            <UpdatedTime timestamp={activeNote.updatedAt} />
            <p className="note-topic">{activeNote.topic}</p>
            <div className="note-body">
              <Markdown remarkPlugins={markdownPlugins} skipHtml>{activeNote.body}</Markdown>
            </div>
          </article>
        ) : <p>{notes.length ? 'Try a different search.' : 'Published notes will appear here.'}</p>}
      </section>
    </div>
  )
}
