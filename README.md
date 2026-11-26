# Yuki Directory

A personal website starter built with React and Vite. Edit the homepage in `src/App.jsx` and its styles in `src/styles.css`.

Add Japanese study notes to the array in `src/notes.json`. Each entry needs a unique `id`, a `title`, a `topic`, and a Markdown `body` string. Use `\n\n` for paragraph breaks. Headings, lists, links, quotes, code blocks, and tables are supported. The list follows the file order.

Set `updatedAt` whenever you edit a note. Use an ISO 8601 timestamp with an offset, such as `2026-11-26T14:30:00+07:00`. The cards and reader display this time in WIB.

Each note has a shareable page at `/notes/<id>/`. Use lowercase letters, numbers, and hyphens for IDs, and keep published IDs stable so existing links keep working. Vite builds separate HTML pages for Home, Notes, Book, and each note.

## Update the homepage

Add study timeline entries in `src/home-content.json` with a `title`, `description`, optional `focus`, and a `date` in `YYYY-MM` or `YYYY-MM-DD` format. Dates display as month and year, newest first.

## Local development

```sh
npm ci
npm run dev
```

Run `npm run build` to produce the static site in `dist/`. Run `npm run preview` to serve that build locally.

## Deploy to Cloudflare Workers

The project is configured for [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/). Vite builds the site into `dist/`, and `wrangler.jsonc` tells Cloudflare to serve that folder as the `yuki-directory` Worker.

### First deployment

1. Sign in to your Cloudflare account and open a terminal in the folder containing `package.json`. The build was verified with Node.js 24.
2. Install the project dependencies.

   ```sh
   npm ci
   ```

3. Authorize Wrangler in the browser, then confirm it sees the intended Cloudflare account.

   ```sh
   npx wrangler login
   npx wrangler whoami
   ```

4. Build and publish the site.

   ```sh
   npm run deploy
   ```

5. Open the HTTPS URL printed by Wrangler. With the default Worker name, it will look like `https://yuki-directory.<your-account-subdomain>.workers.dev`. If Cloudflare asks you to set up your account subdomain, do that under **Workers & Pages** and rerun the deploy command. [Cloudflare's workers.dev setup guide](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/)

Check that Home and Notes open, the profile photo loads, and the pixel art responds to a click or tap.

### Publish updates

After editing the site or adding entries to `src/notes.json`, run `npm run deploy` again from the same folder. It rebuilds the site and updates the existing Worker. Keep the `name` in `wrangler.jsonc` the same to keep deploying to that Worker.

To validate the build and deployment configuration before publishing, run the following commands in order.

```sh
npm run build
npx wrangler deploy --dry-run
```

### Add a custom domain

After the first deployment, you can use a domain or subdomain from an active Cloudflare zone in the same account.

#### Through the dashboard

1. Open **Workers & Pages** and select **yuki-directory**.
2. Go to **Settings → Domains & Routes → Add → Custom Domain**.
3. Enter your hostname, such as `learn.example.com`, without `https://` or a path.
4. Select **Add Custom Domain**. Cloudflare creates the DNS record and provisions the HTTPS certificate. Open your hostname once the certificate is ready.

If your hostname already has a CNAME record, choose another hostname or check what currently uses that record before replacing it. The root domain and `www` are separate hostnames. [Cloudflare's custom domain guide](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

#### Through Wrangler

To manage the domain from this project, add these fields to the top-level object in `wrangler.jsonc`, replacing `learn.example.com` with your hostname.

```jsonc
"workers_dev": true,
"routes": [
  { "pattern": "learn.example.com", "custom_domain": true }
]
```

Keep the existing `assets` and `name` settings. Run `npm run deploy` again and open the custom hostname over HTTPS once Cloudflare has provisioned its certificate. The `workers_dev` setting keeps your original URL available. [Cloudflare's custom domain guide](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
