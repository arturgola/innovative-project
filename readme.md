Here’s complete `README.md` file with everything in one place—installation, technologies, structure, and how to run both frontend and backend:

---

```markdown
# 📱 Fullstack Mobile App – Expo + Node.js + SQLite

A cross-platform mobile app built with **Expo (React Native)** and styled using **Tailwind CSS via NativeWind**, connected to a **Node.js + Express** backend with a **SQLite** database.

---

## 🧰 Technologies Used

- **Frontend**: Expo (React Native), NativeWind (Tailwind CSS for React Native)
- **Backend**: Node.js, Express.js
- **Database**: SQLite (local)
- **API Communication**: RESTful endpoints via `fetch` or `axios`

---

## 📁 Project Structure
```

my-fullstack-app/
├── frontend/ # Expo + NativeWind
└── backend/ # Node.js + Express + SQLite

````

---

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
````

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## 🚀 Running the Project

### Start the backend server

```bash
cd backend
node server.js
```

> Server runs at `http://localhost:3000`

### Start the Expo frontend

```bash
cd ../frontend
npx expo start
```

> Use Expo Go app or emulator to preview

---

## 🔗 Connecting Frontend to Backend

In your frontend code, replace `localhost` with your local IP:

```js
fetch("http://192.168.x.x:3000/items");
```

> Ensure both devices are on the same Wi-Fi and CORS is enabled in backend.

---

## 🧪 Testing

- Add items via POST `/items`
- Retrieve items via GET `/items`
- View results in Expo app styled with Tailwind classes

---

## 🛠 Backend Sample (`server.js`)

```js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./data.db");
db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)");

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

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
```

---

## 🧼 Troubleshooting

If you see errors like `Cannot find module '@radix-ui/react-dialog'`, run:

```bash
npm install @radix-ui/react-dialog @radix-ui/react-slot
```

If issues persist:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📌 Notes

- Tailwind is configured via NativeWind for React Native styling.
- SQLite is used both in backend (`sqlite3`) and optionally in frontend (`expo-sqlite`) for local storage.
- Backend and frontend run independently—connect via REST API.

```

```
