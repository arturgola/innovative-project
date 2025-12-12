# 🌱 EcoScan - Smart Product Scanner App

AI-powered mobile app for product scanning with intelligent recycling guidance using OpenAI Vision API and HSY Waste Guide integration.

![gif](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWFrZ3NoMWw0cmN3dXlseTNpd3lycDVmMnh1cXUwYXFpNzQ4c2JuYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5ev3alRsskWA0/giphy.gif)

## 🚀 Quick Start

### **Backend Setup**

Create `.env` file in `backend/` directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=

# HSY Waste Guide API Configuration
HSY_CLIENT_ID=
HSY_CLIENT_SECRET=

# Server Configuration
PORT=3000
```

Install dependencies and run:

```bash
cd backend
npm install
node server.js
```

**Access HSY cache:** http://localhost:3000/hsy-cache

### **Frontend Setup**

```bash
cd frontend
npm install
npx expo start
```

---

## 📚 Documentation

Comprehensive documentation available in the following files:

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview and quick navigation
- **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)** - System architecture, diagrams, and technical details
- **[DATA_FLOW_DIAGRAM.md](./DATA_FLOW_DIAGRAM.md)** - Detailed data flow and processing pipelines
- **[API_USAGE.md](./API_USAGE.md)** - Complete API reference with examples

---

## 🎯 Key Features

- 📸 **AI-Powered Scanning** - OpenAI GPT-4 Vision for product identification
- ♻️ **Waste Guide Integration** - HSY (Finnish) waste management database with 600+ items
- 🎮 **Gamification** - Points system and level progression
- 📊 **Scan History** - Track all analyzed products
- 🔄 **Alternative Analysis** - 4 different interpretation possibilities per scan

---

## 🛠️ Tech Stack

**Frontend:** React Native, Expo Router, TypeScript  
**Backend:** Node.js, Express.js, SQLite3  
**AI:** OpenAI GPT-4 Vision API  
**External API:** HSY Waste Guide API

---

**Last Updated:** December 12, 2025
