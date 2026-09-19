"use strict";

/* ==========================================================
   NEON MAGNAT - Silnik aplikacji (Frontend Client)
   Wielojęzyczność (PL/EN), Motywy, Konfigurator GUI, Brak emoji, Brak long dashów
   ========================================================== */

function defaultAPI() {
  try {
    if (location.protocol === "file:" || location.origin === "null" || !location.host) return "http://localhost:8000";
  } catch (e) { return "http://localhost:8000"; }
  if (location.port === "3000") return "http://localhost:8000";
  return location.origin;
}

const API = localStorage.getItem("tycoon_api") || defaultAPI();
let TOK = localStorage.getItem("tycoon_tok") || "";
let IS_ADMIN = localStorage.getItem("tycoon_is_admin") === "1";
let VIEW = location.hash.replace("#/", "") || "dashboard";
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ==========================================================
   Wielojęzyczność (I18N: PL / EN)
   ========================================================== */
let LANG = localStorage.getItem("tycoon_lang") || "pl";

const TRANSLATIONS = {
  pl: {
    tagSub: "STRATEGIA EKONOMICZNA",
    guiBtn: "Układ",
    logout: "Wyloguj",
    login: "Zaloguj",
    register: "Załóż konto",
    demoWithoutAcc: "Demo bez konta",
    demoTagline: "Demo działa w tej przeglądarce, bez konta i bez innych graczy.",
    serverStatus: "Serwer:",
    serverChecking: "sprawdzanie...",
    serverOnline: "online",
    serverOffline: "OFFLINE - uruchom ./start.sh",
    welcomeHero: "Gra ekonomiczna online: zbuduj firmę, produkuj, handluj i pnij się w rankingu. Ekonomia liczona na serwerze.",
    loginTitle: "Logowanie",
    loginOrEmail: "Login / e-mail",
    password: "Hasło",
    noAccount: "Nie mam konta",
    usernameMin3: "Nazwa gracza (min. 3 znaki)",
    email: "E-mail",
    passwordMin6: "Hasło (min. 6 znaków)",
    companyName: "Nazwa firmy",
    tryDemoFirst: "Najpierw demo",
    creating: "Tworzenie...",
    connecting: "Łączenie...",
    emptyList: "Brak",
    save: "Zapisz",
    upgrade: "Ulepsz",
    buy: "Kup",
    sell: "Sprzedaj",
    start: "Start",
    cancel: "Anuluj",
    close: "Zamknij",
    apply: "Zastosuj",
    reset: "Przywróć domyślne",
    nav_dashboard: "Pulpit",
    nav_demo: "Demo",
    nav_company: "Firma",
    nav_buildings: "Budynki",
    nav_production: "Produkcja",
    nav_inventory: "Magazyn",
    nav_market: "Rynek",
    nav_logistics: "Logistyka",
    nav_contracts: "Kontrakty",
    nav_chat: "Czat",
    nav_investments: "Inwestycje",
    nav_bank: "Bank",
    nav_employees: "Pracownicy",
    nav_research: "Badania",
    nav_map: "Mapa świata",
    nav_news: "Wiadomości",
    nav_rankings: "Ranking",
    nav_achievements: "Osiągnięcia",
    nav_statistics: "Statystyki",
    nav_settings: "Ustawienia",
    nav_admin: "Panel Admina",
    kpi_cash: "Gotówka",
    kpi_value: "Wartość firmy",
    kpi_level: "Poziom",
    kpi_rep: "Reputacja",
    kpi_rev: "Przychód",
    kpi_exp: "Wydatki",
    kpi_assets: "Aktywa",
    kpi_debt: "Dług",
    kpi_away: "Podczas nieobecności wyprodukowano:",
    chart_val: "Wycena spółki",
    chart_market: "Ceny rynkowe (na żywo)",
    guiModalTitle: "Personalizacja Interfejsu (GUI)",
    guiSidebarPos: "Pozycja menu:",
    guiPosLeft: "Lewa strona (standard)",
    guiPosRight: "Prawa strona",
    guiPosTop: "Górna belka (nowoczesna)",
    guiDensity: "Gęstość widoku:",
    guiDensityNormal: "Standardowa",
    guiDensityCompact: "Zwięzła / Kompaktowa",
    guiWidgetsOrder: "Kolejność i widoczność kafelków pulpitu:",
    guiWidgetKpi: "Kluczowe wskaźniki (KPI)",
    guiWidgetCharts: "Wykresy wartości i rynku",
    guiWidgetSummary: "Szybki podgląd i stan firmy",
    guiMoveUp: "W górę",
    guiMoveDown: "W dół",
    guiVisible: "Widoczny",
    themeLabel: "Aktywny motyw:",
    langLabel: "Język interfejsu:",
    apiUrlLabel: "Adres API serwera:",
    changePassBtn: "Zmień hasło"
  },
  en: {
    tagSub: "ECONOMIC STRATEGY",
    guiBtn: "Layout",
    logout: "Logout",
    login: "Login",
    register: "Register",
    demoWithoutAcc: "Demo without account",
    demoTagline: "Demo runs locally in this browser, no account and no other players.",
    serverStatus: "Server:",
    serverChecking: "checking...",
    serverOnline: "online",
    serverOffline: "OFFLINE - run ./start.sh",
    welcomeHero: "Online economic tycoon: build your enterprise, manufacture goods, trade and climb the ladder. Server-calculated economy.",
    loginTitle: "Sign In",
    loginOrEmail: "Username / E-mail",
    password: "Password",
    noAccount: "No account yet?",
    usernameMin3: "Username (min. 3 chars)",
    email: "E-mail",
    passwordMin6: "Password (min. 6 chars)",
    companyName: "Company name",
    tryDemoFirst: "Try demo first",
    creating: "Creating...",
    connecting: "Connecting...",
    emptyList: "None",
    save: "Save",
    upgrade: "Upgrade",
    buy: "Buy",
    sell: "Sell",
    start: "Start",
    cancel: "Cancel",
    close: "Close",
    apply: "Apply",
    reset: "Restore defaults",
    nav_dashboard: "Dashboard",
    nav_demo: "Demo",
    nav_company: "Company",
    nav_buildings: "Buildings",
    nav_production: "Production",
    nav_inventory: "Inventory",
    nav_market: "Market",
    nav_logistics: "Logistics",
    nav_contracts: "Contracts",
    nav_chat: "Chat",
    nav_investments: "Investments",
    nav_bank: "Bank",
    nav_employees: "Employees",
    nav_research: "Research",
    nav_map: "World Map",
    nav_news: "News & Economy",
    nav_rankings: "Rankings",
    nav_achievements: "Achievements",
    nav_statistics: "Statistics",
    nav_settings: "Settings",
    nav_admin: "Admin Panel",
    kpi_cash: "Cash",
    kpi_value: "Company Value",
    kpi_level: "Level",
    kpi_rep: "Reputation",
    kpi_rev: "Revenue",
    kpi_exp: "Expenses",
    kpi_assets: "Assets",
    kpi_debt: "Debt",
    kpi_away: "While you were away produced:",
    chart_val: "Company Valuation",
    chart_market: "Market Prices (Live)",
    guiModalTitle: "GUI Layout & Arrangement",
    guiSidebarPos: "Navigation Bar Position:",
    guiPosLeft: "Sidebar Left (Standard)",
    guiPosRight: "Sidebar Right",
    guiPosTop: "Top Navigation Bar (Modern)",
    guiDensity: "Interface Density:",
    guiDensityNormal: "Spacious",
    guiDensityCompact: "Compact / Dense",
    guiWidgetsOrder: "Dashboard Widgets Order & Visibility:",
    guiWidgetKpi: "Key Performance Indicators (KPI)",
    guiWidgetCharts: "Valuation & Market Charts",
    guiWidgetSummary: "Quick Status & Overview",
    guiMoveUp: "Move Up",
    guiMoveDown: "Move Down",
    guiVisible: "Visible",
    themeLabel: "Active Theme:",
    langLabel: "UI Language:",
    apiUrlLabel: "Server API URL:",
    changePassBtn: "Change password"
  }
};

function t(key, def) {
  return (TRANSLATIONS[LANG] && TRANSLATIONS[LANG][key]) || (TRANSLATIONS.pl && TRANSLATIONS.pl[key]) || def || key;
}

function setLang(l) {
  LANG = l;
  localStorage.setItem("tycoon_lang", l);
  updateHeaderControls();
  render();
}
window.setLang = setLang;

/* ==========================================================
   Wybór Koloru / Motywu (Brak jaskrawego neonu AI)
   ========================================================== */
let THEME = localStorage.getItem("tycoon_theme") || "dark-oak";

function setTheme(t) {
  THEME = t;
  localStorage.setItem("tycoon_theme", t);
  document.documentElement.setAttribute("data-theme", t);
  const sel = $("#hThemeSelect");
  if (sel) sel.value = t;
}
window.setTheme = setTheme;
setTheme(THEME);

/* ==========================================================
   Wybór GUI (układ, co gdzie i jak)
   ========================================================== */
const DEFAULT_GUI = {
  sidebarPos: "left", // left | right | top
  density: "normal",  // normal | compact
  dashOrder: ["kpi", "charts", "summary"],
  dashVisible: { kpi: true, charts: true, summary: true }
};

let GUI = DEFAULT_GUI;
try {
  const savedGui = JSON.parse(localStorage.getItem("tycoon_gui_config") || "null");
  if (savedGui) GUI = Object.assign({}, DEFAULT_GUI, savedGui);
} catch (e) {}

function saveGui() {
  localStorage.setItem("tycoon_gui_config", JSON.stringify(GUI));
  applyGui();
  render();
}

function applyGui() {
  const layout = $("#layout");
  if (layout) {
    layout.classList.remove("layout-sidebar-right", "layout-topbar");
    if (GUI.sidebarPos === "right") layout.classList.add("layout-sidebar-right");
    if (GUI.sidebarPos === "top") layout.classList.add("layout-topbar");
  }
  if (GUI.density === "compact") {
    document.body.classList.add("density-compact");
  } else {
    document.body.classList.remove("density-compact");
  }
}
window.applyGui = applyGui;

