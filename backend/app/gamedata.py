"""Katalogi gry: towary, receptury, budynki, pojazdy, tech, miasta, rynki regionalne, RootX i branże."""

# Podstawowe towary i surowce
ITEMS = {  # item_id: base_price
    "iron": 8, "coal": 6, "silicon": 14, "oil": 12, "plastic": 18,
    "steel": 30, "components": 65, "electronics": 140, "machines": 320, "computers": 520,
}

# Receptury przetwórcze
RECIPES = {  # output: {inputs, time_sec_per_unit, building}
    "steel": {"in": {"iron": 2, "coal": 1}, "time": 6, "building": "Factory"},
    "plastic": {"in": {"oil": 2}, "time": 6, "building": "Factory"},
    "components": {"in": {"steel": 1, "silicon": 1}, "time": 10, "building": "Factory"},
    "electronics": {"in": {"components": 2, "plastic": 1}, "time": 16, "building": "Factory"},
    "machines": {"in": {"components": 3, "steel": 2}, "time": 30, "building": "Industrial Complex"},
    "computers": {"in": {"electronics": 2, "components": 1}, "time": 36, "building": "Factory"},
}

# Budynki przemysłowe i komercyjne
BUILDINGS = {
    "Office": {"price": 5000, "upkeep_h": 20, "bonus": 0.02, "req": 1, "cap": 1000},
    "Factory": {"price": 20000, "upkeep_h": 80, "bonus": 0.10, "req": 1, "cap": 2500},
    "Warehouse": {"price": 8000, "upkeep_h": 25, "bonus": 0.0, "req": 1, "cap": 5000},
    "Store": {"price": 12000, "upkeep_h": 40, "bonus": 0.05, "req": 1, "cap": 1500},
    "Research Center": {"price": 30000, "upkeep_h": 120, "bonus": 0.08, "req": 2, "cap": 1000},
    "Logistics Center": {"price": 25000, "upkeep_h": 90, "bonus": 0.06, "req": 2, "cap": 8000},
    "Headquarters": {"price": 80000, "upkeep_h": 250, "bonus": 0.15, "req": 5, "cap": 3000},
    "Energy Plant": {"price": 45000, "upkeep_h": 150, "bonus": 0.07, "req": 3, "cap": 1000},
    "Shopping Center": {"price": 60000, "upkeep_h": 200, "bonus": 0.12, "req": 3, "cap": 4000},
    "Industrial Complex": {"price": 100000, "upkeep_h": 350, "bonus": 0.20, "req": 4, "cap": 12000},
}

# Pojazdy transportowe i logistyka
VEHICLES = {
    "Truck": {"name": "Ciężarówka Scania R500", "cap": 250, "speed_kmh": 90, "base_cost": 40, "cost_km": 0.12},
    "Train": {"name": "Pociąg Towarowy Cargo", "cap": 1500, "speed_kmh": 120, "base_cost": 180, "cost_km": 0.05},
    "Ship": {"name": "Kontenerowiec Bałtycki", "cap": 6000, "speed_kmh": 45, "base_cost": 500, "cost_km": 0.02},
    "Aircraft": {"name": "Samolot Cargo Boeing 737", "cap": 600, "speed_kmh": 650, "base_cost": 450, "cost_km": 0.35},
}

# Stanowiska pracownicze
ROLES = {
    "Worker": 100, "Engineer": 250, "Programmer": 400, "Accountant": 300,
    "Manager": 500, "Researcher": 450, "Executive": 900
}

BRANCHES = ["Production", "Logistics", "Finance", "Automation", "AI", "Energy", "Research", "Marketing"]

COMPANY_LOGOS = ["factory", "buildings", "bank", "coins", "chart", "trophy", "shield", "bolt"]

