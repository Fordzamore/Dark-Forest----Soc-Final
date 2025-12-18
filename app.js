// Dark Forest Map — small, opinionated, and slightly paranoid.
// (If anything breaks: blame the algorithm, not me.)

const STORAGE_KEY = "darkForestSpaces_v1";

let currentSpace = null;
let lastAnalysis = { modifier: 0, text: "" };

let totalComfortability = 0;
let totalExclusion = 0;
let totalCookies = 0;

const DEFAULT_SPACES = [
  { id: 1,  name: "TikTok — For You Page",   zone: "plaza",  url: "https://www.tiktok.com", agents: ["ads","recommender","brands"], comfortability: 2, exclusion: 0, cookies: 85, notes: "High-velocity feed; attention extraction as UX." },
  { id: 2,  name: "Instagram — Main Feed",   zone: "plaza",  url: "https://www.instagram.com", agents: ["ads","recommender","friends"], comfortability: 4, exclusion: 1, cookies: 72, notes: "Visible profile + algorithmic ranking." },
  { id: 3,  name: "X / Twitter — Timeline",  zone: "plaza",  url: "https://x.com", agents: ["strangers","recommender","politics"], comfortability: 2, exclusion: 0, cookies: 60, notes: "Public performance + incentivized conflict." },
  { id: 4,  name: "YouTube — Recommendations", zone: "plaza", url: "https://www.youtube.com", agents: ["recommender","creators","ads"], comfortability: 5, exclusion: 0, cookies: 50, notes: "Autoplay is a soft form of governance." },

  { id: 5,  name: "Instagram — Finsta",      zone: "forest", url: "https://www.instagram.com", agents: ["friends"], comfortability: 7, exclusion: 5, cookies: 48, notes: "Smaller audience = more control, but still platform-owned." },
  { id: 6,  name: "Discord — Private Server", zone: "forest", url: "https://discord.com", agents: ["friends","mods"], comfortability: 8, exclusion: 6, cookies: 25, notes: "Gatekept community norms; cozy but fragile." },
  { id: 7,  name: "Group Chat (iMessage/WhatsApp)", zone: "forest", url: "#", agents: ["friends"], comfortability: 9, exclusion: 7, cookies: 0, notes: "Small circles feel safe… until screenshots exist." },
  { id: 8,  name: "Email Newsletter / RSS",  zone: "forest", url: "https://substack.com", agents: ["writer","platform"], comfortability: 6, exclusion: 3, cookies: 20, notes: "Less algorithmic… but still a platform + analytics." },
  { id: 9,  name: "Reddit — Niche Subreddit", zone: "forest", url: "https://www.reddit.com", agents: ["mods","strangers"], comfortability: 6, exclusion: 3, cookies: 30, notes: "Pseudo-anonymity + local rules + collective memory." },

  { id: 10, name: "Signal — Sensitive Chat", zone: "bunker", url: "https://signal.org", agents: ["friends"], comfortability: 10, exclusion: 10, cookies: 0, notes: "End-to-end encrypted; still social trust is the weak point." },
  { id: 11, name: "Local Notes / Obsidian",  zone: "bunker", url: "#", agents: ["self"], comfortability: 10, exclusion: 10, cookies: 0, notes: "Offline-ish = maximum agency." },
  { id: 12, name: "Password Manager",        zone: "bunker", url: "#", agents: ["self"], comfortability: 9, exclusion: 10, cookies: 0, notes: "A tiny private state that governs access." },
  { id: 13, name: "Banking App",             zone: "bunker", url: "#", agents: ["bank","state"], comfortability: 6, exclusion: 9, cookies: 5, notes: "High-stakes data; rigid identity requirements." }
];

const onionNodes = [
  { label: "SecureDrop-style leak site", note: "Privacy as protection… and as risk." },
  { label: "Onion forum / board",        note: "Low visibility, strong local norms." },
  { label: "Mirror site (blocked elsewhere)", note: "Infrastructure as politics." },
  { label: "Encrypted political chat",  note: "Coordination without scrutiny." }
];

let spaces = loadSpaces();

function loadSpaces() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_SPACES];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [...DEFAULT_SPACES];
    return parsed;
  } catch {
    return [...DEFAULT_SPACES];
  }
}

function persistSpaces() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces)); } catch { /* ignore */ }
}

function groupByZone(items) {
  return items.reduce((acc, s) => {
    (acc[s.zone] ||= []).push(s);
    return acc;
  }, { plaza: [], forest: [], bunker: [] });
}

/* ---------- Rendering ---------- */

