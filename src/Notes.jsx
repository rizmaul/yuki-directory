import { useState } from 'react'
import notes from './notes.json'

export default function Notes() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const terms = query.normalize('NFKC').trim().toLowerCase().split(/\s+/)
  const matches = notes.filter(({ title, topic, body }) => {
    const text = [title, topic, body].join(' ').normalize('NFKC').toLowerCase()
    return terms.every((term) => text.includes(term))
  })
  const activeNote = matches.find((note) => note.id === selectedId) ?? matches[0]

  return (
    <div className="notes-layout">
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
                <button
                  aria-current={note.id === activeNote?.id ? 'true' : undefined}
                  onClick={() => setSelectedId(note.id)}
                >
                  <strong>{note.title}</strong>
                  <span>{note.topic}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="notes-empty" role="status">{notes.length ? 'No matching notes.' : 'No notes yet.'}</p>}
      </section>
      <section className="note-reader" aria-label="Note preview" aria-live="polite">
        {activeNote ? (
          <article>
            <h2>{activeNote.title}</h2>
            <p className="note-topic">{activeNote.topic}</p>
            <p className="note-body">{activeNote.body}</p>
          </article>
        ) : <p>{notes.length ? 'Try a different search.' : 'Published notes will appear here.'}</p>}
      </section>
    </div>
  )
}
