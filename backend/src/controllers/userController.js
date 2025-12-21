const database = require("../../config/database");
const asyncHandler = require("../../middleware/asyncHandler");

class UserController {
  /**
   * Create a new user
   */
  createUser = asyncHandler(async (req, res) => {
    const { name, level = 1, total_points = 0, scans_today = 0 } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Name is required" });
    }

    const joinedDate = new Date().toISOString();
    const db = database.getDb();

    db.run(
      "INSERT INTO users (name, level, total_points, scans_today, joined_date) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), level, total_points, scans_today, joinedDate],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.get(
          "SELECT * FROM users WHERE id = ?",
          [this.lastID],
          (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
              id: row.id,
              name: row.name,
              level: row.level,
              totalPoints: row.total_points,
              scansToday: row.scans_today,
              joinedDate: row.joined_date,
            });
          }
        );
      }
    );
  });

  /**
   * Get all users
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const db = database.getDb();

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

  /**
   * Get user by ID
   */
  getUserById = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const db = database.getDb();

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

  /**
   * Update user profile
   */
  updateUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { name, level, total_points, scans_today } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Name is required" });
    }

    const updatedAt = new Date().toISOString();
    const db = database.getDb();

    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, existing) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!existing) return res.status(404).json({ error: "User not found" });

      const newName = name.trim();
      const newLevel = level !== undefined ? level : existing.level;
      const newTotalPoints =
        total_points !== undefined ? total_points : existing.total_points;
      const newScansToday =
        scans_today !== undefined ? scans_today : existing.scans_today;

      db.run(
        "UPDATE users SET name = ?, level = ?, total_points = ?, scans_today = ?, updated_at = ? WHERE id = ?",
        [newName, newLevel, newTotalPoints, newScansToday, updatedAt, userId],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          if (this.changes === 0)
            return res.status(404).json({ error: "User not found" });

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
  });

  /**
   * Delete user
   */
  deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const db = database.getDb();

    db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "User not found" });

      res.json({ message: "User deleted successfully" });
    });
  });
}

module.exports = new UserController();
