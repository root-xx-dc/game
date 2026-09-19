"""Katalogi gry: towary, receptury, budynki, pojazdy, tech, misje/achievements/events."""
ITEMS = {  # item_id: base_price
    "iron": 8, "coal": 6, "silicon": 14, "oil": 12, "plastic": 18,
    "steel": 30, "components": 65, "electronics": 140, "machines": 320, "computers": 520,
}
RECIPES = {  # output: {inputs, time_sec_per_unit, building}
    "steel": {"in": {"iron": 2, "coal": 1}, "time": 6, "building": "Factory"},
    "plastic": {"in": {"oil": 2}, "time": 6, "building": "Factory"},
    "components": {"in": {"steel": 1, "silicon": 1}, "time": 10, "building": "Factory"},
    "electronics": {"in": {"components": 2, "plastic": 1}, "time": 16, "building": "Factory"},
    "machines": {"in": {"components": 3, "steel": 2}, "time": 30, "building": "Industrial Complex"},
    "computers": {"in": {"electronics": 2, "components": 1}, "time": 36, "building": "Factory"},
}
BUILDINGS = {
    "Office": {"price": 5000, "upkeep_h": 20, "bonus": 0.02, "req": 1},
    "Factory": {"price": 20000, "upkeep_h": 80, "bonus": 0.10, "req": 1},
    "Warehouse": {"price": 8000, "upkeep_h": 25, "bonus": 0.0, "req": 1},
    "Store": {"price": 12000, "upkeep_h": 40, "bonus": 0.05, "req": 1},
    "Research Center": {"price": 30000, "upkeep_h": 120, "bonus": 0.08, "req": 2},
    "Logistics Center": {"price": 25000, "upkeep_h": 90, "bonus": 0.06, "req": 2},
    "Headquarters": {"price": 80000, "upkeep_h": 250, "bonus": 0.15, "req": 5},
    "Energy Plant": {"price": 45000, "upkeep_h": 150, "bonus": 0.07, "req": 3},
    "Shopping Center": {"price": 60000, "upkeep_h": 200, "bonus": 0.12, "req": 3},
    "Industrial Complex": {"price": 100000, "upkeep_h": 350, "bonus": 0.20, "req": 4},
}
VEHICLES = {
    "Truck": {"cap": 200, "hours": 1, "cost": 50},
    "Train": {"cap": 1000, "hours": 3, "cost": 200},
    "Ship": {"cap": 5000, "hours": 12, "cost": 600},
    "Aircraft": {"cap": 500, "hours": 1, "cost": 500},
}
ROLES = {"Worker": 100, "Engineer": 250, "Programmer": 400, "Accountant": 300,
         "Manager": 500, "Researcher": 450, "Executive": 900}
BRANCHES = ["Production", "Logistics", "Finance", "Automation", "AI", "Energy", "Research", "Marketing"]
COMPANY_LOGOS = ["factory", "buildings", "bank", "coins", "chart", "trophy", "shield", "bolt"]
STOCKS = {"TITAN": 100.0, "VOLTA": 60.0, "NEXUS": 200.0, "ORBIT": 40.0}
CITIES = [
    {"name": "Warszawa", "population": 1800000, "demand": 1.2, "wages": 120, "taxes": 0.19, "land": 8000},
    {"name": "Berlin", "population": 3600000, "demand": 1.4, "wages": 160, "taxes": 0.25, "land": 12000},
    {"name": "Rotterdam", "population": 650000, "demand": 1.1, "wages": 150, "taxes": 0.22, "land": 10000},
    {"name": "Gdańsk", "population": 480000, "demand": 1.0, "wages": 100, "taxes": 0.19, "land": 6000},
    {"name": "Praga", "population": 1300000, "demand": 1.0, "wages": 110, "taxes": 0.21, "land": 7000},
    {"name": "Kijów", "population": 2900000, "demand": 0.8, "wages": 60, "taxes": 0.18, "land": 3000},
]
# 50 osiągnięć
ACHIEVEMENTS = [
    ("first_factory", "First Factory", "Zbuduj pierwszą fabrykę"),
    ("first_million", "First Million", "Osiągnij wartość firmy 1 000 000"),
    ("staff100", "100 Employees", "Zatrudnij 10 pracowników"),
    ("ten_buildings", "10 Buildings", "Posiadaj 10 budynków"),
    ("investor", "Major Investor", "Zainwestuj 50 000"),
    ("global", "Global Company", "Poziom firmy 10"),
    ("giant", "Industrial Giant", "Posiadaj Industrial Complex"),
    ("trader10", "Trader", "Wykonaj 10 transakcji rynkowych"),
    ("producer1000", "Producer", "Wyprodukuj 1000 jednostek"),
    ("rich", "Wealth", "Miej 100 000 gotówki"),
] + [(f"ach_{i:02d}", f"Milestone {i}", f"Kamień milowy #{i}") for i in range(11, 51)]
# 50 wydarzeń gospodarczych: (tytuł, efekt tekst, modyfikator rynku)
EVENTS = [
    ("Steel demand increased", "steel x1.25", {"steel": 1.25}),
    ("Energy prices dropped", "energy_mult x0.85", {}),
    ("Chip shortage", "electronics x1.4, components x1.2", {"electronics": 1.4, "components": 1.2}),
    ("Oil strike ends", "oil x0.8, plastic x0.9", {"oil": 0.8, "plastic": 0.9}),
    ("Logistics disruption", "all x1.1", {}),
    ("Tech breakthrough", "computers x0.9, demand +", {"computers": 0.9}),
    ("Construction boom", "steel x1.2, machines x1.15", {"steel": 1.2, "machines": 1.15}),
    ("Green subsidies", "energy_mult x0.9", {}),
    ("Recession fears", "demand x0.9", {}),
    ("Export contracts signed", "machines x1.2", {"machines": 1.2}),
] + [(f"Market fluctuation {i}", "ceny +/-", {}) for i in range(11, 51)]
NEWS_T = ["Steel demand increased.", "Energy prices dropped.", "New technology discovered.",
          "Major logistics disruption detected.", "Market rally on tech stocks.",
          "Industrial output above expectations.", "Transport costs rising."]
