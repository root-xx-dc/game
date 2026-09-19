#!/usr/bin/env python3
"""Generator plików ikon z jednego źródła. Uruchom po edycji ICONS:
   python3 tools/make_icons.py
Tworzy: frontend/assets/icons/<nazwa>.svg + frontend/assets/icons.svg (sprite)."""
import os
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "frontend", "assets", "icons")
ICONS = {
"dash": '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
"factory": '<path d="M2 21h20"/><path d="M4 21V9l5 3.5V9l5 3.5V5h6v16"/>',
"buildings": '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
"gear": '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>',
"box": '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
"chart": '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
"truck": '<path d="M1 8h13v8H1zM14 11h4l4 4v1h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
"doc": '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h7M9 17h7"/>',
"coins": '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
"bank": '<path d="M3 9l9-6 9 6M4 9v10M20 9v10M8 12v5M12 12v5M16 12v5M2 21h20"/>',
"users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.9.3 5.5 2.4 5.5 5.8"/>',
"flask": '<path d="M9 3h6M10 3v6l-6 9a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 20 18l-6-9V3"/><path d="M7.5 15h9"/>',
"map": '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
"news": '<path d="M4 5h13v14H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/><path d="M8 9h7M8 13h5"/>',
"trophy": '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5H4a3 3 0 0 0 3 5M16 5h4a3 3 0 0 1-3 5M12 13v4M8 21h8M10 17h4"/>',
"medal": '<circle cx="12" cy="9" r="5"/><path d="M9 13.5L7 21l5-2.5L17 21l-2-7.5"/>',
"bars": '<path d="M5 20v-6M11 20V6M17 20v-9"/><path d="M3 20h18"/>',
"shield": '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
"check": '<path d="M4 12l5 5L20 6"/>',
"lock": '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
"target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
"moon": '<path d="M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z"/>',
"bolt": '<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
"home": '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
"chat": '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1L3 20l1.2-4.3A8.5 8.5 0 1 1 21 11.5z"/>',
}
os.makedirs(OUT, exist_ok=True)
for name, inner in ICONS.items():
    with open(os.path.join(OUT, name + ".svg"), "w") as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#38e1ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><title>{name}</title>{inner}</svg>\n')
with open(os.path.join(BASE, "frontend", "assets", "icons.svg"), "w") as f:
    f.write('<svg xmlns="http://www.w3.org/2000/svg">\n')
    for name, inner in ICONS.items():
        f.write(f'<symbol id="i-{name}" viewBox="0 0 24 24">{inner}</symbol>\n')
    f.write('</svg>\n')
# weryfikacja zgodności z blokiem inline w app.js
app = open(os.path.join(BASE, "frontend", "js", "app.js"), encoding="utf-8").read()
missing = [n for n in ICONS if n + ":" not in app and n + ": '" not in app]
print(f"ikon: {len(ICONS)}, brak w app.js: {missing or 'brak'}")
