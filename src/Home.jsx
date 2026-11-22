import XTimeline from './XTimeline.jsx'
import homeContent from './home-content.json'

const { journey, photos, interests, spotifyUrl } = homeContent
const spotify = /^https:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(track|playlist|album)\/([a-z0-9]+)\/?(?:[?#].*)?$/i.exec(spotifyUrl.trim())
const monthAndYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })

export default function Home({ profileUrl }) {
  return (
    <div className="home-stack">
      <section className="intro" aria-labelledby="intro-title">
        <h1 id="intro-title">Introduction</h1>
        <p>Hi, I’m Yuki. I’m learning Japanese, and this directory is where I keep track of what I study. I use it to collect notes on vocabulary, grammar, and reading so I can revisit what I’ve learned and see how my understanding changes over time.</p>
      </section>

      <section className="home-section" aria-labelledby="journey-title">
        <h2 id="journey-title">Timeline</h2>
        {journey.some(({ sample }) => sample) && <p className="journey-meta">Sample milestones and dates</p>}
        <ol className="journey">
          {journey.map(({ title, description, date, focus }) => (
            <li key={title}>
              <h3>{title}</h3>
              {focus && <p className="journey-focus">{focus}</p>}
              {date && <time dateTime={date}>{monthAndYear.format(new Date(date))}</time>}
              <p>{description}</p>
            </li>
          ))}
        </ol>
        <h3 id="gallery-title">Photo gallery</h3>
        {photos.length ? (
          <ul className="photo-strip" tabIndex={0} aria-labelledby="gallery-title">
            {photos.map(({ src, alt, caption }) => (
              <li key={src}>
                <figure>
                  <img src={src} alt={alt} loading="lazy" />
                  {caption && <figcaption>{caption}</figcaption>}
                </figure>
              </li>
            ))}
          </ul>
        ) : <p className="home-empty">No photos yet.</p>}
      </section>

      <section className="home-section" aria-labelledby="interest-title">
        <h2 id="interest-title">Interests</h2>
        <div className="interests">
          {Object.entries(interests).map(([category, items]) => (
            <div key={category}>
              <h3>{category}</h3>
              {items.length > 0 && <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>}
            </div>
          ))}
        </div>
      </section>

      <section className="home-section" aria-labelledby="spotify-title">
        <h2 id="spotify-title">Spotify</h2>
        {spotify ? (
          <iframe
            className="spotify-player"
            title="Spotify player"
            src={`https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}`}
            height={spotify[1] === 'track' ? 152 : 352}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : <p className="home-empty">No music added yet.</p>}
      </section>

      <XTimeline profileUrl={profileUrl} />
    </div>
  )
}
