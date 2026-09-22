// Microsoft Entra ID (Azure AD) sign-in, restricted to University of Ottawa's
// tenant. Runs entirely client-side via @azure/msal-browser (loaded from a
// CDN in each page) — no backend. Microsoft's own login page verifies the
// account; this file only checks the signed token's tenant/domain before
// revealing page content, and won't let a non-uOttawa account through even
// if someone edits the page's JS, since the token itself is signed by
// Microsoft and the login page only issues tokens for the configured tenant.

const UOTTAWA_TENANT_ID = "d41fdab1-7e15-4cfd-b5fa-7200e54deb6b";
const UOTTAWA_DOMAIN = "uottawa.ca";

let msalInstance = null;

async function loadAuthConfig() {
  const res = await fetch("content/auth-config.json", { cache: "no-store" });
  return res.json();
}

async function getMsalInstance() {
  if (msalInstance) return msalInstance;
  const config = await loadAuthConfig();
  if (!config.clientId || config.clientId.startsWith("REPLACE_")) {
    throw new Error("AUTH_NOT_CONFIGURED");
  }
  msalInstance = new msal.PublicClientApplication({
    auth: {
      clientId: config.clientId,
      authority: `https://login.microsoftonline.com/${UOTTAWA_TENANT_ID}`,
      redirectUri: config.redirectUri || (window.location.origin + "/login.html"),
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
    },
  });
  await msalInstance.initialize();
  return msalInstance;
}

function isUottawaAccount(account) {
  if (!account) return false;
  if (account.tenantId && account.tenantId === UOTTAWA_TENANT_ID) return true;
  const upn = (account.username || "").toLowerCase();
  return upn.endsWith("@" + UOTTAWA_DOMAIN);
}

function getValidAccount(instance) {
  return instance.getAllAccounts().find(isUottawaAccount) || null;
}

function renderAuthSetupNotice() {
  document.body.innerHTML = `
    <div style="max-width:640px;margin:4rem auto;padding:0 1.5rem;font-family:-apple-system,sans-serif;">
      <h1>Sign-in isn't configured yet</h1>
      <p>This site requires a University of Ottawa account to view, but the
      Microsoft Entra app registration hasn't been connected. Edit
      <code>content/auth-config.json</code> and set <code>clientId</code> to your
      registered app's Application (client) ID. See README.md for setup steps.</p>
    </div>
  `;
}

// Call at the very top of every protected page's script, before anything else
// that touches page content. Redirects to login.html if there's no valid
// signed-in uOttawa account, and reveals the page (via the "authed" body
// class, see style.css) once confirmed. Returns the active account.
async function requireAuth() {
  let instance;
  try {
    instance = await getMsalInstance();
  } catch (e) {
    renderAuthSetupNotice();
    return new Promise(() => {});
  }

  try {
    const result = await instance.handleRedirectPromise();
    if (result && result.account) instance.setActiveAccount(result.account);
  } catch (e) {
    console.error("Auth redirect error", e);
  }

  const account = getValidAccount(instance);
  if (!account) {
    const next = encodeURIComponent(location.pathname + location.search);
    location.href = `login.html?next=${next}`;
    return new Promise(() => {});
  }

  instance.setActiveAccount(account);
  document.body.classList.add("authed");
  return account;
}

// Call after renderHeader() on protected pages to fill in the
// "signed in as ..." control in the header.
function renderAuthStatus(account) {
  const el = document.getElementById("auth-status");
  if (!el || !account) return;
  const name = account.name || account.username;
  el.innerHTML = `<span class="auth-user">${name}</span> <a href="#" id="sign-out-link">Sign out</a>`;
  document.getElementById("sign-out-link").addEventListener("click", (e) => {
    e.preventDefault();
    msalInstance.logoutRedirect({ postLogoutRedirectUri: window.location.origin + "/login.html" });
  });
}
