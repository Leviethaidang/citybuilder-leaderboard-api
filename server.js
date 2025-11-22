// ====== IMPORT ======
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

// ====== INIT ======
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
//goi trang index.html trong thu muc public de hien thi giao dien
app.use(express.static("public"));

// ====== DATABASE ======
const db = new sqlite3.Database("./leaderboard.db");

//tao bang database neu chua co
db.run(`
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT,
    elapsed_seconds INTEGER NOT NULL,
    submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`);

// ====== API ======

//API gui diem tu trong game
app.post("/api/score", (req, res) => {
    const username = (req.body.username || "").trim();
    const email = (req.body.email || "").trim();
    const elapsedSeconds = req.body.elapsedSeconds;

    if (!username || typeof elapsedSeconds !== "number") {
        return res.status(400).json({ error: "Thiếu username hoặc elapsedSeconds" });
    }

    const stmt = db.prepare(`
        INSERT INTO scores (username, email, elapsed_seconds)
        VALUES (?, ?, ?)
    `);
    stmt.run(username, email, elapsedSeconds, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
    stmt.finalize();
});

// Xem bang xep hang
app.get("/api/leaderboard", (req, res) => {
    db.all(
        "SELECT id, username, email, elapsed_seconds, submitted_at FROM scores ORDER BY elapsed_seconds ASC LIMIT 50",
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});
// ====== ROUTES TRANG GIAO DIỆN ======

//Trang Home
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "home.html"));
});

//Trang bảng xếp hạng
app.get("/leaderboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "leaderboard.html"));
});

app.listen(PORT, () => {
    console.log(`Leaderboard server running at http://localhost:${PORT}`);
});
