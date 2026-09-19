# NEON MAGNAT - Real-Time Multiplayer Economic Tycoon

A modern, full-stack multiplayer economic strategy game built with **Python FastAPI**, **WebSockets**, and a responsive **Vanilla JavaScript Single-Page Application (SPA)**. Designed for a single shared world economy where all players interact in the same global market, establish inter-city trade networks, and invest in corporations.

---

## Key Features

### 1. Single Shared World Economy
- **No isolated lobbies or rooms** - Every player participates in the same dynamic, server-calculated European economy.
- **Global Order Book** - Real-time market trades and player-driven limit orders.
- **Dynamic Commodity Pricing** - Supply and demand fluctuate based on player trades, production volume, and macroeconomic events.

### 2. RootX Cyber-Infrastructure Corporation (`ROOTX`)
- Listed on the global stock exchange with a premier valuation ($250.00 base).
- **High Dividend Yield (4.5% annual)** paid to active shareholders.
- Real-time stock charting, market cap tracking, and direct share trading for investment growth.

### 3. Industrial Sectors & Specializations
Companies can choose and pivot their strategic industry profile:
- **Mining & Extraction**: +25% margin bonus on raw ores (Iron, Coal, Silicon).
- **Heavy Metallurgy & Manufacturing**: +20% factory output speed for Steel, Plastics, and Heavy Machinery.
- **High-Tech & Electronics**: +30% profit margins on Semiconductors, Electronics, and Computers.
- **Logistics & Global Trade**: -35% freight shipping costs, +50% warehouse capacity.
- **Green Energy & Automation**: -40% building upkeep costs, increased energy efficiency.

### 4. European Map & Regional Arbitrage
10 interconnected economic hubs with regional supply/demand profiles:
- **Katowice**: Silesian coal and iron basin (cheapest raw materials).
- **Rotterdam**: Petrochemical port and refinery hub (cheapest oil & plastics).
- **Berlin**: High-tech consumer metropolis (highest demand for electronics & computers).
- **Warszawa**: Commercial & administrative center.
- **Gdańsk**: Baltic shipyard & maritime transport terminal.
- **Praga**: Precision tooling and automotive engineering.
- **London & Paris**: High-demand luxury and consumer mega-markets.
- **Hamburg & Kyiv**: Northern and Eastern freight corridors.
- **Arbitrage Scanner**: Built-in tool that analyzes regional price spreads so traders can buy low in producer cities, transport cargo, and sell high in consumer markets.

### 5. Multi-City Logistics & Warehouses
- Construct and upgrade regional warehouses in any European city.
- Multi-tier transport fleet:
  - **Trucks (Scania R500)**: Rapid short-haul road freight.
  - **Freight Trains**: High-capacity continental rail transport.
  - **Container Ships**: Massive bulk sea cargo.
  - **Cargo Aircraft (Boeing 737)**: Express high-speed air transport.
- Real distance calculation, fuel expenditure, and live en-route transit timers.

### 6. B2B Contracts & Escrow Protection
- Player-to-player trade contracts secured with upfront **escrow**.
- Breach of contract carries heavy penalties, reputation loss, and court lawsuits.

### 7. Discord Bot Authentication & Dedicated Login Channel
- **Channel Assignment (`/tycoon-channel #channel`)**: Administrators can bind a dedicated login channel on Discord where the bot posts a persistent interactive button (`[🎮 Log in to NEON MAGNAT]`).
- **Private Ephemeral Codes**: When a player clicks the button, the bot generates a secure, one-time 6-digit access code delivered via a private ephemeral message visible **strictly to that clicking user**. No other member in the channel sees the code.
- **Zero IP Exposure**: Players connect through their web browser without ever knowing or contacting the bot's private IP address, hosting server, or backend tokens.
- **WebSocket Community Chat**: Global, group, and private 1:1 real-time chat powered by WebSockets.

### 8. Customization & Offline Mode
- 5 curated CSS themes (Dark Oak, Starry Night, Industrial Slate, Forest Emerald, Obsidian) - no jarring neon AI aesthetics.
- Custom GUI layout manager (sidebar positioning, interface density, widget ordering).
- Offline fallback page with standalone mini-tycoon simulation when servers undergo maintenance.
- Privacy policy, GDPR-compliant cookie consent banner, and custom 404 handler.

---

## Tech Stack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Uvicorn, SQLite (development) / PostgreSQL (production).
- **Frontend**: Vanilla JavaScript (ES6+), CSS3 with CSS custom properties, SVG icons (zero emoji).
- **Real-Time**: WebSockets for market tickers, player transactions, and chat.
- **Deployment**: Native systemd service, Docker Compose, or manual shell scripts.

---

## Project Structure

```
game/
├── backend/
│   ├── app/
│   │   ├── api/          # REST API endpoints (auth, market, logistics, money, world, etc.)
│   │   ├── core/         # Security, database connection, environment settings
│   │   ├── economy/      # Economic simulation & upkeep ticks
│   │   ├── logistics/    # Inter-city route distance & freight transit engine
│   │   ├── market/       # Regional pricing, order matching & arbitrage calculations
│   │   ├── models/       # SQLAlchemy database models
│   │   ├── production/   # Factory recipes & production scheduling
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # Money transactions, missions, and achievement checks
│   │   ├── websocket/    # Live event broadcasting
│   │   ├── gamedata.py   # Catalogs (cities, recipes, vehicles, sectors, stocks)
│   │   └── main.py       # FastAPI application entrypoint & static routes
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── assets/           # SVG icon sprite, logos, and favicons
│   ├── css/style.css     # Theme engine & UI styling
│   ├── js/app.js         # Single-Page Application (routing, state, charts, views)
│   ├── 404.html          # Custom styled 404 error page
│   ├── privacy.html      # Privacy policy & cookie terms
│   └── index.html        # Game client shell
├── index.html            # Standalone offline status page with mini-game
├── config.yaml           # Server status & support contact info (git-ignored)
├── start.sh              # Unix server launcher
├── start.bat             # Windows launcher
└── docker-compose.yml    # Full containerized stack
```

---

## Getting Started

### Prerequisites
- Python 3.10 or newer
- Git

### 1. Installation
```bash
git clone https://github.com/root-xx-dc/game.git
cd game
cp .env.example .env
```

Generate a secure secret key and configure `.env`:
```bash
# Generate secret key
openssl rand -hex 32
```

### 2. Starting the Server
```bash
chmod +x start.sh
./start.sh
```
The game will be accessible at:
- **Game Client**: `http://localhost:8000/`
- **Interactive API Docs**: `http://localhost:8000/docs`
- **API Root**: `http://localhost:8000/api`

### 3. Docker Deployment
```bash
docker compose up --build -d
```
The game will be available at `http://localhost:3000` backed by PostgreSQL.

---

## Administration

Promote a player to administrator:
```bash
./make_admin.sh <username>
```

---

## License & Credits

Developed by **root-xx-dc**. Built for high-concurrency economic strategy gaming.
