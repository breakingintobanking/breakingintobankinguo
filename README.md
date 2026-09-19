# Recruiting Prep Hub

A plain HTML/CSS/JS site (no build step, no framework, no npm) for hosting
workshop videos and downloadable documents for finance/consulting recruiting
prep. Built to run on GitHub Pages for free.

## How it's structured

```
index.html          landing page
videos.html         lists videos from content/videos.json (YouTube embeds)
documents.html      lists documents from content/documents.json (download links)
admin.html          form-based editor for the two JSON files (see below)
assets/style.css    shared styles
assets/app.js       shared JS helpers (fetch/render/filter)
content/config.json site title, tagline, contact email, topic list
content/videos.json video entries
content/documents.json  document entries
documents/          the actual files that documents.json points to
```

**Videos are never stored in this repo.** Upload each recording to YouTube
(unlisted works fine — it just won't show up in YouTube search, but the
link/embed works normally) and reference the video ID in `videos.json`.
GitHub blocks files over 100MB and Pages isn't meant for video hosting.

**Documents** (PDFs, templates, etc.) can live directly in `documents/` —
keep individual files well under 100MB (ideally under ~25MB). If something
is already hosted elsewhere (Google Drive, a publisher), just point `file`
at that external URL instead.

## Adding content

Open `admin.html` in the browser. It loads the current JSON, gives you a
form to add/edit/delete video and document entries, and produces an updated
JSON file for you to download and commit.

**Important: `admin.html` is not authentication.** GitHub Pages has no
server, so there's no way to password-protect a static page from a browser
alone. Anyone with the URL can open `/admin.html` and edit the form — but it
writes nothing on its own. Nothing on the live site changes until you
download the JSON and push it yourself. Don't put anything in this page you
wouldn't want a curious visitor to poke at (they can't break anything, but
they can look).

If you later want real in-browser publishing with login-gated editing,
that means moving off plain GitHub Pages to something like Decap CMS with a
GitHub OAuth proxy — a bigger step, not needed to get started.

## Previewing locally

Opening `index.html` directly by double-clicking it won't work — browsers
block `fetch()` on `file://` URLs, so the JSON won't load. Instead, from
this folder run:

```
python3 -m http.server 8000
```

then open `http://localhost:8000` in your browser.

## Publishing to GitHub Pages

1. Create a new GitHub repo (public, so Pages can serve it for free).
2. From this folder:
   ```
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. On GitHub: repo Settings → Pages → Source → deploy from branch `main`,
   folder `/ (root)`.
4. The site will be live at `https://<username>.github.io/<repo-name>/`
   within a minute or two.

All links in this site use **relative paths** on purpose, so it works
whether it's served at the root of a domain or under a `/reponame/` path —
you don't need to change anything for this.

## Before you go live: one flag

The sample content mentions things like an "IB 400" interview-question
bank. If that refers to a specific commercial/copyrighted question set,
don't upload the actual file to `documents/` for public download — that's
a real copyright/takedown risk, especially on a site associated with a
university. Linking to where students can get it themselves, or building
your own original question bank, avoids that entirely.

## Customizing

- Site name, tagline, contact email, and the topic filter list all live in
  `content/config.json` — edit that one file rather than hunting through
  each page.
- Colors/fonts are CSS custom properties at the top of `assets/style.css`
  (`--navy`, `--gold`, etc.).
