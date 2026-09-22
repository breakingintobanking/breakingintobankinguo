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
login.html          University of Ottawa sign-in page (see Authentication)
assets/style.css    shared styles
assets/app.js       shared JS helpers (fetch/render/filter)
assets/auth.js      Microsoft sign-in logic, restricted to uOttawa's tenant
content/config.json site title, tagline, contact email, topic list
content/auth-config.json  your Azure app's client ID (see Authentication)
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

**`admin.html` itself still isn't "authorization" in the write-access sense** —
it writes nothing on its own. Nothing on the live site changes until you
download the JSON and push it yourself. But it's no longer open to anyone:
the sign-in gate (see below) now covers `admin.html` along with every other
page, so only people with a valid uOttawa account can even open it.

If you later want real in-browser *publishing* (skip the download/commit
step entirely), that means moving off plain GitHub Pages to something like
Decap CMS with a GitHub OAuth proxy — a bigger step, not needed right now.

## Authentication (University of Ottawa sign-in)

Every page requires signing in with a real `@uottawa.ca` Microsoft account.
This works without any backend server: Microsoft's own login page verifies
the account, restricted to the university's specific tenant
(`d41fdab1-7e15-4cfd-b5fa-7200e54deb6b` — this is public information,
not a secret), and the site just checks the signed token it gets back
before showing anything. A non-uOttawa account can't get a token from that
login page in the first place — it's not a client-side check someone could
bypass by editing the page.

**To turn this on, you need to register a free app in Microsoft Entra ID
(Azure AD) yourself** — this requires your own Microsoft account and can't
be done by anyone else on your behalf. Run `./scripts/setup-azure-auth.sh`
for an interactive walkthrough, or follow the same steps manually in
`AZURE_SETUP.md`. Once you have your app's **Application (client) ID**, it
goes in `content/auth-config.json` (the script does this for you):

```json
{
  "clientId": "your-actual-client-id-here",
  "redirectUri": "http://localhost:8123/login.html"
}
```

Until you do this, every page shows a plain "sign-in isn't configured yet"
message instead of an error — nothing is broken, it's just waiting on that
one value.

**`redirectUri` must exactly match a redirect URI registered on your Azure
app**, and must be updated once you publish to GitHub Pages (e.g.
`https://<username>.github.io/<repo-name>/login.html`) — register both the
localhost one and the real one in Azure so both work.

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