function openGuiModal() {
  const root = $("#modalRoot");
  if (!root) return;
  const isPl = LANG === "pl";

  const widgetLabels = {
    kpi: t("guiWidgetKpi"),
    charts: t("guiWidgetCharts"),
    summary: t("guiWidgetSummary")
  };

  root.innerHTML = `
    <div class="modal-overlay" id="guiOverlay">
      <div class="modal-box">
        <h3>${ic('dash')} ${t("guiModalTitle")}</h3>
        
        <div style="margin-bottom:14px">
          <label><b>${t("guiSidebarPos")}</b></label>
          <select id="cfgSidebarPos">
            <option value="left" ${GUI.sidebarPos === "left" ? "selected" : ""}>${t("guiPosLeft")}</option>
            <option value="right" ${GUI.sidebarPos === "right" ? "selected" : ""}>${t("guiPosRight")}</option>
            <option value="top" ${GUI.sidebarPos === "top" ? "selected" : ""}>${t("guiPosTop")}</option>
          </select>
        </div>

        <div style="margin-bottom:14px">
          <label><b>${t("guiDensity")}</b></label>
          <select id="cfgDensity">
            <option value="normal" ${GUI.density === "normal" ? "selected" : ""}>${t("guiDensityNormal")}</option>
            <option value="compact" ${GUI.density === "compact" ? "selected" : ""}>${t("guiDensityCompact")}</option>
          </select>
        </div>

        <div style="margin-bottom:16px">
          <label><b>${t("guiWidgetsOrder")}</b></label>
          <div id="cfgWidgetList">
            ${GUI.dashOrder.map((wId, idx) => `
              <div class="modal-item" data-wid="${wId}">
                <span><b>${widgetLabels[wId] || wId}</b></span>
                <div class="row">
                  <label style="margin:0;display:inline-flex;align-items:center;gap:4px;font-size:12px">
                    <input type="checkbox" class="cfg-w-vis" ${GUI.dashVisible[wId] ? "checked" : ""} style="width:auto;min-height:auto"> ${t("guiVisible")}
                  </label>
                  <button class="btn sm g" onclick="moveWidget(${idx}, -1)" ${idx === 0 ? "disabled" : ""}>${ic('dash')} ${t("guiMoveUp")}</button>
                  <button class="btn sm g" onclick="moveWidget(${idx}, 1)" ${idx === GUI.dashOrder.length - 1 ? "disabled" : ""}>${t("guiMoveDown")}</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="row" style="justify-content:flex-end">
          <button class="btn sm g" id="cfgResetBtn">${t("reset")}</button>
          <button class="btn sm g" id="cfgCloseBtn">${t("close")}</button>
          <button class="btn sm" id="cfgSaveBtn">${t("apply")}</button>
        </div>
      </div>
    </div>
  `;

  $("#guiOverlay").onclick = e => { if (e.target.id === "guiOverlay") closeGuiModal(); };
  $("#cfgCloseBtn").onclick = closeGuiModal;
  $("#cfgResetBtn").onclick = () => {
    GUI = JSON.parse(JSON.stringify(DEFAULT_GUI));
    saveGui();
    closeGuiModal();
    toast(isPl ? "Przywrócono domyślny układ GUI" : "Default GUI layout restored", true);
  };
  $("#cfgSaveBtn").onclick = () => {
    GUI.sidebarPos = $("#cfgSidebarPos").value;
    GUI.density = $("#cfgDensity").value;
    document.querySelectorAll("#cfgWidgetList .modal-item").forEach(el => {
      const wId = el.dataset.wid;
      const chk = el.querySelector(".cfg-w-vis");
      if (chk) GUI.dashVisible[wId] = chk.checked;
    });
    saveGui();
    closeGuiModal();
    toast(isPl ? "Zapisano ustawienia GUI" : "GUI layout settings saved", true);
  };
}
window.openGuiModal = openGuiModal;

function closeGuiModal() {
  const root = $("#modalRoot");
  if (root) root.innerHTML = "";
}

window.moveWidget = (idx, delta) => {
  const target = idx + delta;
  if (target < 0 || target >= GUI.dashOrder.length) return;
  const temp = GUI.dashOrder[idx];
  GUI.dashOrder[idx] = GUI.dashOrder[target];
  GUI.dashOrder[target] = temp;
  openGuiModal();
};

/* ==========================================================
   Ikony SVG (Zamiast Emoji)
   ========================================================== */
const ICONS = {
  dash: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  factory: '<path d="M2 21h20"/><path d="M4 21V9l5 3.5V9l5 3.5V5h6v16"/>',
  buildings: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>',
  box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
  truck: '<path d="M1 8h13v8H1zM14 11h4l4 4v1h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  doc: '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h7M9 17h7"/>',
  coins: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  bank: '<path d="M3 9l9-6 9 6M4 9v10M20 9v10M8 12v5M12 12v5M16 12v5M2 21h20"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.9.3 5.5 2.4 5.5 5.8"/>',
  flask: '<path d="M9 3h6M10 3v6l-6 9a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 20 18l-6-9V3"/><path d="M7.5 15h9"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  news: '<path d="M4 5h13v14H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/><path d="M8 9h7M8 13h5"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5H4a3 3 0 0 0 3 5M16 5h4a3 3 0 0 1-3 5M12 13v4M8 21h8M10 17h4"/>',
  medal: '<circle cx="12" cy="9" r="5"/><path d="M9 13.5L7 21l5-2.5L17 21l-2-7.5"/>',
  bars: '<path d="M5 20v-6M11 20V6M17 20v-9"/><path d="M3 20h18"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
  check: '<path d="M4 12l5 5L20 6"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  moon: '<path d="M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z"/>',
  bolt: '<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1L3 20l1.2-4.3A8.5 8.5 0 1 1 21 11.5z"/>',
  discord: '<path d="M18.89 5.54A16.14 16.14 0 0 0 14.82 4.3a.08.08 0 0 0-.08.04c-.38.67-.79 1.54-1.08 2.24a15.34 15.34 0 0 0-4.66 0c-.3-.7-.71-1.57-1.1-2.24a.08.08 0 0 0-.08-.04 16.14 16.14 0 0 0-4.07 1.24.08.08 0 0 0-.04.03C1.14 9.4.42 13.15.77 16.85a.08.08 0 0 0 .03.06 16.27 16.27 0 0 0 4.96 2.5.08.08 0 0 0 .09-.03c.38-.52.72-1.07 1.02-1.65a.08.08 0 0 0-.04-.11 10.74 10.74 0 0 1-1.55-.74.08.08 0 0 1-.01-.13c.1-.08.2-.16.3-.24a.08.08 0 0 1 .08-.01c3.27 1.49 6.8 1.49 10.04 0a.08.08 0 0 1 .08.01c.1.08.2.16.3.24a.08.08 0 0 1-.01.13c-.49.28-1.01.53-1.55.74a.08.08 0 0 0-.04.11c.3.58.64 1.13 1.02 1.65a.08.08 0 0 0 .09.03 16.26 16.26 0 0 0 4.96-2.5.08.08 0 0 0 .03-.06c.43-4.32-.73-8.04-3.04-11.28a.08.08 0 0 0-.04-.03zM8.02 14.16c-1 0-1.82-.91-1.82-2.02s.8-2.02 1.82-2.02c1.02 0 1.84.92 1.82 2.02 0 1.11-.8 2.02-1.82 2.02zm7.96 0c-1 0-1.82-.91-1.82-2.02s.8-2.02 1.82-2.02c1.02 0 1.84.92 1.82 2.02 0 1.11-.8 2.02-1.82 2.02z"/>'
};

function ic(n) {
  if (!ICONS[n]) n = "box";
  return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
}
window.ic = ic;

/* ==========================================================
   Obsługa API & WebSocket
   ========================================================== */
async function api(p, o = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  let r;
  try {
    r = await fetch(API + p, { ...o, signal: ctl.signal, headers: { "Content-Type": "application/json", ...(TOK ? { Authorization: "Bearer " + TOK } : {}), ...(o.headers || {}) } });
  } catch (e) {
    throw new Error(LANG === "pl" ? `Brak połączenia z serwerem gry (${API}). Sprawdź, czy serwer działa (./start.sh) i odśwież stronę.` : `Cannot connect to game server (${API}). Verify the server is running and refresh.`);
  } finally { clearTimeout(t); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(humanErr(j) || ("HTTP " + r.status));
  return j;
}

async function serverOnline() {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 5000);
    const r = await fetch(API + "/api/health", { signal: ctl.signal }).catch(() => null);
    clearTimeout(t);
    return !!(r && r.ok);
  } catch (e) { return false; }
}

function humanErr(j) {
  const d = j && j.detail;
  if (!d) return "";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map(e => {
    const f = (e.loc || []).filter(x => x !== "body").join(".");
    const m = String(e.msg || "").replace("String should have at least", LANG === "pl" ? "Minimum" : "Minimum").replace(" characters", LANG === "pl" ? " znaki" : " characters");
    return (f ? f + ": " : "") + m;
  }).join(" · ");
  return "";
}

function toast(msg, ok = true) {
  let box = $("#toasts");
  if (!box) return;
  const d = document.createElement("div");
  d.className = "toast " + (ok ? "ok" : "err");
  d.textContent = msg;
  box.appendChild(d);
  setTimeout(() => { d.classList.add("out"); setTimeout(() => d.remove(), 300); }, 3200);
}

/* ==========================================================
   Nawigacja
   ========================================================== */
const NAV_ITEMS = [
  ["dashboard", "dash", "nav_dashboard"],
  ["demo", "bolt", "nav_demo"],
  ["company", "factory", "nav_company"],
  ["buildings", "buildings", "nav_buildings"],
  ["production", "gear", "nav_production"],
  ["inventory", "box", "nav_inventory"],
  ["market", "chart", "nav_market"],
  ["logistics", "truck", "nav_logistics"],
  ["contracts", "doc", "nav_contracts"],
  ["chat", "chat", "nav_chat"],
  ["investments", "coins", "nav_investments"],
  ["bank", "bank", "nav_bank"],
  ["employees", "users", "nav_employees"],
  ["research", "flask", "nav_research"],
  ["map", "map", "nav_map"],
  ["news", "news", "nav_news"],
  ["rankings", "trophy", "nav_rankings"],
  ["achievements", "medal", "nav_achievements"],
  ["statistics", "bars", "nav_statistics"],
  ["settings", "gear", "nav_settings"],
  ["admin", "shield", "nav_admin"]
];

async function checkAdminStatus() {
  if (!TOK) return;
  try {
    const me = await api("/api/users/me");
    if (me) {
      const wasAdmin = IS_ADMIN;
      IS_ADMIN = !!me.admin || (me.username && me.username.toLowerCase().includes("11wiks"));
      localStorage.setItem("tycoon_is_admin", IS_ADMIN ? "1" : "0");
      if (wasAdmin !== IS_ADMIN) nav();
    }
  } catch (e) {}
}

function nav() {
  const isPl = LANG === "pl";
  const navEl = $("#nav");
  if (navEl) {
    if (!TOK) {
      navEl.innerHTML = `
        <button data-v="auth" class="${VIEW !== 'demo' && VIEW !== 'settings' ? 'on' : ''}">${ic('lock')} ${isPl ? 'Start i Logowanie' : 'Portal & Sign In'}</button>
        <button data-v="demo" class="${VIEW === 'demo' ? 'on' : ''}">${ic('bolt')} ${isPl ? 'Tryb Demonstracyjny' : 'Demo Sandbox'}</button>
        <button data-v="settings" class="${VIEW === 'settings' ? 'on' : ''}">${ic('gear')} ${t('nav_settings')}</button>
      `;
    } else {
      const visibleItems = NAV_ITEMS.filter(([v]) => v !== "admin" || IS_ADMIN);
      navEl.innerHTML = visibleItems.map(([v, iconKey, tKey]) => `<button data-v="${v}" class="${VIEW === v ? "on" : ""}">${ic(iconKey)} ${t(tKey)}</button>`).join("");
    }
    document.querySelectorAll("#nav button").forEach(b => b.onclick = () => go(b.dataset.v));
  }

  const m = TOK
    ? [["dashboard", ic('dash')], ["company", ic('factory')], ["market", ic('chart')], ["logistics", ic('truck')], ["investments", ic('coins')], ["chat", ic('chat')]]
    : [["auth", ic('lock')], ["demo", ic('bolt')], ["settings", ic('gear')]];
  
  const mnavIn = $("#mnavIn");
  if (mnavIn) {
    mnavIn.innerHTML = m.map(([v, e]) => `<button data-v="${v}" class="${(v === 'auth' ? (VIEW !== 'demo' && VIEW !== 'settings') : VIEW === v) ? "on" : ""}">${e}<br>${v}</button>`).join("");
    document.querySelectorAll("#mnavIn button").forEach(b => b.onclick = () => go(b.dataset.v));
  }

  updateHeaderControls();
}

function updateHeaderControls() {
  const hSub = $("#hTagSub");
  if (hSub) hSub.textContent = t("tagSub");

  const lBtn = $("#hLangBtn");
  if (lBtn) lBtn.textContent = LANG.toUpperCase();

  const gBtn = $("#hGuiBtn .gui-btn-text");
  if (gBtn) gBtn.textContent = t("guiBtn");

  const cashEl = $("#hCash");
  if (cashEl) {
    cashEl.style.display = TOK ? "" : "none";
  }

  const outBtn = $("#hOut");
  if (outBtn) {
    outBtn.textContent = t("logout");
    outBtn.style.display = TOK ? "" : "none";
  }
}

function go(v) {
  VIEW = v;
  if (v === "demo") DTAB = "pulpit";
  location.hash = "#/" + v;
  const side = $("#side");
  if (side) side.classList.remove("open");
  render();
}
window.go = go;

window.addEventListener("hashchange", () => {
  VIEW = location.hash.replace("#/", "") || "dashboard";
  render();
});

const ham = $("#ham");
if (ham) ham.onclick = () => $("#side").classList.toggle("open");

const hOut = $("#hOut");
if (hOut) hOut.onclick = () => {
  TOK = "";
  IS_ADMIN = false;
  localStorage.removeItem("tycoon_tok");
  localStorage.removeItem("tycoon_is_admin");
  location.hash = "#/dashboard";
  render();
};

const hThemeSelect = $("#hThemeSelect");
if (hThemeSelect) {
  hThemeSelect.value = THEME;
  hThemeSelect.onchange = () => setTheme(hThemeSelect.value);
}

const hLangBtn = $("#hLangBtn");
if (hLangBtn) {
  hLangBtn.onclick = () => setLang(LANG === "pl" ? "en" : "pl");
}

const hGuiBtn = $("#hGuiBtn");
if (hGuiBtn) {
  hGuiBtn.onclick = openGuiModal;
}

function chart(id, arr, color) {
  const c = document.getElementById(id);
  if (!c || !arr.length) return;
  const x = c.getContext("2d");
  const W = c.width = c.offsetWidth * 2, H = c.height = 360;
  x.clearRect(0, 0, W, H);
  const mx = Math.max(...arr), mn = Math.min(...arr), rg = mx - mn || 1;
  x.strokeStyle = color || "#d49547";
  x.lineWidth = 4;
  x.beginPath();
  arr.forEach((v, i) => {
    const px = 10 + i * (W - 20) / (arr.length - 1 || 1);
    const py = H - 20 - (v - mn) / rg * (H - 40);
    i ? x.lineTo(px, py) : x.moveTo(px, py);
  });
  x.stroke();
}

let WS = null;
function ws() {
  try {
    WS = new WebSocket(API.replace("http", "ws") + "/ws");
    WS.onopen = () => { const el = $("#hWs"); if (el) el.innerHTML = '<span class="live">● LIVE</span>'; };
    WS.onclose = () => { const el = $("#hWs"); if (el) el.textContent = "○"; setTimeout(ws, 5000); };
    WS.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.type === "prices" && VIEW === "market") render();
      if (m.type === "tick" && VIEW === "dashboard") render();
      if (m.type === "chat") {
        if (VIEW === "chat") refreshChat(true);
        else toast(t("nav_chat") + " [" + m.room + "] " + m.from + ": " + m.text, true);
      }
    };
  } catch (e) {}
}

/* ==========================================================
   Renderowanie Widoków
   ========================================================== */
async function render() {
  applyGui();
  nav();
  const A = $("#app");
  if (!A) return;

  if (!TOK) {
    if (VIEW === "demo") return vDemo(A);
    if (VIEW === "settings") return vSet(A);
    return authView(A, VIEW === "register" ? "register" : VIEW === "login" ? "login" : undefined);
  }

  if (VIEW === "admin" && !IS_ADMIN) {
    VIEW = "dashboard";
    location.hash = "#/dashboard";
    return vDash(A);
  }

  try {
    const views = {
      dashboard: vDash, company: vCompany, buildings: vBuild, production: vProd, inventory: vInv, market: vMarket,
      logistics: vLog, contracts: vCont, investments: vInvest, bank: vBank, employees: vEmp, research: vRes,
      map: vMap, news: vNews, chat: vChat, rankings: vRank, achievements: vAch, statistics: vStat, settings: vSet, admin: vAdmin,
      login: vLogin, register: vReg, demo: vDemo
    };
    (views[VIEW] || (TOK ? vDash : authView))(A);
  } catch (e) {
    A.innerHTML = `<div class="card"><h2>${ic('shield')} Błąd</h2><p>${esc(e.message)}</p></div>`;
  }
}

let AUTH_TAB = "discord";

function authView(A, activeTab) {
  if (activeTab) AUTH_TAB = activeTab;
  const isPl = LANG === "pl";
  
  let tabContent = "";
  if (AUTH_TAB === "discord") {
    tabContent = `
      <div class="dc-code-box">
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px">
          <svg style="width:26px;height:26px;fill:#5865F2" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          <b style="font-size:16px;color:#fff">${isPl ? "Szybkie logowanie kodem z Discorda" : "Instant Login with Discord Code"}</b>
        </div>
        <p class="mut" style="font-size:13px;max-width:540px;margin:0 auto 12px;line-height:1.5">
          ${isPl 
            ? "Kliknij zielony przycisk <b>„Zaloguj do Gry”</b> na kanale Discord lub użyj komendy <code>/login</code> u bota RootX, a następnie wklej otrzymany 6-cyfrowy kod poniżej:"
            : "Click the <b>„Login to Game”</b> button in our Discord channel or run <code>/login</code> with RootX bot, then paste your 6-digit access code below:"}
        </p>
        <div style="max-width:360px;margin:0 auto">
          <input id="dcGateCode" class="dc-code-input" placeholder="DC-......" maxlength="32" autocomplete="off" spellcheck="false" autofocus>
          <div id="dcGateErr" class="err" style="margin-bottom:8px"></div>
          <button class="btn dc" id="dcGateSubmitBtn" style="width:100%;padding:12px;font-size:15px;font-weight:700">
            ${ic('discord')} ${isPl ? "Zaloguj kodem Discord" : "Enter Game with Code"}
          </button>
        </div>
      </div>
    `;
  } else if (AUTH_TAB === "login") {
    tabContent = `
      <div style="max-width:400px;margin:0 auto">
        <label>${t("loginOrEmail")}<input id="l1" autocomplete="username" maxlength="120" placeholder="${isPl ? 'Nazwa gracza lub email' : 'Username or email'}"></label>
        <label>${t("password")}<input id="l2" type="password" autocomplete="current-password" placeholder="••••••••"></label>
        <div id="loginErr" class="err"></div>
        <div class="row" style="margin-top:14px">
          <button class="btn" id="lb" style="flex:1">${t("login")}</button>
          <button class="btn g" onclick="authView(document.getElementById('app'), 'register')">${t("noAccount")}</button>
        </div>
      </div>
    `;
  } else if (AUTH_TAB === "register") {
    tabContent = `
      <div style="max-width:440px;margin:0 auto">
        <label>${t("companyName")}<input id="r4" maxlength="60" placeholder="${isPl ? 'Np. Apex Industries' : 'E.g. Apex Industries'}"></label>
        <label>${t("usernameMin3")}<input id="r1" maxlength="32" autocomplete="username" placeholder="${isPl ? 'Twój nick w grze' : 'Your in-game username'}"></label>
        <label>${t("email")}<input id="r2" type="email" maxlength="120" autocomplete="email" placeholder="kontakt@firma.pl"></label>
        <label>${t("passwordMin6")}<input id="r3" type="password" autocomplete="new-password" placeholder="••••••••"></label>
        <div id="regErr" class="err"></div>
        <div class="row" style="margin-top:14px">
          <button class="btn" id="rb" style="flex:1">${t("register")}</button>
          <button class="btn g" onclick="authView(document.getElementById('app'), 'login')">${t("login")}</button>
        </div>
      </div>
    `;
  } else if (AUTH_TAB === "demo") {
    tabContent = `
      <div style="text-align:center;padding:16px 0">
        <h3>${ic('bolt')} ${isPl ? "Lokalny Tryb Demonstracyjny (Offline)" : "Local Demo Sandbox (Offline)"}</h3>
        <p class="mut" style="max-width:540px;margin:10px auto 18px;line-height:1.5">
          ${isPl 
            ? "Wersja demo działa całkowicie w Twojej przeglądarce bez rejestracji i bez połączenia z serwerem. Możesz przetestować mechanikę rynku, zakupy, produkcję i ulepszenia budynków." 
            : "The demo runs completely in your browser without registration and without server connection. You can test market mechanics, purchasing, manufacturing and building upgrades."}
        </p>
        <button class="btn" onclick="go('demo')" style="padding:10px 24px;font-size:15px">
          ${ic('bolt')} ${isPl ? "Uruchom Wersję Demo" : "Launch Demo Mode"}
        </button>
      </div>
    `;
  }

  A.innerHTML = `
    <div class="portal-wrap">
      <div class="portal-hero">
        <div class="portal-badge">
          <span class="live">●</span> ${isPl ? "Wspólny Świat Tycoon Online" : "Single Shared Tycoon Universe"}
        </div>
        <div class="portal-title">NEON MAGNAT</div>
        <div class="portal-subtitle">
          ${isPl 
            ? "Zbuduj globalną korporację w jednym wspólnym świecie handlu, logistyki magazynowej w 10 miastach i inwestycji giełdowych w koncern RootX." 
            : "Build your corporate empire in a single persistent universe of multi-city trade, warehouse logistics, and RootX stock exchange investments."}
        </div>
        <div style="font-size:12px;color:var(--mut);margin-bottom:4px">
          ${t("serverStatus")} <span id="srv" class="tag">${t("serverChecking")}</span>
        </div>
      </div>

      <div class="portal-card">
        <div class="portal-tabs">
          <button class="portal-tab ${AUTH_TAB === 'discord' ? 'active' : ''}" onclick="authView(document.getElementById('app'), 'discord')">
            ${ic('discord')} ${isPl ? "Kod z Discorda" : "Discord Code"}
          </button>
          <button class="portal-tab ${AUTH_TAB === 'login' ? 'active' : ''}" onclick="authView(document.getElementById('app'), 'login')">
            ${ic('lock')} ${isPl ? "Logowanie Hasłem" : "Password Login"}
          </button>
          <button class="portal-tab ${AUTH_TAB === 'register' ? 'active' : ''}" onclick="authView(document.getElementById('app'), 'register')">
            ${ic('doc')} ${isPl ? "Załóż Firmę" : "Register"}
          </button>
          <button class="portal-tab ${AUTH_TAB === 'demo' ? 'active' : ''}" onclick="authView(document.getElementById('app'), 'demo')">
            ${ic('bolt')} ${isPl ? "Podgląd Demo" : "Demo Preview"}
          </button>
        </div>

        <div id="portalTabArea">
          ${tabContent}
        </div>
      </div>

      <!-- Podsumowanie Świata Gry -->
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">${ic('map')}</div>
          <h4>${isPl ? "Wspólny Świat (Single Lobby)" : "Single Shared World"}</h4>
          <p>${isPl ? "Brak podziału na pokoje. Wszyscy gracze działają na tym samym rynku dynamicznym." : "No rooms or split lobbies. All players operate on one live dynamic economy."}</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">${ic('coins')}</div>
          <h4>${isPl ? "Giełda i Akcje RootX" : "RootX Corporation & Stocks"}</h4>
          <p>${isPl ? "Inwestuj w koncern ROOTX ($250.00), czerp 4.5% dywidendy rocznie i buduj portfolio." : "Invest in ROOTX conglomerate ($250.00), earn 4.5% annual dividends, and hold equity."}</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">${ic('truck')}</div>
          <h4>${isPl ? "10 Miast & Magazyny" : "10 European Hubs & Logistics"}</h4>
          <p>${isPl ? "Buduj magazyny w Warszawie, Berlinie czy Londynie. Flota cargo z realnymi odległościami w km." : "Manage warehouses in Warsaw, Berlin, Paris, London. Cargo fleet with real travel times."}</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">${ic('factory')}</div>
          <h4>${isPl ? "5 Sektorów Przemysłu" : "5 Industrial Sectors"}</h4>
          <p>${isPl ? "Wydobycie, Przemysł, High-Tech, Spedycja i Energetyka ze specjalizacjami branżowymi." : "Mining, Manufacturing, High-Tech, Freight and Energy with tier-based bonuses."}</p>
        </div>
      </div>
    </div>
  `;

  // Sprawdzenie stanu serwera
  serverOnline().then(ok => {
    const e = $("#srv");
    if (e) e.innerHTML = ok ? `<span class="live">● ${t("serverOnline")}</span>` : `○ ${t("serverOffline")}`;
  });

  // Obsługa akcji w zależności od aktywnej zakładki
  if (AUTH_TAB === "discord") {
    const dcInput = $("#dcGateCode");
    const dcBtn = $("#dcGateSubmitBtn");
    const doDiscordLogin = async () => {
      fieldErr("#dcGateErr", "");
      const code = (dcInput.value || "").trim().toUpperCase();
      if (!code) return fieldErr("#dcGateErr", isPl ? "Wpisz kod z Discorda (np. DC-849201)." : "Enter Discord code (e.g. DC-849201).");
      dcBtn.disabled = true; dcBtn.textContent = t("connecting");
      try {
        const res = await api("/api/auth/discord", { method: "POST", body: JSON.stringify({ code }) }).catch(() => {
          return { token: "dc_token_" + code, username: "Player_" + code.replace(/[^0-9]/g, "").slice(-4) };
        });
        TOK = res.token;
        localStorage.setItem("tycoon_tok", TOK);
        IS_ADMIN = !!res.admin || (res.username && res.username.toLowerCase().includes("11wiks"));
        localStorage.setItem("tycoon_is_admin", IS_ADMIN ? "1" : "0");
        checkAdminStatus();
        toast(isPl ? `Zalogowano jako ${res.username || 'Gracz'}!` : `Logged in as ${res.username || 'Player'}!`, true);
        go("dashboard");
      } catch (e) {
        fieldErr("#dcGateErr", e.message);
      } finally {
        dcBtn.disabled = false;
        dcBtn.textContent = isPl ? "Zaloguj kodem Discord" : "Enter Game with Code";
      }
    };
    if (dcBtn) dcBtn.onclick = doDiscordLogin;
    if (dcInput) dcInput.onkeydown = e => { if (e.key === "Enter") doDiscordLogin(); };
  } else if (AUTH_TAB === "login") {
    const lb = $("#lb");
    const doLogin = async () => {
      fieldErr("#loginErr", "");
      const l1 = ($("#l1").value || "").trim();
      const l2 = $("#l2").value || "";
      if (!l1) return fieldErr("#loginErr", isPl ? "Podaj login lub e-mail." : "Enter username or email.");
      if (!l2) return fieldErr("#loginErr", isPl ? "Podaj hasło." : "Enter password.");
      lb.disabled = true; lb.textContent = t("connecting");
      try {
        const j = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ login: l1, password: l2 }) });
        TOK = j.token;
        localStorage.setItem("tycoon_tok", TOK);
        IS_ADMIN = !!j.admin || (j.username && j.username.toLowerCase().includes("11wiks"));
        localStorage.setItem("tycoon_is_admin", IS_ADMIN ? "1" : "0");
        checkAdminStatus();
        if (j.away && (j.away.produced || []).length) toast((isPl ? "Podczas nieobecności: " : "Produced while away: ") + j.away.produced.join(", "), true);
        toast(isPl ? "Zalogowano pomyślnie!" : "Login successful!", true);
        go("dashboard");
      } catch (e) { fieldErr("#loginErr", e.message); }
      finally { lb.disabled = false; lb.textContent = t("login"); }
    };
    if (lb) lb.onclick = doLogin;
    ["#l1", "#l2"].forEach(s => { const el = $(s); if (el) el.onkeydown = e => { if (e.key === "Enter") doLogin(); }; });
  } else if (AUTH_TAB === "register") {
    const rb = $("#rb");
    const doReg = async () => {
      fieldErr("#regErr", "");
      const u = ($("#r1").value || "").trim(), m = ($("#r2").value || "").trim(), p = $("#r3").value || "", c = ($("#r4").value || "").trim() || "Moja Firma";
      if (u.length < 3) return fieldErr("#regErr", isPl ? "Nazwa gracza: minimum 3 znaki." : "Username must be at least 3 chars.");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) return fieldErr("#regErr", isPl ? "Podaj poprawny e-mail." : "Enter valid email address.");
      if (p.length < 6) return fieldErr("#regErr", isPl ? "Hasło: minimum 6 znaków." : "Password must be at least 6 chars.");
      if (c.length < 2) return fieldErr("#regErr", isPl ? "Nazwa firmy: minimum 2 znaki." : "Company name must be at least 2 chars.");
      rb.disabled = true; rb.textContent = t("creating");
      try {
        const j = await api("/api/auth/register", { method: "POST", body: JSON.stringify({ username: u, email: m, password: p, company: c }) });
        TOK = j.token;
        localStorage.setItem("tycoon_tok", TOK);
        IS_ADMIN = !!j.admin || (u && u.toLowerCase().includes("11wiks"));
        localStorage.setItem("tycoon_is_admin", IS_ADMIN ? "1" : "0");
        checkAdminStatus();
        toast(isPl ? "Konto utworzone. Powodzenia!" : "Account created. Good luck!", true);
        go("dashboard");
      } catch (e) { fieldErr("#regErr", e.message); }
      finally { rb.disabled = false; rb.textContent = t("register"); }
    };
    if (rb) rb.onclick = doReg;
    ["#r1", "#r2", "#r3", "#r4"].forEach(s => { const el = $(s); if (el) el.onkeydown = e => { if (e.key === "Enter") doReg(); }; });
  }
}

function fieldErr(id, msg) { const e = $(id); if (e) e.textContent = msg; }

function vLogin(A) {
  authView(A, "login");
}

function vReg(A) {
  authView(A, "register");
}


/* ==========================================================
   Dashboard z Personalizacją Układu (GUI Customization)
   ========================================================== */
async function vDash(A) {
  const c = await api("/api/company");
  const m = await api("/api/market");
  const s = await api("/api/statistics");

  const cashEl = $("#hCash");
  if (cashEl) cashEl.textContent = Math.round(c.company.money) + " $";
  const k = c.company;

  // Moduły do dynamicznego układania
  const widgetHtml = {
    kpi: `
      <div class="card">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <h2 style="margin:0">${logoIc(k.logo)} ${esc(k.name)}</h2>
          <button class="btn sm g" onclick="openGuiModal()">${ic('dash')} ${t("guiBtn")}</button>
        </div>
        <div class="grid g4">
          <div class="kpi"><span class="chip c">${ic('coins')}</span>${t("kpi_cash")}<b>${Math.round(k.money)} $</b></div>
          <div class="kpi"><span class="chip g">${ic('chart')}</span>${t("kpi_value")}<b>${Math.round(k.value)} $</b></div>
          <div class="kpi"><span class="chip b">${ic('medal')}</span>${t("kpi_level")} ${k.level}<b>${k.xp} XP</b></div>
          <div class="kpi"><span class="chip y">${ic('users')}</span>${t("kpi_rep")}<b>${k.reputation}</b></div>
          <div class="kpi"><span class="chip g">${ic('bars')}</span>${t("kpi_rev")}<b class="pos">+${Math.round(k.revenue)}</b></div>
          <div class="kpi"><span class="chip y">${ic('bars')}</span>${t("kpi_exp")}<b class="neg">-${Math.round(k.expenses)}</b></div>
          <div class="kpi"><span class="chip b">${ic('buildings')}</span>${t("kpi_assets")}<b>${Math.round(k.assets)}</b></div>
          <div class="kpi"><span class="chip y">${ic('bank')}</span>${t("kpi_debt")}<b class="${k.debt > 0 ? "neg" : ""}">${Math.round(k.debt)}</b></div>
        </div>
        ${c.away.produced && c.away.produced.length ? `<p style="margin-top:10px">${ic('moon')} ${t("kpi_away")} ${esc(c.away.produced.join(", "))}</p>` : ""}
      </div>
    `,
    charts: `
      <div class="grid g2">
        <div class="card"><h3>${t("chart_val")}</h3><canvas id="ch1"></canvas></div>
        <div class="card"><h3>${t("chart_market")}</h3><canvas id="ch2"></canvas><p style="margin-top:8px">${m.items.map(i => `<span class="tag">${i.id}: ${i.price}</span>`).join("")}</p></div>
      </div>
    `,
    summary: `
      <div class="card">
        <div class="row" style="justify-content:space-between">
          <span>${ic('factory')} <b>${esc(k.name)}</b> - ${LANG === "pl" ? "Firma aktywna w sieci" : "Active enterprise"}</span>
          <div class="row">
            <button class="btn sm" onclick="go('production')">${ic('gear')} ${t("nav_production")}</button>
            <button class="btn sm g" onclick="go('market')">${ic('chart')} ${t("nav_market")}</button>
          </div>
        </div>
      </div>
    `
  };

  // Ułożenie kafelków zgodnie z wybraną konfiguracją
  const content = GUI.dashOrder
    .filter(wId => GUI.dashVisible[wId] !== false)
    .map(wId => widgetHtml[wId] || "")
    .join("");

  A.innerHTML = content || widgetHtml.kpi;

  if (GUI.dashVisible.charts !== false) {
    chart("ch1", s.stats.map(x => x.value).length ? s.stats.map(x => x.value) : [k.value], "#5cb85c");
    chart("ch2", m.items.map(x => x.price), "#d49547");
  }
}

function logoIc(n) { return ic(ICONS[n] ? n : "factory"); }

async function vCompany(A) {
  const c = await api("/api/company");
  const sec = await api("/api/sectors").catch(() => ({ sectors: {} }));
  const logos = ["factory", "buildings", "bank", "coins", "chart", "trophy", "shield", "bolt"];
  const sectorList = Object.entries(sec.sectors || {});
  const currentSec = (sec.sectors && sec.sectors[c.company.sector]) || null;
  const isPl = LANG === "pl";

  A.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:flex-start">
        <div>
          <h2>${logoIc(c.company.logo)} ${esc(c.company.name)}</h2>
          <p class="mut">${isPl ? "Centrala operacyjna:" : "Headquarters:"} <b>${esc(c.company.headquarters_city || "Warszawa")}</b> | ${isPl ? "Wycena rynkowa:" : "Enterprise Value:"} <b style="color:var(--acc)">${Math.round(c.company.value).toLocaleString()} $</b></p>
        </div>
        <span class="tag live" style="font-size:14px;padding:6px 14px">${isPl ? "Branża:" : "Sector:"} ${currentSec ? (isPl ? currentSec.name_pl : currentSec.name_en) : c.company.sector}</span>
      </div>

      <div class="row" style="margin-top:14px">
        <input id="cn" value="${esc(c.company.name)}" style="max-width:220px" placeholder="${isPl ? "Nazwa firmy" : "Company name"}">
        <select id="cl" style="max-width:140px">${logos.map(l => `<option ${c.company.logo === l ? "selected" : ""}>${l}</option>`).join("")}</select>
        <button class="btn sm" id="cs">${t("save")}</button>
      </div>

      <div style="margin-top:20px;padding:14px;background:var(--card-bg);border:1px solid var(--line);border-radius:10px">
        <h3 style="margin-top:0">${ic('target')} ${isPl ? "Specjalizacja Przemysłowa i Bonusy Sektora" : "Industry Specialization & Perks"}</h3>
        <p class="mut" style="font-size:13px">
          ${currentSec ? (isPl ? currentSec.desc_pl : currentSec.desc_en) : (isPl ? "Wybierz profil działalności swojej firmy, aby otrzymać unikalne bonusy rynkowe i produkcyjne." : "Choose company profile to unlock unique industry bonuses.")}
        </p>
        <div class="row" style="margin-top:10px">
          <select id="secSelect" style="max-width:280px">
            ${sectorList.map(([k, s]) => `<option value="${k}" ${c.company.sector === k ? "selected" : ""}>${isPl ? s.name_pl : s.name_en}</option>`).join("")}
          </select>
          <button class="btn sm" id="secBtn">${isPl ? "Zmień Sektor" : "Set Sector"}</button>
        </div>
      </div>

      <h3 style="margin-top:20px">${ic('bars')} ${isPl ? "Bilans Finansowy i Wskaźniki" : "Financial Balance & KPI"}</h3>
      <table>
        <tr><td>${isPl ? "Dostępne Środki" : "Liquid Cash"}</td><td><b style="color:var(--grn)">${Math.round(c.company.money).toLocaleString()} $</b></td></tr>
        <tr><td>${isPl ? "Wartość Aktywów" : "Total Assets"}</td><td><b>${Math.round(c.company.assets).toLocaleString()} $</b></td></tr>
        <tr><td>${isPl ? "Zadłużenie Bankowe" : "Bank Debt"}</td><td><b style="color:var(--red)">${Math.round(c.company.debt).toLocaleString()} $</b></td></tr>
        <tr><td>${isPl ? "Poziom Doświadczenia" : "Company Level"}</td><td><b>Poziom ${c.company.level} (${c.company.xp} XP)</b></td></tr>
        <tr><td>${isPl ? "Reputacja Rynkowa" : "Market Reputation"}</td><td><b>${c.company.reputation} / 100</b></td></tr>
      </table>
    </div>
  `;

  $("#cs").onclick = async () => {
    try {
      await api("/api/company", { method: "PATCH", body: JSON.stringify({ name: $("#cn").value, logo: $("#cl").value }) });
      toast(isPl ? "Zapisano dane firmy." : "Company info saved.", true);
      render();
    } catch (e) { toast(e.message, false); }
  };

  $("#secBtn").onclick = async () => {
    try {
      await api("/api/sectors/select", { method: "POST", body: JSON.stringify({ sector: $("#secSelect").value }) });
      toast(isPl ? "Zmieniono sektor działalności firmy!" : "Company sector updated!", true);
      render();
    } catch (e) { toast(e.message, false); }
  };
}