# Sektory / Branże gospodarcze
SECTORS = {
    "Mining": {
        "name_pl": "Górnictwo i Wydobycie",
        "name_en": "Mining & Extraction",
        "desc_pl": "Specjalizacja w wydobyciu węgla, rud żelaza i krzemu. +25% zysku z surowców pierwotnych.",
        "desc_en": "Specialized in coal, iron, and silicon mining. +25% raw ore margin bonus.",
        "perk": "raw_extraction",
        "bonus_multiplier": 1.25,
        "primary_items": ["iron", "coal", "silicon"]
    },
    "Manufacturing": {
        "name_pl": "Hutnictwo i Przemysł Ciężki",
        "name_en": "Heavy Metallurgy & Manufacturing",
        "desc_pl": "Produkcja stali, tworzyw sztucznych i maszyn. +20% prędkości fabryk i obniżony koszt wsadów.",
        "desc_en": "Steel, plastics, and industrial machinery output. +20% factory speed.",
        "perk": "heavy_industry",
        "bonus_multiplier": 1.20,
        "primary_items": ["steel", "plastic", "machines"]
    },
    "HighTech": {
        "name_pl": "Zaawansowane Technologie & AI",
        "name_en": "High-Tech & Electronics",
        "desc_pl": "Produkcja mikroczipów, elektroniki, komputerów i systemów chmurowych. Najwyższe marże rynkowe.",
        "desc_en": "Semiconductors, components, computers, and AI servers. High margin products.",
        "perk": "tech_innovation",
        "bonus_multiplier": 1.30,
        "primary_items": ["components", "electronics", "computers"]
    },
    "Logistics": {
        "name_pl": "Logistyka i Dystrybucja Międzymiastowa",
        "name_en": "Logistics & Global Trade",
        "desc_pl": "Zarządzanie flotą pojazdów, siecią magazynów i arbitrażem cenowym. -35% kosztów transportu, +50% ładowności.",
        "desc_en": "Freight fleet management, multi-city trade routes. -35% shipping costs, +50% capacity.",
        "perk": "trade_routes",
        "bonus_multiplier": 1.35,
        "primary_items": ["all"]
    },
    "Energy": {
        "name_pl": "Zielona Energia & Automatyzacja",
        "name_en": "Energy & Automation",
        "desc_pl": "Generacja energii, farmy fotowoltaiczne, redukcja kosztów utrzymania budynków o 40%.",
        "desc_en": "Clean energy grids, robotic automation, -40% building upkeep costs.",
        "perk": "eco_efficiency",
        "bonus_multiplier": 1.20,
        "primary_items": ["energy"]
    }
}

# Giełda akcji - w tym firma RootX
STOCKS = {
    "ROOTX": 250.0,   # Flagowa korporacja technologiczno-infrastrukturalna
    "TITAN": 100.0,   # Gigant stalowy
    "VOLTA": 60.0,    # Koncern energetyczny
    "NEXUS": 200.0,   # Korporacja telekomunikacyjna
    "ORBIT": 40.0,    # Linia lotnicza i kosmiczna
}

# Szczegółowe informacje o notowanych spółkach
STOCK_INFO = {
    "ROOTX": {
        "name": "RootX Cyber-Infrastructure Corp.",
        "sector": "HighTech",
        "dividend_rate": 0.045, # 4.5% dywidendy
        "desc_pl": "Wiodący dostawca infrastruktury botów, automatyzacji i węzłów sieciowych.",
        "desc_en": "Leading provider of cyber-infrastructure, bot engines, and distributed nodes.",
        "shares_outstanding": 10000000,
        "volatility": 0.08
    },
    "TITAN": {
        "name": "Titan Heavy Industries",
        "sector": "Manufacturing",
        "dividend_rate": 0.032,
        "desc_pl": "Międzynarodowy konglomerat hutniczy dostarczający stal na budowy w całej Europie.",
        "desc_en": "International steel conglomerate supplying construction projects across Europe.",
        "shares_outstanding": 25000000,
        "volatility": 0.04
    },
    "VOLTA": {
        "name": "Volta Power & Clean Energy",
        "sector": "Energy",
        "dividend_rate": 0.040,
        "desc_pl": "Operator sieci przesyłowych i parków wiatrowych.",
        "desc_en": "Operator of green transmission grids and offshore wind farms.",
        "shares_outstanding": 15000000,
        "volatility": 0.05
    },
    "NEXUS": {
        "name": "Nexus Semiconductors & Systems",
        "sector": "HighTech",
        "dividend_rate": 0.025,
        "desc_pl": "Fabryki mikroprocesorów nowej generacji i komponentów komputerowych.",
        "desc_en": "Next-generation semiconductor fabs and computer hardware design.",
        "shares_outstanding": 12000000,
        "volatility": 0.10
    },
    "ORBIT": {
        "name": "Orbit Global Logistics",
        "sector": "Logistics",
        "dividend_rate": 0.035,
        "desc_pl": "Globalny przewoźnik intermodalny, fracht morski i kolejowy.",
        "desc_en": "Global intermodal carrier, rail and sea freight operator.",
        "shares_outstanding": 20000000,
        "volatility": 0.06
    }
}

