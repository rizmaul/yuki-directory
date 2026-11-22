import { useState } from 'react'
import PixelScene from './PixelScene.jsx'
import Home from './Home.jsx'
import Notes from './Notes.jsx'
import profilePicture from './profile.png'

const profileUrl = 'https://x.com/yukibenkyouchuu'

const pages = ['Home', 'Notes', 'Book']

export default function App() {
  const [page, setPage] = useState('Home')

  return (
    <div className="site">
      <aside className="sidebar" aria-labelledby="profile-name">
        <header className="profile">
          <h2 id="profile-name">yuki's directory</h2>
          <div className="profile-row">
            <img className="profile-picture" src={profilePicture} alt="Black-and-white illustrated avatar" width="400" height="400" />
            <div className="profile-details">
              <div className="profile-account">
                <p className="handle">@yukibenkyouchuu</p>
                <a className="profile-link" href={profileUrl} aria-label="Yuki on X">X</a>
              </div>
              <p>Hi, I’m Yuki. This is where I keep my projects and notes.</p>
            </div>
          </div>
        </header>
        <div className="sidebar-art">
          <PixelScene />
        </div>
      </aside>

      <div className="content">
        <nav className="topbar" aria-label="Main navigation">
          {pages.map((name) => (
            <button
              key={name}
              onClick={() => setPage(name)}
              aria-current={page === name ? 'page' : undefined}
            >
              {name}
            </button>
          ))}
        </nav>
        <main className={page === 'Notes' ? 'notes-main' : 'home'}>
          {page === 'Home' && <Home profileUrl={profileUrl} />}
          {page === 'Notes' && <Notes />}
          {page === 'Book' && (
            <section className="intro" aria-labelledby="book-title">
              <h1 id="book-title">Book</h1>
              <p>Meeting booking is in progress.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