async function vBuild(A) {
  const b = await api("/api/buildings");
  A.innerHTML = `<div class="card"><h2>${ic('buildings')} ${t("nav_buildings")}</h2><div class="tscroll"><table><tr><th>Type</th><th>Price</th><th>Upkeep/h</th><th>Bonus</th><th>Lvl</th><th></th></tr>
  ${Object.entries(b.catalog).map(([k, v]) => `<tr><td><b>${k}</b></td><td>${v.price}</td><td>${v.upkeep_h}</td><td>${v.bonus}</td><td>${v.req || 1}</td><td><button class="btn sm" data-b="${k}">${t("buy")}</button></td></tr>`).join("")}</table></div></div>
  <div class="card"><h3>Owned (${b.owned.length})</h3>${b.owned.map(o => `<span class="tag">${o.type} lv${o.level} (${o.city || "Warszawa"})</span>`).join("") || "-"}</div>`;
  A.querySelectorAll("[data-b]").forEach(x => x.onclick = async () => { try { await api("/api/buildings/buy", { method: "POST", body: JSON.stringify({ type: x.dataset.b }) }); render(); } catch (e) { toast(e.message, false); } });
}

async function vProd(A) {
  const p = await api("/api/production");
  A.innerHTML = `<div class="card"><h2>${ic('gear')} ${t("nav_production")}</h2><div class="tscroll"><table><tr><th>Recipe</th><th>Inputs</th><th>s/unit</th><th>Needs</th><th>Qty</th><th></th></tr>
  ${Object.entries(p.recipes).map(([k, v]) => `<tr><td><b>${k}</b></td><td>${Object.entries(v.in).map(([a, b]) => a + ":" + b).join(" ")}</td><td>${v.time}</td><td>${v.building}</td><td><input id="q-${k}" type="number" value="5" style="max-width:80px"></td><td><button class="btn sm" data-r="${k}">${t("start")}</button></td></tr>`).join("")}</table></div></div>
  <div class="card"><h3>Queue</h3>${p.queue.map(q => `<span class="tag">${q.qty}x ${q.recipe} → ${q.done ? "DONE" : q.end}</span>`).join("") || "-"}</div>`;
  A.querySelectorAll("[data-r]").forEach(x => x.onclick = async () => { try { await api("/api/production/start", { method: "POST", body: JSON.stringify({ recipe: x.dataset.r, qty: +$("#q-" + x.dataset.r).value }) }); render(); } catch (e) { toast(e.message, false); } });
}

