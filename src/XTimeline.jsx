import { useEffect, useRef } from 'react'

const widgetUrl = 'https://platform.x.com/widgets.js'

export default function XTimeline({ profileUrl }) {
  const container = useRef(null)

  useEffect(() => {
    const target = container.current
    const loadTimeline = () => window.twttr?.widgets?.load(target)
    if (window.twttr?.widgets) {
      loadTimeline()
      return
    }

    let script = document.querySelector(`script[src="${widgetUrl}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = widgetUrl
      script.async = true
      script.addEventListener('error', () => script.remove(), { once: true })
      document.head.append(script)
    }
    script.addEventListener('load', loadTimeline, { once: true })
    return () => script.removeEventListener('load', loadTimeline)
  }, [])

  return (
    <section className="timeline" aria-labelledby="timeline-title">
      <header className="timeline-header">
        <h2 id="timeline-title">Recent posts</h2>
        <a href={profileUrl}>View on X</a>
      </header>
      <div className="timeline-feed" ref={container}>
        <a className="twitter-timeline" data-theme="dark" data-height="220" data-dnt="true" href={profileUrl}>
          Open @yukibenkyouchuu’s timeline on X
        </a>
      </div>
    </section>
  )
}