# Miasta w świecie gry - współrzędne mapy, profile regionalne i specjalizacje
CITIES = [
    {
        "name": "Warszawa",
        "country": "PL",
        "x": 520, "y": 270,
        "population": 1800000,
        "demand": 1.25,
        "wages": 120,
        "taxes": 0.19,
        "land": 8000,
        "specialization": "Commerce & Technology",
        "price_mults": {"computers": 1.15, "electronics": 1.10, "iron": 1.0, "coal": 1.0, "steel": 1.0}
    },
    {
        "name": "Katowice",
        "country": "PL",
        "x": 480, "y": 340,
        "population": 300000,
        "demand": 0.95,
        "wages": 95,
        "taxes": 0.18,
        "land": 4500,
        "specialization": "Coal & Iron Basin",
        "price_mults": {"coal": 0.65, "iron": 0.70, "steel": 0.85, "computers": 1.20, "electronics": 1.20}
    },
    {
        "name": "Gdańsk",
        "country": "PL",
        "x": 490, "y": 160,
        "population": 480000,
        "demand": 1.05,
        "wages": 105,
        "taxes": 0.19,
        "land": 6000,
        "specialization": "Baltic Seaport & Shipbuilding",
        "price_mults": {"steel": 0.90, "machines": 0.95, "oil": 0.85, "plastic": 0.90}
    },
    {
        "name": "Berlin",
        "country": "DE",
        "x": 360, "y": 250,
        "population": 3600000,
        "demand": 1.40,
        "wages": 160,
        "taxes": 0.25,
        "land": 12000,
        "specialization": "High-Tech Metropolis",
        "price_mults": {"computers": 1.30, "electronics": 1.25, "components": 1.15, "coal": 1.35, "iron": 1.25}
    },
    {
        "name": "Rotterdam",
        "country": "NL",
        "x": 230, "y": 260,
        "population": 650000,
        "demand": 1.15,
        "wages": 150,
        "taxes": 0.22,
        "land": 10000,
        "specialization": "Continental Refinery & Petrochemical Port",
        "price_mults": {"oil": 0.65, "plastic": 0.75, "coal": 0.80, "machines": 1.15}
    },
    {
        "name": "Praga",
        "country": "CZ",
        "x": 410, "y": 350,
        "population": 1300000,
        "demand": 1.05,
        "wages": 110,
        "taxes": 0.21,
        "land": 7000,
        "specialization": "Precision Tooling & Automotive",
        "price_mults": {"machines": 0.85, "steel": 1.05, "components": 0.95, "computers": 1.10}
    },
    {
        "name": "Londyn",
        "country": "UK",
        "x": 120, "y": 240,
        "population": 8900000,
        "demand": 1.50,
        "wages": 190,
        "taxes": 0.26,
        "land": 18000,
        "specialization": "Global Financial Capital",
        "price_mults": {"computers": 1.35, "electronics": 1.30, "machines": 1.25, "steel": 1.20, "iron": 1.30}
    },
    {
        "name": "Paryż",
        "country": "FR",
        "x": 180, "y": 340,
        "population": 2100000,
        "demand": 1.35,
        "wages": 170,
        "taxes": 0.28,
        "land": 15000,
        "specialization": "Aerospace & Luxury Manufacturing",
        "price_mults": {"computers": 1.25, "electronics": 1.20, "plastic": 1.10, "coal": 1.30}
    },
    {
        "name": "Hamburg",
        "country": "DE",
        "x": 310, "y": 190,
        "population": 1850000,
        "demand": 1.20,
        "wages": 155,
        "taxes": 0.24,
        "land": 11000,
        "specialization": "Logistics & Freight Hub",
        "price_mults": {"oil": 0.80, "steel": 0.95, "components": 1.05, "computers": 1.15}
    },
    {
        "name": "Kijów",
        "country": "UA",
        "x": 680, "y": 290,
        "population": 2900000,
        "demand": 0.85,
        "wages": 60,
        "taxes": 0.18,
        "land": 3500,
        "specialization": "Mineral & Heavy Industrial Reserve",
        "price_mults": {"iron": 0.65, "coal": 0.70, "silicon": 0.75, "computers": 1.30, "electronics": 1.25}
    }
]

