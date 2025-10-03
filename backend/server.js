const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database("./data.db");
db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)");

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  scans_today INTEGER DEFAULT 0,
  joined_date TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// Routes
app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/items", (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO items (name) VALUES (?)", [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name });
  });
});

// User Routes
// Create a new user
app.post("/users", (req, res) => {
  const { name, level = 1, total_points = 0, scans_today = 0 } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }

  const joinedDate = new Date().toISOString();

  db.run(
    "INSERT INTO users (name, level, total_points, scans_today, joined_date) VALUES (?, ?, ?, ?, ?)",
    [name.trim(), level, total_points, scans_today, joinedDate],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Return the created user
      db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          id: row.id,
          name: row.name,
          level: row.level,
          totalPoints: row.total_points,
          scansToday: row.scans_today,
          joinedDate: row.joined_date,
        });
      });
    }
  );
});

// Get all users
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const users = rows.map((row) => ({
      id: row.id,
      name: row.name,
      level: row.level,
      totalPoints: row.total_points,
      scansToday: row.scans_today,
      joinedDate: row.joined_date,
    }));

    res.json(users);
  });
});

// Get user by ID
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;

  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User not found" });

    res.json({
      id: row.id,
      name: row.name,
      level: row.level,
      totalPoints: row.total_points,
      scansToday: row.scans_today,
      joinedDate: row.joined_date,
    });
  });
});

// Update user profile
app.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const { name, level, total_points, scans_today } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }

  const updatedAt = new Date().toISOString();

  db.run(
    "UPDATE users SET name = ?, level = ?, total_points = ?, scans_today = ?, updated_at = ? WHERE id = ?",
    [name.trim(), level, total_points, scans_today, updatedAt, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "User not found" });

      // Return updated user
      db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          id: row.id,
          name: row.name,
          level: row.level,
          totalPoints: row.total_points,
          scansToday: row.scans_today,
          joinedDate: row.joined_date,
        });
      });
    }
  );
});

// Delete user
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;

  db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
