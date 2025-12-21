const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class Database {
  constructor() {
    this.db = null;
  }

  initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database("./data.db", (err) => {
        if (err) {
          reject(err);
        } else {
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  createTables() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Items table
        this.db.run(
          "CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)",
          (err) => {
            if (err) console.error("Error creating items table:", err);
          }
        );

        // Users table
        this.db.run(
          `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            total_points INTEGER DEFAULT 0,
            scans_today INTEGER DEFAULT 0,
            joined_date TEXT DEFAULT CURRENT_TIMESTAMP,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`,
          (err) => {
            if (err) console.error("Error creating users table:", err);
          }
        );

        // Product scans table
        this.db.run(
          `CREATE TABLE IF NOT EXISTS product_scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            brand TEXT,
            category TEXT,
            barcode TEXT,
            points INTEGER DEFAULT 0,
            rating REAL DEFAULT 0,
            description TEXT,
            recyclability TEXT,
            suggestions TEXT,
            confidence REAL DEFAULT 0,
            analysis_method TEXT DEFAULT 'openai-vision',
            object_material TEXT,
            waste_guide_match TEXT,
            image_path TEXT,
            photo_width INTEGER,
            photo_height INTEGER,
            scanned_at TEXT DEFAULT CURRENT_TIMESTAMP,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )`,
          (err) => {
            if (err) console.error("Error creating product_scans table:", err);
          }
        );

        // Add missing columns if they don't exist
        const alterTableQueries = [
          "ALTER TABLE product_scans ADD COLUMN waste_guide_match TEXT",
          "ALTER TABLE product_scans ADD COLUMN ai_recycling_advice TEXT",
          "ALTER TABLE product_scans ADD COLUMN is_dangerous INTEGER DEFAULT 0",
          "ALTER TABLE product_scans ADD COLUMN danger_warning TEXT",
          "ALTER TABLE product_scans ADD COLUMN general_tips TEXT",
          "ALTER TABLE product_scans ADD COLUMN alternative_answers TEXT",
        ];

        alterTableQueries.forEach((query) => {
          this.db.run(query, (err) => {
            if (err && !err.message.includes("duplicate column name")) {
              console.error(`Error executing query: ${query}`, err.message);
            }
          });
        });

        resolve();
      });
    });
  }

  getDb() {
    return this.db;
  }
}

module.exports = new Database();
