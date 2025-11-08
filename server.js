// ====== IMPORT ======
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

// ====== INIT ======
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// ====== DATABASE ======
const db = new sqlite3.Database("./leaderboard.db");

//tao bang database neu chua co
db.run(`
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    elapsed_seconds INTEGER NOT NULL,
    submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`);

// ====== API ======

//API gui diem tu trong game
app.post("/api/score", (req, res) => {
    const { playerName, elapsedSeconds } = req.body;

    if (!playerName || typeof elapsedSeconds !== "number") {
        return res.status(400).json({ error: "Thieu playerName hoac elapsedSeconds" });
    }

    const stmt = db.prepare("INSERT INTO scores (player_name, elapsed_seconds) VALUES (?, ?)");
    stmt.run(playerName, elapsedSeconds, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
    stmt.finalize();
});

// Xem bang xep hang
app.get("/api/leaderboard", (req, res) => {
    db.all("SELECT * FROM scores ORDER BY elapsed_seconds ASC LIMIT 50", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ====== START SERVER ======
app.get("/", (req, res) => {
  res.send("Server da hoat dong, hay truy cap /api/leaderboard de xem bang xep hang.");
});

app.listen(PORT, () => {
    console.log(`Leaderboard server running at http://localhost:${PORT}`);
});