function renderListView() {
  const container = document.getElementById("listContainer");
  if (!container) return;

  container.innerHTML = "";
  const grouped = groupByZone(spaces);

  const zoneMeta = {
    plaza:  { title: "Public Plaza", desc: "Highly visible, surveilled, algorithmic feeds." },
    forest: { title: "Dark Forest",  desc: "Semi-hidden, gated, chat-based “cozy web” spaces." },
    bunker: { title: "Bunker",       desc: "Encrypted/offline refuges with high exclusion." }
  };

  (["plaza","forest","bunker"]).forEach((zone) => {
    const card = document.createElement("article");
    card.className = "zone-card";

    const header = document.createElement("div");
    header.className = "zone-header";

    const h2 = document.createElement("h2");
    h2.textContent = zoneMeta[zone].title;

    const badge = document.createElement("span");
    badge.className = "zone-label";
    badge.textContent = `${grouped[zone].length} spaces`;

    const desc = document.createElement("p");
    desc.textContent = zoneMeta[zone].desc;

    header.appendChild(h2);
    header.appendChild(badge);

    card.appendChild(header);
    card.appendChild(desc);

    grouped[zone].forEach((space) => {
      const pill = document.createElement("div");
      pill.className = "app-pill";

      const left = document.createElement("div");
      const name = document.createElement("div");
      name.className = "app-name";
      name.textContent = space.name;

      const meta = document.createElement("div");
      meta.className = "app-meta";
      meta.textContent = `comfort ${space.comfortability}/10 • excl ${space.exclusion}/10 • cookies ~${space.cookies}`;

      left.appendChild(name);
      left.appendChild(meta);

      const open = document.createElement("a");
      open.href = "#";
      open.className = "app-open";
      open.textContent = "Enter";
      open.addEventListener("click", (e) => {
        e.preventDefault();
        openWithIntent(space);
      });

      pill.appendChild(left);
      pill.appendChild(open);
      card.appendChild(pill);
    });

    container.appendChild(card);
  });
}

function renderMapView() {
  const plazaCol = document.getElementById("plazaColumn");
  const forestCol = document.getElementById("forestColumn");
  const bunkerCol = document.getElementById("bunkerColumn");
  const onionCol = document.getElementById("onionColumn");

  if (!plazaCol || !forestCol || !bunkerCol) return;

  plazaCol.innerHTML = "";
  forestCol.innerHTML = "";
  bunkerCol.innerHTML = "";

  const grouped = groupByZone(spaces);

  const makeNode = (space) => {
    const node = document.createElement("div");
    node.className = "app-node";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = space.name;
    btn.addEventListener("click", () => openWithIntent(space));

    node.appendChild(btn);
    return node;
  };

  grouped.plaza.forEach((s) => plazaCol.appendChild(makeNode(s)));
  grouped.forest.forEach((s) => forestCol.appendChild(makeNode(s)));
  grouped.bunker.forEach((s) => bunkerCol.appendChild(makeNode(s)));

  if (onionCol) {
    onionCol.innerHTML = "";
    onionNodes.forEach((n) => {
      const node = document.createElement("div");
      node.className = "app-node";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = n.label;
      btn.addEventListener("click", () => openPoliticalLayer());
      node.appendChild(btn);
      onionCol.appendChild(node);
    });
  }
}

/* ---------- Modal logic ---------- */

function openWithIntent(space) {
  const modal = document.getElementById("intentModal");
  if (!modal) return;

  currentSpace = space;
  lastAnalysis = { modifier: 0, text: "" };

  document.getElementById("targetSiteName").textContent = space.name;
  document.getElementById("baseExclusion").value = space.exclusion;
  document.getElementById("baseCookies").textContent = String(space.cookies);

  const purpose = document.getElementById("userPurpose");
  purpose.value = "";

  document.getElementById("aiAnalysisResult").classList.add("hidden");
  modal.showModal();
}

function analyzePurpose(purposeText) {
  const text = (purposeText || "").toLowerCase().trim();

  // Homemdade AI algorithm... CITE HERE IN PAPER
  if (!text) return { text: "You entered without a story. The system loves that.", modifier: -1 };

  const bad = ["doom", "scroll", "rage", "argue", "fight", "hate", "stalk"];
  const good = ["friend", "community", "organize", "learn", "make", "create", "care"];
  const neutral = ["research", "work", "school", "email", "log in", "check"];

  if (bad.some((k) => text.includes(k))) {
    return { text: "Compulsion detected. Your attention is being harvested.", modifier: -2 };
  }
  if (good.some((k) => text.includes(k))) {
    return { text: "Human use-case. The platform tolerates your joy.", modifier: +2 };
  }
  if (neutral.some((k) => text.includes(k))) {
    return { text: "Instrumental purpose. You are behaving like a proper user.", modifier: 0 };
  }
  return { text: "Ambiguous motive. The algorithm is confused by your humanity.", modifier: 0 };
}