# Drzewo technologii (Tech Tree)
TECH_TREE = {
    "Mining": [
        {"id": "deep_bore", "name": "Głębokie Odwierty", "cost": 15000, "req": 1, "desc": "+15% wydobycia rud żelaza i węgla"},
        {"id": "silicon_refining", "name": "Płuczki Krzemowe", "cost": 35000, "req": 2, "desc": "+25% czystości krzemu"},
        {"id": "automated_quarry", "name": "Autonomiczny Kamieniołom", "cost": 90000, "req": 3, "desc": "+40% całkowitego urobku"}
    ],
    "Manufacturing": [
        {"id": "arc_furnace", "name": "Piece Łukowe", "cost": 20000, "req": 1, "desc": "+20% tempa wytopu stali"},
        {"id": "precision_cnc", "name": "Centra Obróbcze CNC", "cost": 50000, "req": 2, "desc": "+30% jakości i ceny maszyn"},
        {"id": "nano_polymers", "name": "Nanopolimery", "cost": 110000, "req": 3, "desc": "Podwojona wydajność produkcji plastiku"}
    ],
    "HighTech": [
        {"id": "lithography_7nm", "name": "Litografia EUV 7nm", "cost": 40000, "req": 1, "desc": "+25% uzysku mikroukładów"},
        {"id": "quantum_bus", "name": "Szyna Kwantowa", "cost": 85000, "req": 2, "desc": "+35% wydajności komputerów"},
        {"id": "neural_clusters", "name": "Klastry Neuronowe AI", "cost": 180000, "req": 3, "desc": "Odblokowuje serwery AI o 300% marży"}
    ],
    "Logistics": [
        {"id": "fleet_telematics", "name": "Telematyka Floty GPS", "cost": 12000, "req": 1, "desc": "+25% prędkości transportu"},
        {"id": "high_speed_freight", "name": "Szybka Kolej Towarowa", "cost": 45000, "req": 2, "desc": "-30% kosztów frachtu kolejowego"},
        {"id": "automated_terminal", "name": "Zautomatyzowany Hub", "cost": 100000, "req": 3, "desc": "+100% pojemności magazynów"}
    ]
}

# 50 osiągnięć
ACHIEVEMENTS = [
    ("first_factory", "First Factory", "Zbuduj pierwszą fabrykę"),
    ("first_million", "First Million", "Osiągnij wartość firmy 1 000 000"),
    ("staff100", "100 Employees", "Zatrudnij 10 pracowników"),
    ("ten_buildings", "10 Buildings", "Posiadaj 10 budynków"),
    ("investor", "Major Investor", "Zainwestuj 50 000"),
    ("rootx_shareholder", "RootX Shareholder", "Kup co najmniej 100 akcji firmy RootX"),
    ("global_network", "Global Trade Network", "Posiadaj magazyny w co najmniej 3 różnych miastach"),
    ("intercity_trader", "Arbitrage Master", "Zrealizuj transport surowców z Katowic lub Rotterdamu do Berlina"),
    ("global", "Global Company", "Poziom firmy 10"),
    ("giant", "Industrial Giant", "Posiadaj Industrial Complex"),
    ("trader10", "Trader", "Wykonaj 10 transakcji rynkowych"),
    ("producer1000", "Producer", "Wyprodukuj 1000 jednostek"),
    ("rich", "Wealth", "Miej 100 000 gotówki"),
] + [(f"ach_{i:02d}", f"Milestone {i}", f"Kamień milowy #{i}") for i in range(14, 51)]

# Wydarzenia rynkowe
EVENTS = [
    ("RootX launches Quantum Core", "Tech stocks surged, RootX +18%", {"computers": 1.25, "electronics": 1.20}),
    ("Steel demand increased", "steel x1.25", {"steel": 1.25}),
    ("Energy prices dropped", "energy_mult x0.85", {}),
    ("Chip shortage", "electronics x1.4, components x1.2", {"electronics": 1.4, "components": 1.2}),
    ("Oil strike ends in Rotterdam", "oil x0.8, plastic x0.9", {"oil": 0.8, "plastic": 0.9}),
    ("Logistics disruption across Rhine", "transport delays +15%", {}),
    ("Tech breakthrough in Berlin", "computers x0.9, demand +", {"computers": 0.9}),
    ("Construction boom in Warsaw", "steel x1.2, machines x1.15", {"steel": 1.2, "machines": 1.15}),
    ("Green subsidies approved", "energy_mult x0.9", {}),
    ("Recession fears ease", "global consumer demand x1.1", {}),
    ("Silesian coal reserves expansion", "Katowice coal supply +40%", {"coal": 0.85}),
] + [(f"Market fluctuation {i}", "ceny +/-", {}) for i in range(12, 51)]

NEWS_T = [
    "RootX Cyber-Infrastructure reaches all-time high valuation.",
    "Steel demand surges across European industrial corridors.",
    "Inter-city rail transport reports record freight volumes.",
    "Semiconductor chip shortages impact electronics manufacturers.",
    "New logistics warehouses open in Rotterdam and Hamburg.",
    "Energy prices decline following renewable grid integration.",
    "Automated factories in Katowice increase ore processing rates."
]
