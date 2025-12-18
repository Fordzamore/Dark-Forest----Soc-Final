// Onion Layer page — representation only.
// No .onion addresses. No instructions. Just a map of *types* of spaces.

const onionSpaces = [
    {
      id: 1,
      name: "Whistleblower Drop Site",
      type: "Secure drop",
      agents: ["journalists", "whistleblowers", "state"],
      notes: "Offers protection for leaks, but could also a be a center for surveillance and retaliation."
    },
    {
      id: 2,
      name: "Encrypted Political Group Chat",
      type: "Coordination",
      agents: ["activists", "influencers", "elites"],
      notes: "protects organizers can also enable elite backchannels with zero accountability."
    },
    {
      id: 3,
      name: "Onion Forum / Board",
      type: "Counterpublic",
      agents: ["mods", "pseudonymous users"],
      notes: "Low visibility. Unchecked and anonymous. This layer has a cult-ish community, where it can get intense/degenerate when it’s hard to find"
    },
    {
      id: 4,
      name: "Mirror Site for Blocked Content",
      type: "Access workaround",
      agents: ["publishers", "censors", "readers"],
      notes: "Sometimes the onion layer is just “the same web” under different constraints. This allows maybe journalists to express ideas they want shared, or obtain WWW (world wide web) restricted content"
    },
    {
      id: 5,
      name: "Mutual Aid / Safety Network",
      type: "Care infrastructure",
      agents: ["community", "trusted contacts"],
      notes: "Cozy-web logic taken seriously: smaller scale, higher trust, less extraction."
    },
    {
      id: 6,
      name: "Marketplace",
      type: "Exchange",
      agents: ["buyers", "sellers", "law enforcement"],
      notes: "how nonymity changes incentives, enforcement, and risk."
    }
  ];
  
  function renderOnion() {
    const root = document.getElementById("onionRoot");
    if (!root) return;
  
    root.innerHTML = "";
  
    const card = document.createElement("article");
    card.className = "zone-card";
  
    const header = document.createElement("div");
    header.className = "zone-header";
  
    const h2 = document.createElement("h2");
    h2.textContent = "Onion Layer Spaces (conceptual)";
  
    const badge = document.createElement("span");
    badge.className = "zone-label";
    badge.textContent = `${onionSpaces.length} nodes`;
  
    header.appendChild(h2);
    header.appendChild(badge);
  
    const desc = document.createElement("p");
    desc.textContent = "...the onion layer as infrastructure";
  
    card.appendChild(header);
    card.appendChild(desc);
  
    onionSpaces.forEach((s) => {
      const row = document.createElement("div");
      row.className = "app-pill";
  
      const left = document.createElement("div");
  
      const name = document.createElement("div");
      name.className = "app-name";
      name.textContent = s.name;
  
      const meta = document.createElement("div");
      meta.className = "app-meta";
      meta.textContent = `${s.type} • agents: ${s.agents.join(", ")}`;
  
      const notes = document.createElement("div");
      notes.className = "app-meta";
      notes.textContent = s.notes;
  
      left.appendChild(name);
      left.appendChild(meta);
      left.appendChild(notes);
  
      row.appendChild(left);
      card.appendChild(row);
    });
  
    root.appendChild(card);
  }
  
  function setupPoliticalSection() {
    const openBtn = document.getElementById("onionPoliticalBtn");
    const section = document.getElementById("onionPoliticalSection");
    const closeBtn = document.getElementById("closeOnionPolitical");
    if (!openBtn || !section || !closeBtn) return;
  
    openBtn.addEventListener("click", () => section.classList.toggle("hidden"));
    closeBtn.addEventListener("click", () => section.classList.add("hidden"));
  }
  
  function setupSourcesModal() {
    const openBtn = document.getElementById("sourcesBtn");
    const modal = document.getElementById("sourcesModal");
    const closeBtn = document.getElementById("closeSourcesModal");
    if (!openBtn || !modal || !closeBtn) return;
  
    openBtn.addEventListener("click", () => modal.showModal());
    closeBtn.addEventListener("click", () => modal.close());
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    renderOnion();
    setupPoliticalSection();
    setupSourcesModal();
  });
  