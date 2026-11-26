import homeContent from './home-content.json'

const { journey } = homeContent
const newestFirst = [...journey].sort((first, second) => (second.date ?? '').localeCompare(first.date ?? ''))
const monthAndYear = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export default function Home() {
  return (
    <div className="home-stack">
      <section className="intro" aria-labelledby="intro-title">
        <h1 id="intro-title">Introduction</h1>
        <p>Hi, I’m Yuki. I’m learning Japanese, and this directory is where I keep track of what I study. I use it to collect notes on vocabulary, grammar, and reading so I can revisit what I’ve learned and see how my understanding changes over time.</p>
      </section>

      <section className="home-section" aria-labelledby="journey-title">
        <h2 id="journey-title">Timeline</h2>
        <ol className="journey">
          {newestFirst.map(({ title, description, date, focus }) => (
            <li key={title}>
              <h3>{title}</h3>
              {focus && <p className="journey-focus">{focus}</p>}
              {date && <time dateTime={date}>{monthAndYear.format(new Date(date))}</time>}
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