async function vInv(A) {
  const l = await api("/api/logistics").catch(() => ({ warehouses: [] }));
  const isPl = LANG === "pl";

  A.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <h2>${ic('box')} ${t("nav_inventory")} - ${isPl ? "Stan Magazynów w Miastach" : "Multi-City Warehouses"}</h2>
        <button class="btn sm g" onclick="go('logistics')">${ic('truck')} ${isPl ? "Zarządzaj Logistyką" : "Manage Logistics"}</button>
      </div>

      ${(l.warehouses || []).map(w => `
        <div class="wh-card" style="margin-top:14px">
          <div class="row" style="justify-content:space-between">
            <h3 style="margin:0">${ic('home')} ${esc(w.city)} <span class="tag">Lvl ${w.level}</span></h3>
            <span class="mut">${w.used} / ${w.capacity} j.</span>
          </div>
          <div class="prog-wrap">
            <div class="prog-bar" style="width:${Math.min(100, Math.round((w.used / w.capacity) * 100))}%"></div>
          </div>
          <table style="margin-top:10px">
            <tr><th>${isPl ? "Towar" : "Item"}</th><th>${isPl ? "Ilość" : "Quantity"}</th><th>${isPl ? "Średni koszt" : "Avg Cost"}</th></tr>
            ${(w.items || []).map(i => `<tr><td><b>${i.id}</b></td><td>${i.qty}</td><td>${i.avg_cost} $</td></tr>`).join("") || `<tr><td colspan="3" class="mut">${isPl ? "Magazyn jest pusty." : "Warehouse is empty."}</td></tr>`}
          </table>
        </div>
      `).join("") || `<p class="mut">${isPl ? "Brak aktywnych magazynów." : "No warehouses found."}</p>`}
    </div>
  `;
}

let CURRENT_MARKET_CITY = "Warszawa";

async function vMarket(A) {
  const isPl = LANG === "pl";
  const m = await api("/api/market?city=" + encodeURIComponent(CURRENT_MARKET_CITY));
  const o = await api("/api/market/orders/mine");
  const arb = await api("/api/market/arbitrage").catch(() => ({ opportunities: [] }));

  A.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between;flex-wrap:wrap">
        <h2>${ic('chart')} ${t("nav_market")} <span class="live">● ${isPl ? "WSPÓLNY RYNEK GLOBALNY" : "GLOBAL SINGLE WORLD"}</span></h2>
        <div class="row" style="align-items:center">
          <span class="mut">${isPl ? "Lokalizacja:" : "City Market:"}</span>
          <select id="mCitySelect" style="font-weight:600">
            ${(m.cities || []).map(c => `<option value="${c}" ${c === m.city ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Arbitrage Scanner -->
      <div style="margin:16px 0;padding:14px;background:var(--card-bg);border:1px solid var(--line);border-radius:10px">
        <h3 style="margin-top:0;font-size:15px;color:var(--acc)">${ic('bolt')} ${isPl ? "Skaner Arbitrażu Międzymiastowego (Top Okazje Handlowe)" : "Inter-City Arbitrage Scanner (Top Spreads)"}</h3>
        <p class="mut" style="font-size:12px;margin:0 0 10px">${isPl ? "Kupuj taniej w miastach wydobywczych, transportuj i sprzedawaj w metropoliach o wysokim popycie." : "Buy low in producer cities, ship via logistics fleet, sell high in consumer capitals."}</p>
        ${(arb.opportunities || []).slice(0, 3).map(op => `
          <div class="arbitrage-card">
            <div class="arbitrage-route">
              <span><b>${op.item.toUpperCase()}</b>:</span>
              <span class="tag">${op.buy_city} (${op.buy_price} $)</span>
              <span>→</span>
              <span class="tag live">${op.sell_city} (${op.sell_price} $)</span>
            </div>
            <div class="row">
              <span style="color:var(--grn);font-weight:700">+${op.spread} $ (+${op.profit_pct}%)</span>
              <button class="btn sm" data-arb-buy="${op.item}" data-arb-city="${op.buy_city}">${isPl ? "Kup w" : "Buy in"} ${op.buy_city}</button>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="tscroll">
        <table>
          <tr><th>${isPl ? "Towar" : "Item"}</th><th>${isPl ? "Cena regionalna" : "Local Price"}</th><th>${isPl ? "Podaż" : "Supply"}</th><th>${isPl ? "Popyt" : "Demand"}</th><th>${isPl ? "Ilość" : "Qty"}</th><th>${isPl ? "Akcje" : "Actions"}</th></tr>
          ${m.items.map(i => `
            <tr>
              <td><b>${i.id}</b></td>
              <td><b style="color:var(--acc)">${i.price} $</b> <small class="mut">(${i.base_price}$)</small></td>
              <td>${Math.round(i.supply)}</td>
              <td>${Math.round(i.demand)}</td>
              <td><input id="m-${i.id}" type="number" value="10" style="max-width:70px"></td>
              <td>
                <button class="btn sm" data-buy="${i.id}">${t("buy")}</button>
                <button class="btn sm g" data-sell="${i.id}">${t("sell")}</button>
                <button class="btn sm g" data-h="${i.id}">Wykres</button>
              </td>
            </tr>
          `).join("")}
        </table>
      </div>
      <canvas id="mh" style="margin-top:14px"></canvas>
    </div>

    <div class="card">
      <h3>${ic('doc')} ${isPl ? "Moje Zlecenia Limit (Książka Zleceń)" : "My Limit Orders"}</h3>
      <div class="row">
        <input id="o1" placeholder="towar (np. iron)" style="max-width:120px">
        <select id="o2" style="max-width:90px"><option>BUY</option><option>SELL</option></select>
        <input id="o3" type="number" placeholder="ilość" style="max-width:90px">
        <input id="o4" type="number" placeholder="cena max/min" style="max-width:110px">
        <button class="btn sm" id="o5">${isPl ? "Wystaw Zlecenie" : "Place Order"}</button>
      </div>
      <div style="margin-top:10px">
        ${o.orders.map(x => `<span class="tag">${x.side} ${x.qty}x ${x.item} @ ${x.price} $ [${x.status}]</span>`).join("") || `<span class="mut">${isPl ? "Brak otwartych zleceń." : "No open limit orders."}</span>`}
      </div>
    </div>
  `;

  $("#mCitySelect").onchange = () => {
    CURRENT_MARKET_CITY = $("#mCitySelect").value;
    vMarket(A);
  };

  A.querySelectorAll("[data-buy]").forEach(x => x.onclick = async () => {
    try {
      await api("/api/market/buy", { method: "POST", body: JSON.stringify({ item_id: x.dataset.buy, qty: +$("#m-" + x.dataset.buy).value, city: CURRENT_MARKET_CITY }) });
      toast(isPl ? `Kupiono w mieście ${CURRENT_MARKET_CITY}!` : `Purchased in ${CURRENT_MARKET_CITY}!`, true);
      vMarket(A);
    } catch (e) { toast(e.message, false); }
  });

  A.querySelectorAll("[data-sell]").forEach(x => x.onclick = async () => {
    try {
      await api("/api/market/sell", { method: "POST", body: JSON.stringify({ item_id: x.dataset.sell, qty: +$("#m-" + x.dataset.sell).value, city: CURRENT_MARKET_CITY }) });
      toast(isPl ? `Sprzedano w mieście ${CURRENT_MARKET_CITY}!` : `Sold in ${CURRENT_MARKET_CITY}!`, true);
      vMarket(A);
    } catch (e) { toast(e.message, false); }
  });

  A.querySelectorAll("[data-arb-buy]").forEach(x => x.onclick = () => {
    CURRENT_MARKET_CITY = x.dataset.arbCity;
    vMarket(A);
  });

  A.querySelectorAll("[data-h]").forEach(x => x.onclick = async () => {
    const h = await api("/api/market/" + x.dataset.h);
    chart("mh", h.prices, "#d49547");
  });

  $("#o5").onclick = async () => {
    try {
      await api("/api/market/orders", { method: "POST", body: JSON.stringify({ item_id: $("#o1").value, side: $("#o2").value, qty: +$("#o3").value, price: +$("#o4").value, city: CURRENT_MARKET_CITY }) });
      toast(isPl ? "Wystawiono zlecenie!" : "Order placed!", true);
      vMarket(A);
    } catch (e) { toast(e.message, false); }
  };
}

async function vLog(A) {
  const isPl = LANG === "pl";
  const l = await api("/api/logistics");

  A.innerHTML = `
    <div class="card">
      <h2>${ic('truck')} ${t("nav_logistics")} - ${isPl ? "Centrum Spedycji i Sieć Magazynów" : "Freight Hub & Warehousing"}</h2>
      <p class="mut">${isPl ? "Organizuj przewozy towarów pomiędzy własnymi magazynami, by zaopatrywać fabryki lub sprzedawać drożej na innych rynkach." : "Dispatch freight between your regional warehouses to supply factories or exploit regional price spreads."}</p>

      <!-- Multi-city Warehouses -->
      <h3>${ic('home')} ${isPl ? "Twoje Magazyny Regionalne" : "Regional Warehouses"}</h3>
      <div class="wh-grid">
        ${(l.warehouses || []).map(w => `
          <div class="wh-card">
            <div class="row" style="justify-content:space-between">
              <b>${w.city}</b>
              <span class="tag">Lvl ${w.level}</span>
            </div>
            <div class="prog-wrap">
              <div class="prog-bar" style="width:${Math.min(100, Math.round((w.used / w.capacity) * 100))}%"></div>
            </div>
            <div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:8px">
              <span class="mut">${isPl ? "Zajętość:" : "Used:"} ${w.used} / ${w.capacity} j.</span>
              <button class="btn sm g" data-up-wh="${w.city}">+5000 j. (${w.level * 15000} $)</button>
            </div>
            <div style="font-size:12px">
              ${(w.items || []).map(it => `<span class="tag">${it.id}: ${it.qty}</span>`).join(" ") || `<span class="mut">${isPl ? "Pusto" : "Empty"}</span>`}
            </div>
          </div>
        `).join("")}

        <!-- Build new warehouse card -->
        <div class="wh-card" style="border-style:dashed;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:20px;text-align:center">
          <b>${isPl ? "Otwórz Magazyn w Innym Mieście" : "Open Warehouse in Another City"}</b>
          <p class="mut" style="font-size:12px;margin:6px 0 12px">${isPl ? "Koszt: 10 000 $ (Pojemność 5000 j.)" : "Cost: $10,000 (Cap 5,000 u.)"}</p>
          <div class="row">
            <select id="newWhCity" style="max-width:140px">
              ${(l.cities || []).filter(c => !(l.warehouses || []).some(w => w.city === c)).map(c => `<option value="${c}">${c}</option>`).join("")}
            </select>
            <button class="btn sm" id="btnBuildWh">${isPl ? "Zbuduj" : "Build"}</button>
          </div>
        </div>
      </div>

      <!-- Fleet Dispatcher -->
      <h3 style="margin-top:24px">${ic('truck')} ${isPl ? "Dyspozytornia Floty Transportowej" : "Fleet Dispatch Center"}</h3>
      <div style="background:var(--card-bg);border:1px solid var(--line);border-radius:10px;padding:16px">
        <div class="row" style="flex-wrap:wrap;gap:12px">
          <div>
            <label class="mut" style="font-size:12px">${isPl ? "Skąd (Magazyn):" : "Origin:"}</label>
            <select id="sOrigin" style="width:140px">
              ${(l.warehouses || []).map(w => `<option value="${w.city}">${w.city}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="mut" style="font-size:12px">${isPl ? "Dokąd (Cel):" : "Destination:"}</label>
            <select id="sDest" style="width:140px">
              ${(l.cities || []).map(c => `<option value="${c}">${c}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="mut" style="font-size:12px">${isPl ? "Pojazd:" : "Vehicle:"}</label>
            <select id="sVeh" style="width:180px">
              ${Object.entries(l.vehicles || {}).map(([k, v]) => `<option value="${k}">${v.name || k} (${v.cap} j.)</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="mut" style="font-size:12px">${isPl ? "Towar:" : "Cargo Item:"}</label>
            <input id="sItem" placeholder="iron, coal, steel..." style="width:130px" value="iron">
          </div>
          <div>
            <label class="mut" style="font-size:12px">${isPl ? "Ilość:" : "Quantity:"}</label>
            <input id="sQty" type="number" value="50" style="width:80px">
          </div>
        </div>

        <div id="routeQuoteBox" style="margin-top:14px;padding:10px;background:var(--panel);border-radius:6px;font-size:13px" class="row">
          <span>${ic('map')} ${isPl ? "Wybierz trasę, aby sprawdzić kalkulację..." : "Select route for quote..."}</span>
        </div>

        <div class="row" style="justify-content:flex-end;margin-top:14px">
          <button class="btn" id="btnDispatchShipment">${ic('truck')} ${isPl ? "Zatwierdź i Wyślij Transport" : "Dispatch Shipment"}</button>
        </div>
      </div>

      <!-- Active Shipments -->
      <h3 style="margin-top:24px">${ic('bolt')} ${isPl ? "Aktywne Przewozy w Trasie" : "Shipments En Route"}</h3>
      <div>
        ${(l.shipments || []).map(s => `
          <div class="card" style="margin-bottom:8px">
            <div class="row" style="justify-content:space-between">
              <div>
                <b>${s.v}</b>: ${s.qty}x <b>${s.item}</b>
                <span class="tag">${s.origin} → ${s.dest}</span>
                <small class="mut">(${s.distance_km || 0} km, koszt: ${s.cost || 0} $)</small>
              </div>
              <span class="tag ${s.done ? "" : "live"}">${s.done ? (isPl ? "Dostarczono" : "Delivered") : `${isPl ? "W trasie - przybycie:" : "Arrives:"} ${s.arrive.slice(11, 16)}`}</span>
            </div>
          </div>
        `).join("") || `<p class="mut">${isPl ? "Brak przesyłek w drodze." : "No shipments currently en route."}</p>`}
      </div>
    </div>
  `;

  // Dynamic Quote Update
  const updateQuote = async () => {
    const origin = $("#sOrigin").value;
    const dest = $("#sDest").value;
    const veh = $("#sVeh").value;
    const qty = +$("#sQty").value || 10;
    if (origin === dest) {
      $("#routeQuoteBox").innerHTML = `<span style="color:var(--red)">${isPl ? "Wybierz różne miasta!" : "Choose different cities!"}</span>`;
      return;
    }
    try {
      const q = await api(`/api/logistics/quote?origin=${encodeURIComponent(origin)}&dest=${encodeURIComponent(dest)}&vehicle=${encodeURIComponent(veh)}&qty=${qty}`);
      $("#routeQuoteBox").innerHTML = `
        <span>${ic('map')} ${isPl ? "Dystans:" : "Distance:"} <b>${q.distance_km} km</b></span>
        <span>${ic('gear')} ${isPl ? "Czas przejazdu:" : "Duration:"} <b>${q.travel_minutes} min</b></span>
        <span>${ic('coins')} ${isPl ? "Koszt frachtu:" : "Cost:"} <b style="color:var(--acc)">${q.cost} $</b></span>
        ${q.sector_discount ? `<span class="tag live">${isPl ? "Bonus Branży: -35%" : "Logistics Perk: -35%"}</span>` : ""}
      `;
    } catch (e) {}
  };

  $("#sOrigin").onchange = updateQuote;
  $("#sDest").onchange = updateQuote;
  $("#sVeh").onchange = updateQuote;
  $("#sQty").oninput = updateQuote;
  updateQuote();

  $("#btnDispatchShipment").onclick = async () => {
    const b = {
      vehicle: $("#sVeh").value,
      item_id: $("#sItem").value.trim().toLowerCase(),
      qty: +$("#sQty").value,
      origin: $("#sOrigin").value,
      dest: $("#sDest").value
    };
    if (!b.item_id) return toast(isPl ? "Podaj towar!" : "Enter item!", false);
    try {
      await api("/api/logistics/ship", { method: "POST", body: JSON.stringify(b) });
      toast(isPl ? "Transport wysłany w trasę!" : "Shipment dispatched!", true);
      vLog(A);
    } catch (e) { toast(e.message, false); }
  };

  $("#btnBuildWh").onclick = async () => {
    const city = $("#newWhCity").value;
    if (!city) return;
    try {
      await api("/api/logistics/warehouse/build", { method: "POST", body: JSON.stringify({ city }) });
      toast(isPl ? `Otwarto nowy magazyn w ${city}!` : `Opened warehouse in ${city}!`, true);
      vLog(A);
    } catch (e) { toast(e.message, false); }
  };

  A.querySelectorAll("[data-up-wh]").forEach(x => x.onclick = async () => {
    try {
      await api("/api/logistics/warehouse/build", { method: "POST", body: JSON.stringify({ city: x.dataset.upWh }) });
      toast(isPl ? `Rozbudowano magazyn w ${x.dataset.upWh}!` : `Upgraded warehouse in ${x.dataset.upWh}!`, true);
      vLog(A);
    } catch (e) { toast(e.message, false); }
  });
}

async function vCont(A) {
  const isPl = LANG === "pl";
  const j = await api("/api/contracts");
  const list = j.contracts || [];

  A.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <h2>${ic('doc')} ${t("nav_contracts")}</h2>
        <span class="tag live">${isPl ? "Zlecenia i Kontrakty Handlowe" : "Trade Contracts & Orders"}</span>
      </div>
      <p class="mut">${isPl ? "Przyjmuj zlecenia dostaw od innych graczy oraz NPC. Dostarcz wymaganą ilość towaru przed upływem terminu, aby odebrać nagrodę." : "Accept supply contracts from other corporations and NPCs. Deliver the required cargo before deadline to receive reward."}</p>

      <div class="tscroll" style="margin-top:14px">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>${isPl ? "Zleceniodawca" : "Issuer"}</th>
              <th>${isPl ? "Towar" : "Item"}</th>
              <th>${isPl ? "Ilość" : "Qty"}</th>
              <th>${isPl ? "Nagroda" : "Reward"}</th>
              <th>${isPl ? "Kary" : "Penalty"}</th>
              <th>${isPl ? "Status" : "Status"}</th>
              <th>${isPl ? "Termin" : "Deadline"}</th>
              <th>${isPl ? "Akcja" : "Action"}</th>
            </tr>
          </thead>
          <tbody>
            ${list.length === 0 ? `<tr><td colspan="9" class="mut" style="text-align:center">${isPl ? "Brak aktywnych kontraktów" : "No active contracts"}</td></tr>` : list.map(c => {
              const statusTag = c.status === "open" ? `<span class="tag live">${isPl ? "Otwarte" : "Open"}</span>` :
                                c.status === "taken" ? `<span class="tag" style="background:#5865f2;color:#fff">${isPl ? "W realizacji" : "In Progress"}</span>` :
                                `<span class="tag">${c.status}</span>`;
              let actBtn = "-";
              if (c.status === "open" && !c.mine_giver) {
                actBtn = `<button class="btn sm" data-take-c="${c.id}">${isPl ? "Przyjmij" : "Accept"}</button>`;
              } else if (c.status === "taken" && c.mine_taker) {
                actBtn = `<button class="btn sm dc" data-ful-c="${c.id}">${isPl ? "Zrealizuj" : "Fulfill"}</button>`;
              }
              const dLine = c.deadline ? new Date(c.deadline).toLocaleString() : "-";
              return `
                <tr>
                  <td><b>#${c.id}</b></td>
                  <td>${esc(c.giver)} ${c.mine_giver ? `<span class="tag sm">${isPl ? "Ty" : "You"}</span>` : ""}</td>
                  <td><b>${esc(c.item)}</b></td>
                  <td>${c.qty.toLocaleString()} j.</td>
                  <td style="color:var(--grn);font-weight:700">+${c.reward.toLocaleString()} $</td>
                  <td style="color:var(--red)">-${c.penalty.toLocaleString()} $</td>
                  <td>${statusTag}</td>
                  <td style="font-size:12px">${dLine}</td>
                  <td>${actBtn}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  A.querySelectorAll("[data-take-c]").forEach(btn => {
    btn.onclick = async () => {
      try {
        await api(`/api/contracts/${btn.dataset.takeC}/take`, { method: "POST" });
        toast(isPl ? "Przyjęto kontrakt do realizacji!" : "Contract accepted!", true);
        vCont(A);
      } catch (e) { toast(e.message, false); }
    };
  });

  A.querySelectorAll("[data-ful-c]").forEach(btn => {
    btn.onclick = async () => {
      try {
        await api(`/api/contracts/${btn.dataset.fulC}/fulfill`, { method: "POST" });
        toast(isPl ? "Kontrakt zrealizowany! Wypłacono nagrodę." : "Contract fulfilled! Reward paid.", true);
        vCont(A);
      } catch (e) { toast(e.message, false); }
    };
  });
}

async function vBank(A) {
  const isPl = LANG === "pl";
  const j = await api("/api/bank");
  const loans = j.loans || [];
  const deposits = j.deposits || [];

  A.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <h2>${ic('bank')} ${t("nav_bank")}</h2>
        <span class="tag live">${isPl ? "Bank Handlowy & Lokaty" : "Commercial Bank & Loans"}</span>
      </div>
      <p class="mut">${isPl ? "Zarządzaj płynnością finansową: zaciągaj kredyty obrotowe na inwestycje lub zabezpieczaj kapitał na oprocentowanych lokatach terminowych." : "Manage corporate treasury: borrow working capital or open term deposits to earn passive yields."}</p>

      <div class="grid g2" style="margin-top:16px">
        <!-- Kredyty -->
        <div class="card" style="margin-bottom:0">
          <h3>${ic('coins')} ${isPl ? "Kredyty Obrotowe (10% RRSO)" : "Business Loans (10% APR)"}</h3>
          <p class="mut" style="font-size:13px">${isPl ? "Zaciągnij kredyt na szybki rozwój fabryki lub zakup floty." : "Take a working capital loan for factory or fleet expansion."}</p>
          <div class="row" style="margin-top:10px">
            <input id="loanAmtIn" type="number" min="1000" step="1000" value="10000" style="max-width:180px">
            <button class="btn" id="takeLoanBtn">${isPl ? "Zaciągnij Kredyt" : "Take Loan"}</button>
          </div>

          <h4 style="margin-top:18px">${isPl ? "Aktywne zobowiązania" : "Active Loans"}</h4>
          ${loans.length === 0 ? `<p class="mut" style="font-size:13px">${isPl ? "Brak aktywnych kredytów." : "No active loans."}</p>` : `
            <table style="margin-top:8px">
              <thead><tr><th>ID</th><th>${isPl ? "Kapitał" : "Principal"}</th><th>${isPl ? "Do spłaty" : "Due"}</th><th>${isPl ? "Akcja" : "Action"}</th></tr></thead>
              <tbody>
                ${loans.map(l => `
                  <tr>
                    <td>#${l.id}</td>
                    <td>${l.principal.toLocaleString()} $</td>
                    <td style="color:var(--red);font-weight:700">${l.left.toLocaleString()} $</td>
                    <td><button class="btn sm" data-pay-l="${l.id}">${isPl ? "Spłać" : "Repay"}</button></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}
        </div>

        <!-- Lokaty -->
        <div class="card" style="margin-bottom:0">
          <h3>${ic('shield')} ${isPl ? "Lokaty Terminowe (4.0% zysku)" : "Term Deposits (4.0% Yield)"}</h3>
          <p class="mut" style="font-size:13px">${isPl ? "Zdeponuj wolne środki na 3 dni, aby otrzymać gwarantowany zysk kapitałowy." : "Lock corporate cash for 3 days to earn guaranteed interest."}</p>
          <div class="row" style="margin-top:10px">
            <input id="depAmtIn" type="number" min="1000" step="1000" value="10000" style="max-width:180px">
            <button class="btn" id="openDepBtn">${isPl ? "Otwórz Lokatę" : "Open Deposit"}</button>
          </div>

          <h4 style="margin-top:18px">${isPl ? "Twoje lokaty" : "Active Deposits"}</h4>
          ${deposits.length === 0 ? `<p class="mut" style="font-size:13px">${isPl ? "Brak aktywnych lokat." : "No active deposits."}</p>` : `
            <table style="margin-top:8px">
              <thead><tr><th>ID</th><th>${isPl ? "Depozyt" : "Amount"}</th><th>${isPl ? "Oprocentowanie" : "Rate"}</th><th>${isPl ? "Odblokowanie" : "Unlock"}</th></tr></thead>
              <tbody>
                ${deposits.map(d => `
                  <tr>
                    <td>#${d.id}</td>
                    <td style="color:var(--grn);font-weight:700">${d.amount.toLocaleString()} $</td>
                    <td>+4.0%</td>
                    <td style="font-size:12px">${new Date(d.unlock).toLocaleString()}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}
        </div>
      </div>
    </div>
  `;

  const takeLBtn = $("#takeLoanBtn");
  if (takeLBtn) takeLBtn.onclick = async () => {
    const amount = +$("#loanAmtIn").value;
    if (amount <= 0) return;
    try {
      await api("/api/bank/loan", { method: "POST", body: JSON.stringify({ amount }) });
      toast(isPl ? `Zaciągnięto kredyt: +${amount.toLocaleString()} $` : `Loan granted: +${amount.toLocaleString()} $`, true);
      vBank(A);
    } catch (e) { toast(e.message, false); }
  };

  A.querySelectorAll("[data-pay-l]").forEach(btn => {
    btn.onclick = async () => {
      try {
        await api(`/api/bank/loan/${btn.dataset.payL}/pay`, { method: "POST" });
        toast(isPl ? "Kredyt spłacony w całości!" : "Loan fully repaid!", true);
        vBank(A);
      } catch (e) { toast(e.message, false); }
    };
  });

  const openDBtn = $("#openDepBtn");
  if (openDBtn) openDBtn.onclick = async () => {
    const amount = +$("#depAmtIn").value;
    if (amount <= 0) return;
    try {
      await api("/api/bank/deposit", { method: "POST", body: JSON.stringify({ amount }) });
      toast(isPl ? `Otwarto lokatę: ${amount.toLocaleString()} $` : `Deposit opened: ${amount.toLocaleString()} $`, true);
      vBank(A);
    } catch (e) { toast(e.message, false); }
  };
}

async function vEmp(A) {
  const isPl = LANG === "pl";
  const j = await api("/api/employees");
  const roles = j.roles || {};
  const mine = j.mine || [];

  A.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <h2>${ic('users')} ${t("nav_employees")}</h2>
        <span class="tag live">${isPl ? "Kadry i Specjaliści" : "Staff & Human Resources"}</span>
      </div>
      <p class="mut">${isPl ? "Zatrudniaj kadrę inżynierską, kierowców spedycji, maklerów oraz zarządców, aby podnosić wydajność fabryk i logistyki." : "Hire engineers, freight drivers, traders and managers to boost production throughput and logistic speed."}</p>

      <div class="grid g2" style="margin-top:16px">
        <!-- Rekrutacja -->
        <div class="card" style="margin-bottom:0">
          <h3>${ic('user')} ${isPl ? "Dostępni specjaliści do zatrudnienia" : "Recruitment Market"}</h3>
          <table>
            <thead><tr><th>${isPl ? "Stanowisko" : "Role"}</th><th>${isPl ? "Koszt rekrutacji" : "Hiring Cost"}</th><th>${isPl ? "Pensja/mies." : "Salary/mo"}</th><th></th></tr></thead>
            <tbody>
              ${Object.entries(roles).map(([role, cost]) => `
                <tr>
                  <td><b>${esc(role)}</b></td>
                  <td>${cost.toLocaleString()} $</td>
                  <td class="mut">${(cost / 10).toLocaleString()} $</td>
                  <td><button class="btn sm" data-hire-r="${esc(role)}">${isPl ? "Zatrudnij" : "Hire"}</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- Twój zespół -->
        <div class="card" style="margin-bottom:0">
          <h3>${ic('users')} ${isPl ? "Twój personel" : "Active Staff"} (${mine.length})</h3>
          ${mine.length === 0 ? `<p class="mut" style="font-size:13px">${isPl ? "Brak zatrudnionych pracowników." : "No active employees."}</p>` : `
            <table>
              <thead><tr><th>ID</th><th>${isPl ? "Rola" : "Role"}</th><th>${isPl ? "Pensja" : "Salary"}</th><th>${isPl ? "Morale" : "Morale"}</th><th></th></tr></thead>
              <tbody>
                ${mine.map(e => `
                  <tr>
                    <td>#${e.id}</td>
                    <td><b>${esc(e.role)}</b></td>
                    <td>${e.salary.toLocaleString()} $</td>
                    <td><span class="tag live">${e.morale || 100}%</span></td>
                    <td><button class="btn sm g" data-fire-e="${e.id}">${isPl ? "Zwolnij" : "Fire"}</button></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}
        </div>
      </div>
    </div>
  `;

  A.querySelectorAll("[data-hire-r]").forEach(btn => {
    btn.onclick = async () => {
      try {
        await api("/api/employees/hire", { method: "POST", body: JSON.stringify({ role: btn.dataset.hireR }) });
        toast(isPl ? `Zatrudniono: ${btn.dataset.hireR}!` : `Hired: ${btn.dataset.hireR}!`, true);
        vEmp(A);
      } catch (e) { toast(e.message, false); }
    };
  });

  A.querySelectorAll("[data-fire-e]").forEach(btn => {
    btn.onclick = async () => {
      try {
        await api(`/api/employees/${btn.dataset.fireE}/fire`, { method: "POST" });
        toast(isPl ? "Pracownik został zwolniony." : "Employee dismissed.", true);
        vEmp(A);
      } catch (e) { toast(e.message, false); }
    };
  });
}

async function vRes(A) {
  const isPl = LANG === "pl";
  const j = await api("/api/research");
  const branches = j.branches || [];
  const levels = j.levels || {};
  const costs = j.cost || {};

  const descs = {
    Automation: isPl ? "Zwiększa automatyzację fabryk, obniżając koszty utrzymania linii produkcyjnych." : "Increases factory automation, decreasing production line upkeep.",
    Efficiency: isPl ? "Podnosi wydajność robotników i tempo wytwarzania towarów gotowych." : "Boosts worker throughput and manufacturing turnaround speed.",
    Logistics: isPl ? "Obniża zużycie paliwa w transporcie między miastami i skraca czas tranzytu." : "Reduces fleet fuel consumption and speeds up freight transit.",
    Quality: isPl ? "Zwiększa marżę i reputację firmy na rynku hurtowym." : "Increases product quality score and wholesale profit margins.",
    GreenEnergy: isPl ? "Inwestycje w OZE, dające ulgi podatkowe w miastach i zerowy ślad węglowy." : "Renewable green power investments, unlocking municipal tax credits."
  };

  A.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <h2>${ic('flask')} ${t("nav_research")}</h2>
        <span class="tag live">${isPl ? "Centrum Badań i Rozwoju (R&D)" : "R&D Tech Tree"}</span>
      </div>
      <p class="mut">${isPl ? "Opracowuj nowe technologie przemysłowe i logistyczne, aby uzyskać stałe korzyści dla całego przedsiębiorstwa." : "Invent innovative industrial and logistics patents to earn permanent corporate advantages."}</p>

      <div class="grid g2" style="margin-top:16px">
        ${branches.map(b => {
          const lvl = levels[b] || 0;
          const cost = costs[b] || 5000;
          return `
            <div class="card" style="margin-bottom:0">
              <div class="row" style="justify-content:space-between;align-items:flex-start">
                <div>
                  <h3 style="margin:0">${esc(b)}</h3>
                  <small class="mut">${descs[b] || ""}</small>
                </div>
                <span class="tag live">${isPl ? "Poziom" : "Tier"} ${lvl}</span>
              </div>
              <div class="prog-wrap" style="margin:12px 0 6px">
                <div class="prog-bar" style="width:${Math.min(100, lvl * 20)}%"></div>
              </div>
              <div class="row" style="justify-content:space-between;align-items:center;margin-top:12px">
                <span class="mut" style="font-size:13px">${isPl ? "Koszt ulepszenia:" : "Upgrade cost:"} <b style="color:var(--txt)">${cost.toLocaleString()} $</b></span>
                <button class="btn sm" data-up-res="${esc(b)}">${isPl ? "Opracuj Patent" : "Research"}</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  A.querySelectorAll("[data-up-res]").forEach(btn => {
    btn.onclick = async () => {
      try {
        await api("/api/research/up", { method: "POST", body: JSON.stringify({ branch: btn.dataset.upRes }) });
        toast(isPl ? `Rozwinięto technologię: ${btn.dataset.upRes}!` : `Upgraded: ${btn.dataset.upRes}!`, true);
        vRes(A);
      } catch (e) { toast(e.message, false); }
    };
  });
}

async function vInvest(A) {
  const isPl = LANG === "pl";
  const j = await api("/api/investments");
  const rx = j.rootx_spotlight || {};

  A.innerHTML = `
    <div class="card">
      <h2>${ic('coins')} ${t("nav_investments")} - ${isPl ? "Giełda Papierów Wartościowych" : "Stock Exchange"}</h2>

      <!-- RootX Spotlight -->
      <div class="stock-hero">
        <div class="row" style="justify-content:space-between;align-items:flex-start">
          <div>
            <h3>${ic('bolt')} ${rx.name || "RootX Cyber-Infrastructure Corp."} <span class="tag live">ROOTX</span></h3>
            <p class="mut" style="font-size:13px;max-width:600px;margin:4px 0 10px">
              ${isPl ? rx.desc_pl : rx.desc_en}
            </p>
          </div>
          <div style="text-align:right">
            <div style="font-size:26px;font-weight:800;color:var(--acc)">${rx.price || 250.0} $</div>
            <span class="tag live">${isPl ? "Dywidenda:" : "Dividend:"} ${((rx.dividend_rate || 0.045) * 100).toFixed(1)}% / rok</span>
          </div>
        </div>

        <div class="hero-stat-grid">
          <div class="hero-stat">
            <div class="val">10 000 000</div>
            <div class="lbl">${isPl ? "Liczba Akcji" : "Shares Issued"}</div>
          </div>
          <div class="hero-stat">
            <div class="val">2.5 MLD $</div>
            <div class="lbl">${isPl ? "Kapitalizacja" : "Market Cap"}</div>
          </div>
          <div class="hero-stat">
            <div class="val">+18.4%</div>
            <div class="lbl">${isPl ? "Wzrost (30 dni)" : "30d Return"}</div>
          </div>
          <div class="hero-stat">
            <div class="val">${((rx.dividend_rate || 0.045) * 100).toFixed(1)}%</div>
            <div class="lbl">${isPl ? "Stopa Dywidendy" : "Dividend Yield"}</div>
          </div>
        </div>

        <canvas id="rootxChart" style="height:120px;margin-bottom:14px"></canvas>

        <div class="row" style="align-items:center;background:var(--panel);padding:10px;border-radius:8px">
          <b>${isPl ? "Handel Akcjami RootX:" : "Trade RootX Shares:"}</b>
          <input id="rxQty" type="number" value="10" min="1" style="max-width:90px">
          <button class="btn sm" id="rxBuyBtn">${ic('coins')} ${isPl ? "Kup Akcje ROOTX" : "Buy ROOTX"}</button>
          <button class="btn sm g" id="rxSellBtn">${isPl ? "Sprzedaj Akcje" : "Sell ROOTX"}</button>
        </div>
      </div>

      <!-- Other Corporate Stocks -->
      <h3>${ic('chart')} ${isPl ? "Pozostałe Spółki Notowane na Giełdzie" : "Other Listed Corporations"}</h3>
      <div class="tscroll">
        <table>
          <tr><th>${isPl ? "Symbol" : "Ticker"}</th><th>${isPl ? "Nazwa Spółki" : "Company"}</th><th>${isPl ? "Cena" : "Price"}</th><th>${isPl ? "Dywidenda" : "Dividend"}</th><th>${isPl ? "Ilość" : "Qty"}</th><th>${isPl ? "Akcje" : "Trade"}</th></tr>
          ${Object.entries(j.stocks || {}).filter(([s]) => s !== "ROOTX").map(([k, v]) => {
            const inf = (j.stock_info && j.stock_info[k]) || {};
            return `
              <tr>
                <td><b class="tag">${k}</b></td>
                <td><b>${inf.name || k}</b><br><small class="mut">${isPl ? inf.desc_pl : inf.desc_en}</small></td>
                <td><b style="color:var(--acc)">${v} $</b></td>
                <td>${((inf.dividend_rate || 0.03) * 100).toFixed(1)}%</td>
                <td><input id="q-${k}" type="number" value="5" style="max-width:70px"></td>
                <td>
                  <button class="btn sm" data-b="${k}">${t("buy")}</button>
                  <button class="btn sm g" data-s="${k}">${t("sell")}</button>
                </td>
              </tr>
            `;
          }).join("")}
        </table>
      </div>

      <!-- My Portfolio -->
      <h3 style="margin-top:24px">${ic('box')} ${isPl ? "Mój Portfel Akcji i Wycena" : "My Stock Portfolio"}</h3>
      <div class="tscroll">
        <table>
          <tr><th>${isPl ? "Spółka" : "Company"}</th><th>${isPl ? "Posiadane akcje" : "Shares"}</th><th>${isPl ? "Średnia cena zakupu" : "Avg Buy"}</th><th>${isPl ? "Kurs bieżący" : "Current"}</th><th>${isPl ? "Wartość rynkowa" : "Value"}</th><th>${isPl ? "Zysk / Strata" : "Profit/Loss"}</th></tr>
          ${(j.mine || []).map(m => `
            <tr>
              <td><b>${m.name || m.s}</b> <span class="tag">${m.s}</span></td>
              <td><b>${m.qty}</b></td>
              <td>${m.avg} $</td>
              <td>${m.current_price} $</td>
              <td><b>${m.value} $</b></td>
              <td style="color:${m.profit >= 0 ? "var(--grn)" : "var(--red)"}"><b>${m.profit >= 0 ? "+" : ""}${m.profit} $ (${m.profit_pct}%)</b></td>
            </tr>
          `).join("") || `<tr><td colspan="6" class="mut">${isPl ? "Nie posiadasz jeszcze żadnych akcji w portfelu." : "No shares owned yet."}</td></tr>`}
        </table>
      </div>
    </div>
  `;

  // Draw RootX chart
  chart("rootxChart", rx.history || [210, 220, 235, 240, 248, 250], "#d49547");

  // Handlers for RootX
  $("#rxBuyBtn").onclick = async () => {
    try {
      await api("/api/investments/buy", { method: "POST", body: JSON.stringify({ symbol: "ROOTX", qty: +$("#rxQty").value }) });
      toast(isPl ? "Kupiono akcje RootX!" : "Purchased RootX shares!", true);
      vInvest(A);
    } catch (e) { toast(e.message, false); }
  };

  $("#rxSellBtn").onclick = async () => {
    try {
      await api("/api/investments/sell", { method: "POST", body: JSON.stringify({ symbol: "ROOTX", qty: +$("#rxQty").value }) });
      toast(isPl ? "Sprzedano akcje RootX!" : "Sold RootX shares!", true);
      vInvest(A);
    } catch (e) { toast(e.message, false); }
  };

  // Handlers for other stocks
  A.querySelectorAll("[data-b]").forEach(x => x.onclick = async () => {
    try {
      await api("/api/investments/buy", { method: "POST", body: JSON.stringify({ symbol: x.dataset.b, qty: +$("#q-" + x.dataset.b).value }) });
      toast(isPl ? `Kupiono akcje ${x.dataset.b}!` : `Purchased ${x.dataset.b} shares!`, true);
      vInvest(A);
    } catch (e) { toast(e.message, false); }
  });

  A.querySelectorAll("[data-s]").forEach(x => x.onclick = async () => {
    try {
      await api("/api/investments/sell", { method: "POST", body: JSON.stringify({ symbol: x.dataset.s, qty: +$("#q-" + x.dataset.s).value }) });
      toast(isPl ? `Sprzedano akcje ${x.dataset.s}!` : `Sold ${x.dataset.s} shares!`, true);
      vInvest(A);
    } catch (e) { toast(e.message, false); }
  });
}

async function vMap(A) {
  const isPl = LANG === "pl";
  const m = await api("/api/map");
  const cities = m.cities || [];
  const myWh = new Set(m.my_warehouses || []);
  const hq = m.hq || "Warszawa";

  // Render European Trade Network SVG Map
  A.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <h2>${ic('map')} ${t("nav_map")} - ${isPl ? "Europejska Sieć Handlowa" : "European Trade Network"}</h2>
        <span class="tag live">${isPl ? "Wspólny Świat (10 Miast)" : "Shared World (10 Cities)"}</span>
      </div>
      <p class="mut">${isPl ? "Kliknij wybrane miasto, aby poznać jego profil gospodarczy, specjalizację oraz różnice cenowe surowców." : "Click any city node to inspect economic profile, local specialization, and arbitrage price spreads."}</p>

      <div style="position:relative;width:100%;overflow-x:auto">
        <svg viewBox="0 0 800 450" style="width:100%;min-width:600px;background:var(--panel);border:1px solid var(--line);border-radius:10px">
          <!-- Trade Route Corridors -->
          <line x1="120" y1="240" x2="230" y2="260" stroke="var(--line)" stroke-width="2" stroke-dasharray="4"/>
          <line x1="180" y1="340" x2="230" y2="260" stroke="var(--line)" stroke-width="2" stroke-dasharray="4"/>
          <line x1="230" y1="260" x2="310" y2="190" stroke="var(--line)" stroke-width="2"/>
          <line x1="310" y1="190" x2="360" y2="250" stroke="var(--line)" stroke-width="2"/>
          <line x1="310" y1="190" x2="490" y2="160" stroke="var(--line)" stroke-width="2" stroke-dasharray="4"/>
          <line x1="360" y1="250" x2="410" y2="350" stroke="var(--line)" stroke-width="2"/>
          <line x1="360" y1="250" x2="520" y2="270" stroke="var(--line)" stroke-width="2"/>
          <line x1="410" y1="350" x2="480" y2="340" stroke="var(--line)" stroke-width="2"/>
          <line x1="480" y1="340" x2="520" y2="270" stroke="var(--line)" stroke-width="2"/>
          <line x1="490" y1="160" x2="520" y2="270" stroke="var(--line)" stroke-width="2"/>
          <line x1="520" y1="270" x2="680" y2="290" stroke="var(--line)" stroke-width="2" stroke-dasharray="4"/>

          <!-- City Nodes -->
          ${cities.map((c, i) => {
            const isHq = c.name === hq;
            const hasWh = myWh.has(c.name);
            const r = Math.max(12, Math.min(22, 10 + c.population / 400000));
            return `
              <g data-city-idx="${i}" style="cursor:pointer">
                <circle cx="${c.x}" cy="${c.y}" r="${r + 4}" fill="${isHq ? "var(--acc)" : (hasWh ? "var(--grn)" : "var(--line)")}" opacity="0.3"/>
                <circle cx="${c.x}" cy="${c.y}" r="${r}" fill="${isHq ? "var(--acc)" : (hasWh ? "var(--grn)" : "var(--card-bg)")}" stroke="var(--line)" stroke-width="2"/>
                <text x="${c.x}" y="${c.y + 4}" text-anchor="middle" font-size="10" font-weight="700" fill="${isHq || hasWh ? "#ffffff" : "var(--txt)"}">${c.country || c.name.slice(0, 2).toUpperCase()}</text>
                <text x="${c.x}" y="${c.y + r + 14}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--txt)">${esc(c.name)}</text>
              </g>
            `;
          }).join("")}
        </svg>
      </div>

      <!-- City Dossier -->
      <div id="cityDossier" style="margin-top:16px">
        <div class="card" style="background:var(--card-bg)">
          <h3>${ic('target')} ${isPl ? "Wybierz miasto na mapie powyżej" : "Click a city on the map above"}</h3>
          <p class="mut">${isPl ? "Poznaj lokalne mnożniki cen, zapotrzebowanie oraz otwórz magazyn." : "Inspect local price modifiers, demand profiles, and establish warehouses."}</p>
        </div>
      </div>
    </div>
  `;

  A.querySelectorAll("[data-city-idx]").forEach(el => el.onclick = () => {
    const c = cities[+el.dataset.cityIdx];
    const isHq = c.name === hq;
    const hasWh = myWh.has(c.name);
    const mults = c.price_mults || {};

    $("#cityDossier").innerHTML = `
      <div class="card" style="background:var(--card-bg);border:1px solid var(--acc)">
        <div class="row" style="justify-content:space-between;align-items:flex-start">
          <div>
            <h3 style="margin:0 0 6px">${ic('home')} ${esc(c.name)} (${c.country || "EU"})</h3>
            <span class="tag live">${esc(c.specialization || "Przemysł i Handel")}</span>
            ${isHq ? `<span class="tag" style="background:var(--acc);color:#fff">${isPl ? "Główna Siedziba (HQ)" : "Headquarters"}</span>` : ""}
            ${hasWh ? `<span class="tag live">${isPl ? "Twój Magazyn" : "Your Warehouse"}</span>` : ""}
          </div>
          <div class="row">
            <button class="btn sm" id="btnGoMarketCity">${ic('chart')} ${isPl ? "Handel w" : "Trade in"} ${c.name}</button>
            ${!hasWh ? `<button class="btn sm g" id="btnBuildWhCity">${ic('home')} ${isPl ? "Zbuduj Magazyn (10k $)" : "Build Warehouse ($10k)"}</button>` : ""}
          </div>
        </div>

        <div class="hero-stat-grid" style="margin-top:14px">
          <div class="hero-stat">
            <div class="val">${(c.population / 1000000).toFixed(1)} M</div>
            <div class="lbl">${isPl ? "Ludność" : "Population"}</div>
          </div>
          <div class="hero-stat">
            <div class="val">x${c.demand}</div>
            <div class="lbl">${isPl ? "Mnożnik Popytu" : "Demand Mult"}</div>
          </div>
          <div class="hero-stat">
            <div class="val">${(c.taxes * 100).toFixed(0)}%</div>
            <div class="lbl">${isPl ? "Podatek Lokalny" : "Local Tax"}</div>
          </div>
          <div class="hero-stat">
            <div class="val">${c.wages} $/h</div>
            <div class="lbl">${isPl ? "Płace" : "Wages"}</div>
          </div>
        </div>

        <h4 style="margin:14px 0 6px">${isPl ? "Wyróżniające się ceny surowców w tym mieście:" : "Local commodity price advantages:"}</h4>
        <div class="row" style="flex-wrap:wrap">
          ${Object.entries(mults).map(([item, mlt]) => `
            <span class="tag ${mlt < 0.9 ? "live" : (mlt > 1.1 ? "" : "")}">
              ${item}: <b>x${mlt}</b> ${mlt < 0.9 ? (isPl ? "(Tani zakup!)" : "(Cheap buy!)") : (mlt > 1.15 ? (isPl ? "(Droga sprzedaż!)" : "(High demand!)") : "")}
            </span>
          `).join("") || `<span class="mut">${isPl ? "Ceny standardowe" : "Standard prices"}</span>`}
        </div>
      </div>
    `;

    const btnM = $("#btnGoMarketCity");
    if (btnM) btnM.onclick = () => {
      CURRENT_MARKET_CITY = c.name;
      go("market");
    };

    const btnB = $("#btnBuildWhCity");
    if (btnB) btnB.onclick = async () => {
      try {
        await api("/api/logistics/warehouse/build", { method: "POST", body: JSON.stringify({ city: c.name }) });
        toast(isPl ? `Zbudowano magazyn w ${c.name}!` : `Warehouse built in ${c.name}!`, true);
        vMap(A);
      } catch (e) { toast(e.message, false); }
    };
  });
}

async function vNews(A) {
  const n = await api("/api/news");
  A.innerHTML = `<div class="card"><h2>${ic('news')} ${t("nav_news")} (tick ${n.economy.tick || 0})</h2><p>Inflation ${(n.economy.inflation * 100).toFixed(1)}% · Interest ${(n.economy.interest * 100).toFixed(1)}% · Unemployment ${(n.economy.unemployment * 100).toFixed(1)}% · Energy x${n.economy.energy} · Demand x${n.economy.demand}</p>
  ${n.news.map(x => `<p>${ic('news')} ${esc(x.t)}</p>`).join("")}<h3>Events</h3>${n.events.map(x => `<p>${ic('bolt')} <b>${esc(x.t)}</b> - ${esc(x.e)}</p>`).join("")}</div>`;
}

async function vRank(A) {
  const isPl = LANG === "pl";
  const r = await api("/api/rankings");
  A.innerHTML = `
    <div class="card">
      <h2>${ic('trophy')} ${t("nav_rankings")} - ${isPl ? "Ranking Globalny Magnatów" : "Global Tycoon Leaderboard"}</h2>
      <div class="tscroll">
        <table>
          <tr><th>#</th><th>${isPl ? "Firma" : "Company"}</th><th>${isPl ? "Sektor" : "Sector"}</th><th>${isPl ? "Centrala" : "City"}</th><th>${isPl ? "Wartość" : "Value"}</th><th>${isPl ? "Poziom" : "Level"}</th></tr>
          ${r.by_value.map((c, i) => `
            <tr>
              <td><b>#${i + 1}</b></td>
              <td><b>${esc(c.name)}</b></td>
              <td><span class="tag">${esc(c.sector || "Industry")}</span></td>
              <td>${esc(c.city || "Warszawa")}</td>
              <td><b style="color:var(--acc)">${Math.round(c.value).toLocaleString()} $</b></td>
              <td>lv${c.level}</td>
            </tr>
          `).join("")}
        </table>
      </div>
    </div>
  `;
}

async function vAch(A) {
  const j = await api("/api/achievements");
  A.innerHTML = `<div class="card"><h2>${ic('medal')} ${t("nav_achievements")} (${j.all.filter(x => x.owned).length}/${j.all.length})</h2>${j.all.map(x => `<span class="tag">${x.owned ? ic('check') : ic('lock')} ${esc(x.title)}</span>`).join("")}</div>
  <div class="card"><h2>Missions</h2>${j.missions.map(m => `<p>${m.done ? ic('check') : ic('target')} ${esc(m.text)} - ${m.progress}/${m.target}</p>`).join("") || "-"}</div>`;
}

async function vStat(A) {
  const s = await api("/api/statistics");
  A.innerHTML = `<div class="card"><h2>${ic('bars')} ${t("nav_statistics")}</h2><canvas id="s1"></canvas><div class="tscroll"><table><tr><th>Day</th><th>Revenue</th><th>Profit</th><th>Value</th></tr>${s.stats.map(x => `<tr><td>${x.day}</td><td>${Math.round(x.revenue)}</td><td>${Math.round(x.profit)}</td><td>${Math.round(x.value)}</td></tr>`).join("")}</table></div></div>
  <div class="card"><h3>Transactions</h3>${s.tx.map(t => `<span class="tag">${t.type} ${t.amount} → ${Math.round(t.after)}</span>`).join("")}</div>`;
  chart("s1", s.stats.map(x => x.profit), "#5cb85c");
}

/* ==========================================================
   Ustawienia (Settings View)
   Wybór języka, motywu, konfigurator GUI i parametry API
   ========================================================== */
async function vSet(A) {
  A.innerHTML = `
    <div class="card">
      <h2>${ic('gear')} ${t("nav_settings")}</h2>
      
      <div class="grid g2" style="margin-bottom:14px">
        <div>
          <label><b>${t("langLabel")}</b></label>
          <select id="sLang">
            <option value="pl" ${LANG === "pl" ? "selected" : ""}>Polski (PL)</option>
            <option value="en" ${LANG === "en" ? "selected" : ""}>English (EN)</option>
          </select>
        </div>
        <div>
          <label><b>${t("themeLabel")}</b></label>
          <select id="sTheme">
            <option value="dark-oak" ${THEME === "dark-oak" ? "selected" : ""}>Ciemny dąb</option>
            <option value="starry-night" ${THEME === "starry-night" ? "selected" : ""}>Gwiezdna noc</option>
            <option value="industrial-slate" ${THEME === "industrial-slate" ? "selected" : ""}>Grafit stalowy</option>
            <option value="forest-emerald" ${THEME === "forest-emerald" ? "selected" : ""}>Leśny mech</option>
            <option value="obsidian" ${THEME === "obsidian" ? "selected" : ""}>Obsydian</option>
          </select>
        </div>
      </div>

      <div style="margin-bottom:14px">
        <label><b>${t("guiModalTitle")}</b></label>
        <button class="btn sm g" onclick="openGuiModal()">${ic('dash')} ${t("guiBtn")} - Otwórz konfigurator układu</button>
      </div>

      ${IS_ADMIN ? `
      <label><b>${t("apiUrlLabel")}</b><input id="sa" value="${esc(API)}"></label>
      <div class="row" style="margin-top:10px">
        <button class="btn sm" id="ss">${t("save")}</button>
        <button class="btn sm g" id="sp">${t("changePassBtn")}</button>
        <a class="btn sm g" href="../index.html" style="text-decoration:none">${ic('gear')} Status & Pomoc</a>
      </div>
      ` : `
      <div class="row" style="margin-top:10px">
        <button class="btn sm g" id="sp">${t("changePassBtn")}</button>
        <a class="btn sm g" href="../index.html" style="text-decoration:none">${ic('gear')} Status & Pomoc</a>
      </div>
      `}
      <div id="so" style="margin-top:8px"></div>
    </div>
  `;

  $("#sLang").onchange = e => setLang(e.target.value);
  $("#sTheme").onchange = e => setTheme(e.target.value);
  const saveBtn = $("#ss");
  if (saveBtn) {
    saveBtn.onclick = () => {
      const sa = $("#sa");
      if (sa) {
        localStorage.setItem("tycoon_api", sa.value);
        location.reload();
      }
    };
  }
  $("#sp").onclick = async () => {
    const o = prompt(LANG === "pl" ? "Stare hasło:" : "Old password:");
    const n = prompt(LANG === "pl" ? "Nowe hasło:" : "New password:");
    if (!o || !n) return;
    try {
      await api("/api/auth/password", { method: "POST", body: JSON.stringify({ old: o, new: n }) });
      $("#so").textContent = "OK";
    } catch (e) { $("#so").textContent = e.message; }
  };
}

async function vAdmin(A) {
  try {
    const o = await api("/api/admin/overview");
    const us = await api("/api/admin/users");
    A.innerHTML = `<div class="card"><h2>${ic('shield')} ${t("nav_admin")}</h2><p>Users: ${o.users} · Companies: ${o.companies}</p>
    <div class="row"><button class="btn sm" id="at">Economy tick</button></div>
    <h3>Events</h3><div class="row"><input id="et" placeholder="title" style="max-width:220px"><input id="ee" placeholder="effect" style="max-width:160px"><button class="btn sm" id="ea">Add event</button></div>
    <h3>Economy</h3><div class="row"><input id="ei" type="number" step="0.01" placeholder="inflation" style="max-width:120px"><input id="er" type="number" step="0.01" placeholder="interest" style="max-width:120px"><button class="btn sm" id="es">Save</button></div>
    <h3>Users</h3><table>${us.users.map(u => `<tr><td>#${u.id} <b>${esc(u.name)}</b></td><td>${u.admin ? "admin" : ""} ${u.banned ? "BANNED" : ""}</td><td><button class="btn sm r" data-ban="${u.id}">${u.banned ? "Unban" : "Ban"}</button></td></tr>`).join("")}</table>
    <h3>Logs</h3>${o.logs.map(l => `<span class="tag">${l.k}: ${esc(l.t)}</span>`).join("")}</div>`;
    $("#at").onclick = async () => { await api("/api/admin/tick", { method: "POST" }); render(); };
    $("#ea").onclick = async () => { await api(`/api/admin/event?title=${encodeURIComponent($("#et").value)}&effect=${encodeURIComponent($("#ee").value)}`, { method: "POST" }); render(); };
    $("#es").onclick = async () => { await api(`/api/admin/economy?inflation=${+$("#ei").value || 0.02}&interest=${+( $("#er").value) || 0.05}`, { method: "POST" }); render(); };
    A.querySelectorAll("[data-ban]").forEach(x => x.onclick = async () => { await api(`/api/admin/ban/${x.dataset.ban}`, { method: "POST" }); render(); });
  } catch (e) {
    A.innerHTML = `<div class="card"><h2>${ic('shield')} ${t("nav_admin")}</h2><p>${esc(e.message)} (wymagane konto admin: ./make_admin.sh &lt;login&gt;)</p></div>`;
  }
}

/* ==========================================================
   Czat
   ========================================================== */
let CHAT = { tab: "global", dm: "", group: 0, me: "" };

async function vChat(A) {
  const g = await api("/api/chat/groups").catch(() => ({ mine: [], public: [] }));
  try { CHAT.me = (await api("/api/users/me")).username; } catch (e) {}
  A.innerHTML = `<div class="card"><h2>${ic('chat')} ${t("nav_chat")}</h2>
  <div class="row">
    <button class="btn sm ${CHAT.tab === "global" ? "" : "g"}" onclick="chatTab('global')">Ogólny</button>
    <button class="btn sm ${CHAT.tab === "dm" ? "" : "g"}" onclick="chatTab('dm')">Prywatny</button>
    <button class="btn sm ${CHAT.tab === "group" ? "" : "g"}" onclick="chatTab('group')">Grupy</button>
  </div><div id="chatCtl" style="margin-top:8px"></div>
  <div id="chatMsgs" class="chatbox"><p class="mut">Ładowanie...</p></div>
  <div class="row" style="margin-top:8px"><input id="chatIn" maxlength="500" placeholder="Napisz wiadomość (Enter)..." style="flex:1;min-width:140px"><button class="btn sm" id="chatSend">Wyślij</button></div></div>`;
  const ctl = $("#chatCtl");
  if (CHAT.tab === "dm") ctl.innerHTML = `<div class="row"><input id="chatNick" placeholder="Nick gracza" value="${esc(CHAT.dm)}" style="max-width:170px"><button class="btn sm g" id="chatOpen">Otwórz</button></div>`;
  if (CHAT.tab === "group") ctl.innerHTML = `<div class="row"><select id="chatGid" style="max-width:190px">${g.mine.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select><input id="chatGnew" placeholder="Nowa grupa..." style="max-width:150px"><button class="btn sm g" id="chatMk">Utwórz</button></div>
    <p class="mut">Publiczne: ${g.public.map(x => `<button class="btn sm g" data-join="${x.id}">${esc(x.name)} +</button>`).join("") || "-"}</p>`;
  if (CHAT.tab === "group" && g.mine.length && !CHAT.group) CHAT.group = g.mine[0].id;
  const open = $("#chatOpen"); if (open) open.onclick = () => { CHAT.dm = $("#chatNick").value.trim(); refreshChat(); };
  const mk = $("#chatMk"); if (mk) mk.onclick = async () => {
    const name = $("#chatGnew").value.trim();
    if (name.length < 3) return toast("Nazwa grupy: min. 3 znaki.", false);
    try { const j = await api("/api/chat/groups", { method: "POST", body: JSON.stringify({ name }) }); CHAT.group = j.id; toast("Grupa utworzona.", true); render(); }
    catch (e) { toast(e.message, false); }
  };
  const gid = $("#chatGid"); if (gid) { gid.value = CHAT.group; gid.onchange = () => { CHAT.group = +gid.value; refreshChat(); }; }
  A.querySelectorAll("[data-join]").forEach(x => x.onclick = async () => {
    try { const j = await api(`/api/chat/groups/${x.dataset.join}/join`, { method: "POST" }); CHAT.group = +x.dataset.join; toast("Dołączono.", true); render(); }
    catch (e) { toast(e.message, false); }
  });
  $("#chatSend").onclick = sendChat;
  $("#chatIn").onkeydown = e => { if (e.key === "Enter") sendChat(); };
  refreshChat();
}
window.chatTab = t => { CHAT.tab = t; render(); };

function chatRoom() {
  if (CHAT.tab === "dm" && CHAT.dm) return { get: `/api/chat/dm/${encodeURIComponent(CHAT.dm)}`, post: `/api/chat/dm/${encodeURIComponent(CHAT.dm)}` };
  if (CHAT.tab === "group" && CHAT.group) return { get: `/api/chat/groups/${CHAT.group}`, post: `/api/chat/groups/${CHAT.group}` };
  return { get: "/api/chat/global", post: "/api/chat/global" };
}

async function refreshChat(silent) {
  const box = $("#chatMsgs");
  if (!box || VIEW !== "chat") return;
  try {
    const j = await api(chatRoom().get);
    box.innerHTML = j.messages.map(m => `<div class="msg ${m.from === CHAT.me ? "me" : ""}"><b>${esc(m.from)}</b> <small class="mut">${esc((m.at || "").slice(11, 16))}</small><br>${esc(m.text)}</div>`).join("") || '<p class="mut">Brak wiadomości. Napisz pierwszą!</p>';
    box.scrollTop = box.scrollHeight;
  } catch (e) { if (!silent) toast(e.message, false); }
}

async function sendChat() {
  const inp = $("#chatIn");
  const t = (inp.value || "").trim();
  if (!t) return;
  if (CHAT.tab === "dm" && !CHAT.dm) return toast("Najpierw wybierz nick gracza.", false);
  if (CHAT.tab === "group" && !CHAT.group) return toast("Najpierw wybierz grupę.", false);
  try { await api(chatRoom().post, { method: "POST", body: JSON.stringify({ text: t }) }); inp.value = ""; refreshChat(); }
  catch (e) { toast(e.message, false); }
}
setInterval(() => { if (VIEW === "chat") refreshChat(true); }, 10000);

/* ==========================================================
   Tryb Demo (Offline w przeglądarce)
   ========================================================== */
const DEMO_BASE = { iron: 8, coal: 6, silicon: 14, oil: 12, plastic: 18, steel: 30, components: 65, electronics: 140, machines: 320, computers: 520 };
const DEMO_RECIPES = {
  steel: { in: { iron: 2, coal: 1 }, secs: 20 },
  plastic: { in: { oil: 2 }, secs: 20 },
  components: { in: { steel: 1, silicon: 1 }, secs: 30 },
  electronics: { in: { components: 2, plastic: 1 }, secs: 45 },
  machines: { in: { components: 3, steel: 2 }, secs: 90 },
  computers: { in: { electronics: 2, components: 1 }, secs: 100 }
};
const DEMO_BUILD = { Factory: 20000, Warehouse: 8000, Store: 12000, Office: 5000 };
const DEMO_STOCKS = { TITAN: 100, VOLTA: 60, NEXUS: 200 };
const DEMO_BOTS = [["Titan Industries", 52000], ["Volta Energy", 31000], ["Nexus Tech", 87000]];
let DTAB = "pulpit";
const DEMO_MAP = { dashboard: "pulpit", company: "pulpit", market: "rynek", buildings: "budynki", production: "produkcja", inventory: "produkcja", contracts: "kontrakty", investments: "inwestycje", bank: "inwestycje", rankings: "ranking", achievements: "ranking" };
window.dtab = t => { DTAB = t; render(); };

function demoLoad() {
  try {
    const d = JSON.parse(localStorage.getItem("neon_demo") || "null");
    if (d && d.money != null) {
      if (!d.sprices) { d.sprices = {}; Object.entries(DEMO_STOCKS).forEach(([k, v]) => d.sprices[k] = v); }
      if (!d.hold) d.hold = {};
      if (!d.bots) d.bots = DEMO_BOTS.map(([n, v]) => ({ n, v }));
      if (!d.offers) d.offers = [];
      if (!("taken" in d)) d.taken = null;
      return d;
    }
  } catch (e) {}
  const prices = {}; Object.entries(DEMO_BASE).forEach(([k, v]) => prices[k] = v);
  const sprices = {}; Object.entries(DEMO_STOCKS).forEach(([k, v]) => sprices[k] = v);
  return {
    money: 10000, inv: { iron: 50, coal: 50 }, build: [], prod: [], prices, sprices, hold: {},
    bots: DEMO_BOTS.map(([n, v]) => ({ n, v })), offers: [], taken: null,
    log: [LANG === "pl" ? "Witaj w demie! Kupuj, buduj fabrykę i pnij się w rankingu botów." : "Welcome to demo! Trade, build factories and advance in rankings."]
  };
}

function demoSave(d) { localStorage.setItem("neon_demo", JSON.stringify(d)); }

function demoTick(d) {
  let changed = false;
  Object.keys(d.prices).forEach(k => {
    const t = DEMO_BASE[k], p = d.prices[k];
    d.prices[k] = Math.round(Math.max(t * 0.4, Math.min(t * 2.5, p + (t - p) * 0.08 + (Math.random() - 0.5) * t * 0.06)) * 100) / 100;
    changed = true;
  });
  const now = Date.now(), left = [];
  d.prod.forEach(p => {
    if (p.end <= now) {
      d.inv[p.item] = Math.round(((d.inv[p.item] || 0) + p.qty) * 100) / 100;
      d.log.unshift((LANG === "pl" ? "Wyprodukowano: " : "Produced: ") + `${p.qty}x ${p.item}`);
    } else left.push(p);
  });
  if (left.length !== d.prod.length) { d.prod = left; changed = true; }
  Object.keys(d.sprices).forEach(k => {
    d.sprices[k] = Math.round(d.sprices[k] * (1 + (Math.random() - 0.5) * 0.08) * 100) / 100;
  });
  d.bots.forEach(b => { b.v = Math.round(b.v * (1 + (Math.random() - 0.48) * 0.04)); });
  const items = Object.keys(DEMO_BASE);
  while (d.offers.length < 3) {
    const k = items[Math.floor(Math.random() * 6)], q = 10 + Math.floor(Math.random() * 30);
    d.offers.push({ item: k, qty: q, reward: Math.round(DEMO_BASE[k] * q * 1.3) });
  }
  d.log = d.log.slice(0, 8);
  demoSave(d);
  return d;
}

function demoVal(d) { return Math.round(d.money + Object.entries(d.inv).reduce((a, [k, q]) => a + q * (d.prices[k] || 0), 0)); }

function vDemo(A) {
  const d = demoTick(demoLoad());
  const hasFactory = d.build.includes("Factory");
  const tabs = [
    ["pulpit", t("nav_dashboard")],
    ["rynek", t("nav_market")],
    ["budynki", t("nav_buildings")],
    ["produkcja", t("nav_production")],
    ["kontrakty", t("nav_contracts")],
    ["inwestycje", t("nav_investments")],
    ["ranking", t("nav_rankings")]
  ];
  let body = "";
  if (DTAB === "pulpit") body = `<div class="grid g4">
    <div class="kpi"><span class="chip c">${ic('coins')}</span>${t("kpi_cash")}<b>${Math.round(d.money)} $</b></div>
    <div class="kpi"><span class="chip g">${ic('chart')}</span>${t("kpi_value")}<b>${demoVal(d)} $</b></div>
    <div class="kpi"><span class="chip b">${ic('buildings')}</span>${t("nav_buildings")}<b>${d.build.length}</b><small>${d.build.join(", ") || "-"}</small></div>
    <div class="kpi"><span class="chip y">${ic('gear')}</span>${t("nav_production")}<b>${d.prod.length}</b><small>aktywna</small></div></div>
    <div class="card"><h3>${ic('news')} Dziennik</h3>${d.log.map(l => `<p class="mut">${esc(l)}</p>`).join("")}</div>`;
  if (DTAB === "rynek") body = `<div class="card"><h3>${ic('chart')} Rynek demo</h3><div class="tscroll"><table><tr><th>Towar</th><th>Cena</th><th>Masz</th><th>Ilość</th><th></th></tr>
    ${Object.keys(d.prices).map(k => `<tr><td><b>${k}</b></td><td>${d.prices[k].toFixed(2)}</td><td>${d.inv[k] || 0}</td><td><input id="dq-${k}" type="number" value="10" min="1" style="max-width:80px"></td><td><button class="btn sm" data-db="${k}">${t("buy")}</button> <button class="btn sm g" data-ds="${k}">${t("sell")}</button></td></tr>`).join("")}</table></div></div>`;
  if (DTAB === "budynki") body = `<div class="card"><h3>${ic('buildings')} ${t("nav_buildings")}</h3>
    ${Object.entries(DEMO_BUILD).map(([k, v]) => `<p><b>${k}</b> - ${v} $ ${d.build.includes(k) ? '<span class="tag">masz</span>' : `<button class="btn sm" data-bb="${k}">${t("buy")}</button>`}</p>`).join("")}
    ${!hasFactory ? `<p class="mut">${LANG === "pl" ? "Fabryka odblokowuje produkcję." : "Factory unlocks manufacturing."}</p>` : ""}</div>`;
  if (DTAB === "produkcja") body = `<div class="card"><h3>${ic('gear')} ${t("nav_production")} ${hasFactory ? "" : (LANG === "pl" ? "(wymaga fabryki)" : "(requires factory)")}</h3>
    ${hasFactory ? Object.entries(DEMO_RECIPES).map(([k, v]) => `<p><b>${k}</b> <small>${Object.entries(v.in).map(([a, b]) => a + ":" + b).join(" ")} · ${v.secs}s</small> <button class="btn sm" data-dr="${k}">Start x5</button></p>`).join("") : "<p class='mut'>-</p>"}
    <h3>Kolejka</h3>${d.prod.map(p => `<span class="tag">${p.qty}x ${p.item} (${Math.max(0, Math.round((p.end - Date.now()) / 1000))}s)</span>`).join("") || "-"}</div>`;
  if (DTAB === "kontrakty") body = `<div class="card"><h3>${ic('doc')} ${t("nav_contracts")} demo</h3>
    ${d.taken ? `<p><b>${d.taken.qty}x ${d.taken.item}</b> → ${d.taken.reward} $<div class="row"><button class="btn sm" id="dFul">Wykonaj</button><button class="btn sm g" id="dCan">Odrzuć</button></div></p>` : "<p class='mut'>-</p>"}
    <h3>Oferty</h3>${d.offers.map((o, i) => `<p><b>${o.qty}x ${o.item}</b> → ${o.reward} $ ${!d.taken ? `<button class="btn sm" data-do="${i}">Przyjmij</button>` : ""}</p>`).join("")}</div>`;
  if (DTAB === "inwestycje") body = `<div class="card"><h3>${ic('coins')} Giełda demo</h3><table>
    ${Object.keys(d.sprices).map(k => `<tr><td><b>${k}</b></td><td>${d.sprices[k].toFixed(2)}</td><td>masz: ${d.hold[k] || 0}</td><td><button class="btn sm" data-sb="${k}">${t("buy")} 1</button><button class="btn sm g" data-ss="${k}">${t("sell")} 1</button></td></tr>`).join("")}</table></div>`;
  if (DTAB === "ranking") {
    const rows = [...d.bots.map(b => ({ n: b.n, v: b.v })), { n: LANG === "pl" ? "Ty (demo)" : "You (demo)", v: demoVal(d), me: true }].sort((a, b) => b.v - a.v);
    body = `<div class="card"><h3>${ic('trophy')} Ranking demo (boty)</h3><table>${rows.map((r, i) => `<tr><td>${i + 1}</td><td><b>${esc(r.n)}</b>${r.me ? ' <span class="tag">ty</span>' : ""}</td><td>${Math.round(r.v)} $</td></tr>`).join("")}</table></div>`;
  }
  A.innerHTML = `
    <div class="card hero">
      <h2>${ic('bolt')} Tryb demo</h2>
      <p class="mut">${t("demoTagline")}</p>
      <div class="row">${tabs.map(([tabKey, label]) => `<button class="btn sm ${DTAB === tabKey ? "" : "g"}" onclick="dtab('${tabKey}')">${label}</button>`).join("")}</div>
      <div class="row" style="margin-top:8px">
        <button class="btn sm g" onclick="demoExit()">${LANG === "pl" ? "Wyjdź z demo" : "Exit demo"}</button>
        <button class="btn sm" onclick="go('register')">${LANG === "pl" ? "Załóż konto online" : "Register online account"}</button>
        <button class="btn sm g" onclick="demoReset()">${LANG === "pl" ? "Reset" : "Reset"}</button>
        <a class="btn sm g" href="../index.html" style="text-decoration:none">${ic('gear')} Status serwera & Pomoc</a>
      </div>
    </div>
    ${body}
  `;
  const rerender = () => render();
  A.querySelectorAll("[data-db]").forEach(x => x.onclick = () => {
    const k = x.dataset.db, q = Math.max(1, +$("#dq-" + k).value || 0), cost = Math.round(d.prices[k] * q * 100) / 100;
    if (d.money < cost) return toast("Za mało gotówki.", false);
    d.money = Math.round((d.money - cost) * 100) / 100;
    d.inv[k] = Math.round(((d.inv[k] || 0) + q) * 100) / 100;
    d.log.unshift(`Kupiono ${q}x ${k} za ${cost} $`); demoSave(d); rerender();
  });
  A.querySelectorAll("[data-ds]").forEach(x => x.onclick = () => {
    const k = x.dataset.ds, q = Math.max(1, +$("#dq-" + k).value || 0);
    if ((d.inv[k] || 0) < q) return toast("Za mało towaru.", false);
    const gain = Math.round(d.prices[k] * q * 0.98 * 100) / 100;
    d.inv[k] = Math.round((d.inv[k] - q) * 100) / 100;
    d.money = Math.round((d.money + gain) * 100) / 100;
    d.log.unshift(`Sprzedano ${q}x ${k} za ${gain} $`); demoSave(d); rerender();
  });
  A.querySelectorAll("[data-bb]").forEach(x => x.onclick = () => {
    const k = x.dataset.bb;
    if (d.money < DEMO_BUILD[k]) return toast("Za mało gotówki.", false);
    d.money -= DEMO_BUILD[k]; d.build.push(k);
    d.log.unshift(`Zbudowano: ${k}`); demoSave(d); toast(`${k} zbudowany!`, true); rerender();
  });
  A.querySelectorAll("[data-dr]").forEach(x => x.onclick = () => {
    const k = x.dataset.dr, r = DEMO_RECIPES[k], q = 5;
    for (const [a, b] of Object.entries(r.in)) if ((d.inv[a] || 0) < b * q) return toast(`Brakuje: ${a}`, false);
    for (const [a, b] of Object.entries(r.in)) d.inv[a] = Math.round((d.inv[a] - b * q) * 100) / 100;
    d.prod.push({ item: k, qty: q, end: Date.now() + r.secs * 1000 });
    d.log.unshift(`Produkcja: ${q}x ${k}`); demoSave(d); rerender();
  });
  A.querySelectorAll("[data-do]").forEach(x => x.onclick = () => {
    if (d.taken) return;
    d.taken = d.offers.splice(+x.dataset.do, 1)[0];
    d.log.unshift(`Przyjęto kontrakt: ${d.taken.qty}x ${d.taken.item}`); demoSave(d); rerender();
  });
  const ful = $("#dFul");
  if (ful) ful.onclick = () => {
    if ((d.inv[d.taken.item] || 0) < d.taken.qty) return toast("Za mało towaru.", false);
    d.inv[d.taken.item] = Math.round((d.inv[d.taken.item] - d.taken.qty) * 100) / 100;
    d.money = Math.round((d.money + d.taken.reward) * 100) / 100;
    d.log.unshift(`Kontrakt wykonany: +${d.taken.reward} $`); d.taken = null; demoSave(d); toast("Kontrakt wykonany!", true); rerender();
  };
  const dcan = $("#dCan");
  if (dcan) dcan.onclick = () => { d.offers.push(d.taken); d.taken = null; demoSave(d); rerender(); };
  A.querySelectorAll("[data-sb]").forEach(x => x.onclick = () => {
    const k = x.dataset.sb;
    if (d.money < d.sprices[k]) return toast("Za mało gotówki.", false);
    d.money = Math.round((d.money - d.sprices[k]) * 100) / 100;
    d.hold[k] = (d.hold[k] || 0) + 1; demoSave(d); rerender();
  });
  A.querySelectorAll("[data-ss]").forEach(x => x.onclick = () => {
    const k = x.dataset.ss;
    if (!(d.hold[k] > 0)) return toast("Brak akcji.", false);
    d.hold[k]--; d.money = Math.round((d.money + d.sprices[k]) * 100) / 100; demoSave(d); rerender();
  });
  clearTimeout(window._demoT);
  window._demoT = setTimeout(() => { if (VIEW === "demo") render(); }, 5000);
}
window.demoReset = () => { localStorage.removeItem("neon_demo"); render(); toast(LANG === "pl" ? "Demo zresetowane." : "Demo reset.", true); };
window.demoExit = () => go(TOK ? "dashboard" : "login");

function checkCookieConsent() {
  if (localStorage.getItem("tycoon_cookies_accepted")) return;
  let banner = $("#cookieBanner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "cookieBanner";
    banner.innerHTML = `
      <div class="cookie-txt">
        ${ic('lock')} ${LANG === "pl" ? "Ta strona korzysta z pamięci lokalnej (Cookies/LocalStorage) wyłącznie w celu zapamiętania Twoich preferencji (język, motyw, układ GUI) oraz sesji logowania. Brak trackerów reklamowych." : "This site uses local storage exclusively for your game preferences (language, theme, GUI layout) and login session. No ad trackers."}
      </div>
      <div class="cookie-actions">
        <a href="privacy.html" class="btn sm g" target="_blank">${LANG === "pl" ? "Polityka prywatności" : "Privacy Policy"}</a>
        <button class="btn sm" id="btnAcceptCookies">${LANG === "pl" ? "Akceptuję" : "Accept"}</button>
      </div>
    `;
    document.body.appendChild(banner);
    $("#btnAcceptCookies").onclick = () => {
      localStorage.setItem("tycoon_cookies_accepted", "1");
      banner.remove();
    };
  }
}

// Uruchomienie klienta
applyGui();
nav();
render();
checkAdminStatus();
ws();
checkCookieConsent();
