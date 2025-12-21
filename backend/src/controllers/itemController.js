const database = require("../../config/database");
const asyncHandler = require("../../middleware/asyncHandler");

class ItemController {
  /**
   * Get all items
   */
  getAllItems = asyncHandler(async (req, res) => {
    const db = database.getDb();

    db.all("SELECT * FROM items", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  /**
   * Create a new item
   */
  createItem = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const db = database.getDb();

    db.run("INSERT INTO items (name) VALUES (?)", [name], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name });
    });
  });
}

module.exports = new ItemController();
