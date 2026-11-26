import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const templatePath = new URL('./index.html', import.meta.url)
const notesPath = new URL('./src/notes.json', import.meta.url)

function sitePages() {
  const pages = new Map([
    ['/notes/', { name: 'Notes', title: 'Notes' }],
    ['/book/', { name: 'Book', title: 'Book' }],
  ])
  for (const { id, title } of JSON.parse(readFileSync(notesPath, 'utf8'))) {
    if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      throw new Error(`Invalid note ID: ${id}. Use lowercase letters, numbers, and hyphens.`)
    }
    const path = `/notes/${id}/`
    if (pages.has(path)) throw new Error(`Duplicate note ID: ${id}`)
    pages.set(path, { name: 'Notes', title, noteId: id })
  }
  return pages
}

function pageHtml(template, { name, title, noteId = '' }) {
  const safeTitle = title.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  return template
    .replace('<title>', () => `<title>${safeTitle} | `)
    .replace('data-page="Home"', `data-page="${name}" data-note-id="${noteId}"`)
}

function staticPages() {
  return {
    name: 'yuki-static-pages',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.method !== 'GET' && request.method !== 'HEAD') return next()
        const { pathname, search } = new URL(request.url, 'http://localhost')
        if (!/^\/(?:book\/?$|notes(?:\/|$))/.test(pathname)) return next()

        try {
          const canonical = pathname.endsWith('/') ? pathname : `${pathname}/`
          const page = sitePages().get(canonical)
          if (!page) return next()
          if (pathname !== canonical) {
            response.writeHead(307, { Location: canonical + search })
            return response.end()
          }

          const template = readFileSync(templatePath, 'utf8')
          const html = await server.transformIndexHtml(pathname, pageHtml(template, page))
          response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          response.end(html)
        } catch (error) {
          next(error)
        }
      })
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const template = bundle['index.html'].source.toString()
        for (const [path, page] of sitePages()) {
          this.emitFile({
            type: 'asset',
            fileName: `${path.slice(1)}index.html`,
            source: pageHtml(template, page),
          })
        }
      },
    },
  }
}

export default defineConfig({
  appType: 'mpa',
  plugins: [react(), staticPages()],
})
