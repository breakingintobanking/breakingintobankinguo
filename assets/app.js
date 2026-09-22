// Shared helpers for the static site. No build step, no frameworks —
// every page loads this file directly with a plain <script> tag.

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function loadConfig() {
  return loadJSON("content/config.json");
}

function renderHeader(activePage, config) {
  const el = document.getElementById("site-header");
  if (!el) return;
  const link = (href, label, key) =>
    `<a href="${href}" class="${activePage === key ? "active" : ""}">${label}</a>`;
  el.innerHTML = `
    <div class="inner">
      <a class="brand" href="index.html">${config.siteTitle}</a>
      <nav>
        ${link("index.html", "Home", "home")}
        ${link("videos.html", "Videos", "videos")}
        ${link("documents.html", "Documents", "documents")}
      </nav>
      <div class="auth-status" id="auth-status"></div>
    </div>
  `;
}

function renderFooter(config) {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.innerHTML = `
    <p>${config.siteTitle} &middot; Questions? <a href="mailto:${config.contactEmail}">${config.contactEmail}</a></p>
  `;
}

function renderTopicFilters(container, topics, onSelect) {
  let active = "All";
  const draw = () => {
    container.innerHTML = "";
    ["All", ...topics].forEach((topic) => {
      const btn = document.createElement("button");
      btn.textContent = topic;
      btn.className = topic === active ? "active" : "";
      btn.addEventListener("click", () => {
        active = topic;
        draw();
        onSelect(topic);
      });
      container.appendChild(btn);
    });
  };
  draw();
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