function setupModalListeners() {
  const modal = document.getElementById("intentModal");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const proceedBtn = document.getElementById("proceedBtn");

  if (!modal || !analyzeBtn || !cancelBtn || !proceedBtn) return;

  analyzeBtn.addEventListener("click", async () => {
    const purpose = document.getElementById("userPurpose").value;
    const result = analyzePurpose(purpose);

    lastAnalysis = result;

    const resultBox = document.getElementById("aiAnalysisResult");
    const scoreText = document.getElementById("aiScoreText");
    scoreText.textContent = result.text;
    resultBox.classList.remove("hidden");
  });

  proceedBtn.addEventListener("click", () => {
    if (!currentSpace) return;

    totalComfortability += clamp(currentSpace.comfortability + lastAnalysis.modifier, 0, 10);
    totalExclusion += currentSpace.exclusion;
    totalCookies += currentSpace.cookies;

    updateScoreDisplay();

    if (currentSpace.url && currentSpace.url !== "#") window.open(currentSpace.url, "_blank");

    modal.close();
  });

  cancelBtn.addEventListener("click", () => modal.close());
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/* Buttons! */

function setupViewToggle() {
  const listViewBtn = document.getElementById("listViewBtn");
  const mapViewBtn = document.getElementById("mapViewBtn");
  const listView = document.getElementById("listView");
  const mapView = document.getElementById("mapView");

  if (!listViewBtn || !mapViewBtn || !listView || !mapView) return;

  listViewBtn.addEventListener("click", () => {
    listViewBtn.classList.add("active");
    mapViewBtn.classList.remove("active");
    listView.classList.add("active-view");
    mapView.classList.remove("active-view");
  });

  mapViewBtn.addEventListener("click", () => {
    mapViewBtn.classList.add("active");
    listViewBtn.classList.remove("active");
    mapView.classList.add("active-view");
    listView.classList.remove("active-view");
  });
}

function setupOnionBandToggle() {
  const btn = document.getElementById("onionBandToggleBtn");
  const band = document.getElementById("onionBand");
  if (!btn || !band) return;

  btn.addEventListener("click", () => {
    band.classList.toggle("hidden");
    btn.textContent = band.classList.contains("hidden") ? "Reveal Onion Band" : "Hide Onion Band";
  });
}

function setupOnionPageButton() {
  const btn = document.getElementById("onionPageButton");
  if (!btn) return;
  btn.addEventListener("click", () => (window.location.href = "onion.html"));
}

function setupPoliticalLayer() {
  const btn = document.getElementById("onionPoliticalBtn");
  const closeBtn = document.getElementById("closePoliticalModal");
  const modal = document.getElementById("politicalModal");

  if (!btn || !modal || !closeBtn) return;

  btn.addEventListener("click", () => openPoliticalLayer());
  closeBtn.addEventListener("click", () => modal.close());
}

function openPoliticalLayer() {
  const modal = document.getElementById("politicalModal");
  if (!modal) return;
  modal.showModal();
}

function setupSourcesModal() {
  const btn = document.getElementById("sourcesBtn");
  const modal = document.getElementById("sourcesModal");
  const close = document.getElementById("closeSourcesModal");
  if (!btn || !modal || !close) return;

  btn.addEventListener("click", () => modal.showModal());
  close.addEventListener("click", () => modal.close());
}

function setupAddAppModal() {
  const openBtn = document.getElementById("addAppBtn");
  const modal = document.getElementById("addAppModal");
  const cancelBtn = document.getElementById("addAppCancel");
  const form = document.getElementById("addAppForm");

  if (!openBtn || !modal || !form || !cancelBtn) return;

  openBtn.addEventListener("click", () => modal.showModal());
  cancelBtn.addEventListener("click", () => modal.close());

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("newAppName").value.trim();
    const zone = document.getElementById("newAppZone").value;
    const url = (document.getElementById("newAppUrl").value || "#").trim() || "#";
    const comfortability = Number(document.getElementById("newAppComfort").value);
    const exclusion = Number(document.getElementById("newAppExclusion").value);
    const cookies = Number(document.getElementById("newAppCookies").value);
    const notes = document.getElementById("newAppNotes").value.trim();

    const nextId = Math.max(...spaces.map((s) => s.id)) + 1;

    spaces.push({
      id: nextId,
      name,
      zone,
      url,
      agents: ["user-added"],
      comfortability: clamp(comfortability, 1, 10),
      exclusion: clamp(exclusion, 0, 10),
      cookies: clamp(cookies, 0, 250),
      notes: notes || "User-added space."
    });

    persistSpaces();
    renderListView();
    renderMapView();

    form.reset();
    modal.close();
  });
}

function updateScoreDisplay() {
  const c = document.getElementById("totalComfortability");
  const e = document.getElementById("totalExclusion");
  const k = document.getElementById("totalCookies");
  if (!c || !e || !k) return;

  c.textContent = `Total Comfortability: ${totalComfortability}`;
  e.textContent = `Total Exclusion: ${totalExclusion}`;
  k.textContent = `Total Cookies: ${totalCookies}`;
}


document.addEventListener("DOMContentLoaded", () => {
  setupViewToggle();
  setupOnionBandToggle();
  setupOnionPageButton();
  setupModalListeners();
  setupPoliticalLayer();
  setupSourcesModal();
  setupAddAppModal();

  renderListView();
  renderMapView();
});
