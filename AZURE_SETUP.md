# Azure setup: University of Ottawa sign-in

The site requires signing in with a real `@uottawa.ca` Microsoft account
before showing any content. This works without a backend server — Microsoft's
own login page does the verification, restricted to University of Ottawa's
tenant. To turn it on, you register a free app under **your own** Microsoft
account (this can't be done on your behalf — it needs your own login).

Run `scripts/setup-azure-auth.sh` for an interactive walkthrough, or follow
the same steps manually below.

## 1. Register the app

1. Go to [portal.azure.com](https://portal.azure.com) and sign in (or create
   a free personal Microsoft account).
2. Search for **Microsoft Entra ID** → left sidebar → **App registrations**
   → **+ New registration**.
3. Name it something recognizable, e.g. "Recruiting Prep Hub".
4. Under **Supported account types**, choose:
   > Accounts in any organizational directory (Any Microsoft Entra ID
   > tenant - Multitenant)

   Not single-tenant (you don't administer uOttawa's tenant), and not
   "personal Microsoft accounts only".
5. Under **Redirect URI**, set the platform to **Single-page application
   (SPA)** and enter exactly:
   ```
   http://localhost:8123/login.html
   ```
6. Click **Register**.

## 2. Copy the client ID

On the app's **Overview** page, copy the **Application (client) ID** — a
GUID like `11111111-2222-3333-4444-555555555555`. This is **not a secret**;
it's meant to be visible in client-side code.

Two things worth confirming while you're there (both should already be
correct by default):

- **Authentication** → the SPA redirect URI is listed, and the "Access
  tokens" / "ID tokens" implicit-grant checkboxes are left **unchecked**
  (this site uses the modern auth-code + PKCE flow, not implicit grant).
- **API permissions** → `User.Read` (Microsoft Graph, delegated) is already
  present. Nothing else to add, no admin consent needed.

No client secret is required anywhere — this is a public client (browser
SPA), not a confidential client.

## 3. Put the client ID in the project

Edit `content/auth-config.json`:

```json
{
  "clientId": "paste-your-client-id-here",
  "redirectUri": "http://localhost:8123/login.html"
}
```

## 4. Verify locally

```
python3 -m http.server 8123
```

Open `http://localhost:8123/index.html`, click **Sign in with University of
Ottawa Account**, and confirm you land on a real Microsoft sign-in page
whose URL contains University of Ottawa's tenant ID:

```
d41fdab1-7e15-4cfd-b5fa-7200e54deb6b
```

You don't need an actual `@uottawa.ca` account to verify this — just confirm
the redirect happens and there's no "invalid client" error.

## 5. Before you publish to GitHub Pages

Once you know your GitHub Pages URL (`https://<username>.github.io/<repo>/`),
add a **second** redirect URI in Azure (App registration → Authentication →
Add URI) for:

```
https://<username>.github.io/<repo>/login.html
```

Then update `redirectUri` in `content/auth-config.json` to match the real
URL before pushing.
