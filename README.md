# Jeremiah Attack Tracker

A shared, real-time counter. When any visitor presses the attack button, everyone currently on the site gets the new total instantly through Socket.IO.

## Run locally

1. Install Node.js 18+.
2. In this folder run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

## Put it online

Deploy this folder to a Node.js host. The server listens on `process.env.PORT` automatically.

Important: attacks are stored in `attacks.json`. On hosts with an ephemeral filesystem, set `DATA_FILE` to a persistent disk path or swap the JSON storage for a hosted database.
