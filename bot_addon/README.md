# Discord Bot Integration - Button Login with Channel Assignment

This module allows your Discord bot to host a **dedicated login channel** with an interactive button. Players click the button to receive an **ephemeral (private)** one-time access code to log into the NEON MAGNAT web game.

---

## How It Works

1. **Administrator sets up the channel**:
   - An admin runs the slash command:
     ```
     /tycoon-channel #login-here
     ```
   - The bot posts a permanent embed on the designated channel with the button:
     `[🎮 Zaloguj do Gry NEON MAGNAT]`

2. **Player clicks the button**:
   - The bot generates a unique, one-time 6-digit access code (e.g. `DC-849201`).
   - The response is sent with `ephemeral: true`. **Only the clicking player sees this message.** No one else in the channel can view it.
   - The bot registers the code with the game's backend API (`POST /api/auth/discord/code`).

3. **Player logs in on the Web**:
   - The player visits the web client.
   - In the sign-in modal, they click **"Zaloguj przez Discord"**, enter their one-time code, and are instantly logged in.
   - **Zero IP exposure**: The player never sees or interacts with the bot's IP address, hosting environment, or internal tokens.

---

## Bot Setup Instructions

1. Copy the `src/features/tycoon/` folder into your bot's `src/features/` directory.
2. In your main bot entrypoint (e.g., `src/index.js`):
   ```javascript
   const { initTycoon } = require('./features/tycoon/init');
   
   // Call after client is created:
   initTycoon(client);
   ```
3. Set optional environment variable in your bot's `.env`:
   ```env
   TYCOON_API_URL="http://127.0.0.1:7777"
   TYCOON_WEB_URL="http://100.111.112.57:7777"
   ```
