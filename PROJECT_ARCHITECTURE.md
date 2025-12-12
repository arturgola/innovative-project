# 🏗️ EcoScan - Project Architecture Documentation

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture Diagram](#architecture-diagram)
- [Technology Stack](#technology-stack)
- [System Components](#system-components)
- [Data Flow Diagram](#data-flow-diagram)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [External Integrations](#external-integrations)

---

## 📝 Project Overview

**EcoScan** is a smart, eco-friendly product scanning application that helps users identify products, understand their environmental impact, and learn proper recycling/disposal methods. The application uses AI-powered image analysis combined with official waste management guidelines to provide accurate recycling information.

### Key Features:

- 📸 **Camera-based Product Scanning** - Capture product images for instant analysis
- 🤖 **AI-Powered Analysis** - OpenAI GPT-4 Vision API for product identification and material analysis
- ♻️ **HSY Waste Guide Integration** - Finnish waste management database with 600+ disposal guidelines
- 👤 **User Profiles** - Gamified experience with levels, points, and scan history
- 📊 **Statistics & History** - Track scanning activity and environmental impact
- 🎯 **Alternative Analysis** - Multiple interpretation possibilities for ambiguous items

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MOBILE CLIENT LAYER                         │
│                     (React Native + Expo Router)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Greeting   │  │  Main Menu   │  │    Scan      │             │
│  │   Screen     │  │   Screen     │  │   Screen     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Product    │  │  Statistics  │  │    Profile   │             │
│  │   Details    │  │   Screen     │  │   Screen     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │           App Context (Global State)                │       │                                                         │
│  │  - User Profile  - Current Product  - Scan History      │                                                         │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │               API Service Layer                         │       │
│  │  - HTTP Client  - Image Upload  - Data Transformation   │       │
│  └─────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
                              ↕ REST API (HTTP/JSON)
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVER LAYER                        │
│                     (Node.js + Express.js)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                  Route Handlers                         │       │
│  │  • /analyze-product   • /users   • /users/:id/scans     │       │
│  │  • /waste-guide       • /hsy-*   • /items               │       │
│  └─────────────────────────────────────────────────────────┘       │
│                              ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │              Business Logic Layer                       │       │
│  │  • analyzeProductImage()   • analyzeObjectMaterial()    │       │
│  │  • getHSYWasteGuideList()  • getAIRecyclingAdvice()     │       │
│  │  • calculateLevel()        • cleanOpenAIResponse()      │       │
│  └─────────────────────────────────────────────────────────┘       │
│                              ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                File Upload Handler                      │       │
│  │              (Multer - multipart/form-data)             │       │
│  │  • Image storage: ./uploads/                            │       │
│  │  • Max size: 10MB  • Format: JPEG/PNG                   │       │
│  └─────────────────────────────────────────────────────────┘       │
│                              ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                In-Memory Cache                          │       │
│  │  • HSY Waste Guide (600+ items)                         │       │
│  │  • Cache Duration: 24 hours                             │       │
│  │  • Auto-refresh on expiry                               │       │
│  └─────────────────────────────────────────────────────────┘       │
│                              ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │              Database Layer (SQLite3)                   │       │
│  │  • users  • product_scans  • items                      │       │
│  └─────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────┐    ┌──────────────────────────┐     │
│  │   OpenAI GPT-4 Vision    │    │   HSY Waste Guide API    │     │
│  │                          │    │   (Finnish Waste Mgmt)   │     │
│  │  • Image Analysis        │    │                          │     │
│  │  • Product ID            │    │  • Waste Categories      │     │
│  │  • Material Detection    │    │  • Disposal Methods      │     │
│  │  • Recycling Advice      │    │  • 600+ Items            │     │
│  └──────────────────────────┘    └──────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend (Mobile)

| Technology       | Version  | Purpose                        |
| ---------------- | -------- | ------------------------------ |
| React Native     | 0.81.4   | Mobile app framework           |
| Expo             | ^54.0.13 | Development platform & tooling |
| Expo Router      | ^6.0.11  | File-based navigation          |
| TypeScript       | ~5.9.2   | Type safety                    |
| Expo Camera      | ^17.0.8  | Camera access for scanning     |
| React Navigation | ^7.1.8   | Navigation management          |
| NativeWind       | ^4.2.1   | Styling framework              |

### Backend (Server)

| Technology | Version | Purpose                       |
| ---------- | ------- | ----------------------------- |
| Node.js    | Latest  | Runtime environment           |
| Express.js | ^5.1.0  | Web framework                 |
| SQLite3    | ^5.1.7  | Database                      |
| Multer     | ^2.0.2  | File upload handling          |
| Axios      | ^1.12.2 | HTTP client                   |
| dotenv     | ^17.2.3 | Environment configuration     |
| CORS       | ^2.8.5  | Cross-origin resource sharing |

### External APIs

- **OpenAI GPT-4 Vision API** - Image analysis and AI reasoning
- **HSY Waste Guide API** - Finnish waste management database

---

## 🔧 System Components

### Frontend Components

#### 1. **Screen Components**

- `greeting.tsx` - Onboarding/welcome screen
- `(tabs)/index.tsx` - Home dashboard with statistics
- `scan.tsx` - Camera interface for product scanning
- `product.tsx` - Detailed product analysis results
- `success.tsx` - Scan completion confirmation
- `(tabs)/explore.tsx` - Scan history and statistics
- `user-profile.tsx` - User profile management

#### 2. **UI Components**

- `greeting-screen.tsx` - Welcome UI
- `main-menu.tsx` - Dashboard UI with stats
- `scan-screen.tsx` - Camera controls
- `product-details.tsx` - Product information display
- `statistics-screen.tsx` - Historical data visualization
- `success-screen.tsx` - Success feedback
- `user-profile.tsx` - Profile editing

#### 3. **Context & State**

- `app-context.tsx` - Global state management
  - User profile
  - Current product
  - Scanned products history
  - Loading states

#### 4. **Services**

- `api.ts` - Backend API communication
  - User CRUD operations
  - Product image analysis
  - Scan history retrieval

### Backend Components

#### 1. **Core Functions**

- `analyzeProductImage()` - Main AI analysis with HSY matching
- `analyzeObjectMaterial()` - Material identification
- `getHSYWasteGuideList()` - Fetch & cache waste guide
- `getHSYWasteGuideDetails()` - Fetch specific waste item
- `getAIRecyclingAdvice()` - Fallback recycling advice
- `calculateLevel()` - User progression system
- `cleanOpenAIResponse()` - JSON parsing helper

#### 2. **Middleware**

- Express JSON parser (50MB limit)
- CORS handler
- Multer file upload (10MB limit)
- Static file serving (/uploads)

---

## 🔄 Data Flow Diagram

### Product Scanning Flow

```
┌──────────────┐
│   User       │
│ Opens Camera │
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│  1. Capture Image    │
│  (Expo Camera)       │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────┐
│  2. Upload Image to Backend                              │
│  POST /analyze-product                                   │
│  - FormData with image file                              │
│  - userId parameter                                      │
└──────┬───────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────┐
│  3. Backend Processing Pipeline                          │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Step 3.1: Fetch HSY Waste Guide Cache          │    │
│  │ - Load 600+ waste items from memory cache      │    │
│  │ - Or fetch from HSY API if cache expired       │    │
│  └─────────────────┬───────────────────────────────┘    │
│                    │                                     │
│                    ↓                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Step 3.2: Analyze Object Material              │    │
│  │ OpenAI GPT-4 Vision API Call #1                │    │
│  │ - Identify: "plastic bottle"                   │    │
│  │ - Quick material classification                │    │
│  └─────────────────┬───────────────────────────────┘    │
│                    │                                     │
│                    ↓                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Step 3.3: Main Product Analysis                │    │
│  │ OpenAI GPT-4 Vision API Call #2                │    │
│  │ Returns:                                        │    │
│  │ • Primary Answer (name, brand, category)       │    │
│  │ • 4 Alternative Answers (possibilities)        │    │
│  │ • Confidence scores                            │    │
│  │ • Sorting explanations                         │    │
│  └─────────────────┬───────────────────────────────┘    │
│                    │                                     │
│                    ↓                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Step 3.4: HSY Matching for Primary Answer      │    │
│  │ OpenAI GPT-4 API Call #3                       │    │
│  │ - Compare with 600+ HSY items                  │    │
│  │ - Get best match ID + reasoning               │    │
│  │ - Exact match OR material-based fallback      │    │
│  └─────────────────┬───────────────────────────────┘    │
│                    │                                     │
│                    ↓                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Step 3.5: Process Alternatives (4 items)       │    │
│  │ For each alternative:                          │    │
│  │ - OpenAI API call to find HSY match           │    │
│  │ - Fetch detailed HSY info if match found      │    │
│  └─────────────────┬───────────────────────────────┘    │
│                    │                                     │
│                    ↓                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Step 3.6: Fetch Primary HSY Details            │    │
│  │ If HSY match found:                            │    │
│  │ - GET HSY API for full details                 │    │
│  │ - Waste types, recycling methods, etc.        │    │
│  │                                                 │    │
│  │ If NO HSY match:                               │    │
│  │ - Generate AI Recycling Advice (fallback)     │    │
│  │ - OpenAI API Call #(5+n)                      │    │
│  │ - Check for hazardous materials               │    │
│  └─────────────────┬───────────────────────────────┘    │
│                    │                                     │
│                    ↓                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Step 3.7: Calculate Points & Level             │    │
│  │ - Points: confidence/2 + bonus (HSY match)     │    │
│  │ - Level: floor(totalPoints / 200) + 1         │    │
│  └─────────────────┬───────────────────────────────┘    │
│                    │                                     │
│                    ↓                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Step 3.8: Save to Database                     │    │
│  │ - Insert into product_scans table              │    │
│  │ - Update user stats (points, level, scans)     │    │
│  └─────────────────┬───────────────────────────────┘    │
└────────────────────┼─────────────────────────────────────┘
                     │
                     ↓
┌────────────────────────────────────────────────────────┐
│  4. Return Complete Product Data                      │
│  {                                                     │
│    id, name, brand, category, points, rating,         │
│    description, recyclability, suggestions,           │
│    wasteGuideMatch (HSY details),                     │
│    aiRecyclingAdvice (if no HSY match),               │
│    alternativeAnswers (4 items with HSY data),        │
│    photoUri, confidence, scannedAt                    │
│  }                                                     │
└────────────────────┬───────────────────────────────────┘
                     │
                     ↓
┌────────────────────────────────────────────────────────┐
│  5. Frontend Display                                   │
│  - Navigate to product details screen                 │
│  - Show analysis results                              │
│  - Display recycling instructions                     │
│  - Show alternative interpretations                   │
│  - Navigate to success screen                         │
│  - Update user stats in UI                            │
└────────────────────────────────────────────────────────┘
```

### User Management Flow

```
┌──────────────────┐
│  App Launch      │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────┐
│ Load User Profile        │
│ GET /users               │
└────────┬─────────────────┘
         │
         ↓
    ┌────────────┐
    │ Users exist?│
    └────┬───┬───┘
         │   │
    Yes  │   │ No
         │   │
         ↓   ↓
    ┌────────┴──────────┐
    │                   │
    ↓                   ↓
┌────────┐      ┌──────────────┐
│ Load   │      │  Show        │
│ First  │      │  Onboarding  │
│ User   │      │  Screen      │
└────┬───┘      └──────┬───────┘
     │                 │
     │                 ↓
     │          ┌──────────────┐
     │          │ Create User  │
     │          │ POST /users  │
     │          └──────┬───────┘
     │                 │
     └─────────────────┘
                │
                ↓
         ┌──────────────┐
         │  Set User    │
         │  in Context  │
         └──────────────┘
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        users                            │
├─────────────────────────────────────────────────────────┤
│ PK │ id                INTEGER PRIMARY KEY AUTOINCREMENT│
│    │ name              TEXT NOT NULL                    │
│    │ level             INTEGER DEFAULT 1                │
│    │ total_points      INTEGER DEFAULT 0                │
│    │ scans_today       INTEGER DEFAULT 0                │
│    │ joined_date       TEXT DEFAULT CURRENT_TIMESTAMP   │
│    │ created_at        TEXT DEFAULT CURRENT_TIMESTAMP   │
│    │ updated_at        TEXT DEFAULT CURRENT_TIMESTAMP   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ 1:N
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   product_scans                         │
├─────────────────────────────────────────────────────────┤
│ PK │ id                INTEGER PRIMARY KEY AUTOINCREMENT│
│ FK │ user_id           INTEGER → users(id)              │
│    │ name              TEXT NOT NULL                    │
│    │ brand             TEXT                             │
│    │ category          TEXT                             │
│    │ barcode           TEXT                             │
│    │ points            INTEGER DEFAULT 0                │
│    │ rating            REAL DEFAULT 0                   │
│    │ description       TEXT                             │
│    │ recyclability     TEXT                             │
│    │ suggestions       TEXT (JSON array)                │
│    │ confidence        REAL DEFAULT 0                   │
│    │ analysis_method   TEXT DEFAULT 'openai-vision'     │
│    │ object_material   TEXT                             │
│    │ waste_guide_match TEXT (JSON object)               │
│    │ ai_recycling_advice TEXT                           │
│    │ is_dangerous      INTEGER DEFAULT 0                │
│    │ danger_warning    TEXT                             │
│    │ general_tips      TEXT (JSON array)                │
│    │ alternative_answers TEXT (JSON array)              │
│    │ image_path        TEXT                             │
│    │ photo_width       INTEGER                          │
│    │ photo_height      INTEGER                          │
│    │ scanned_at        TEXT DEFAULT CURRENT_TIMESTAMP   │
│    │ created_at        TEXT DEFAULT CURRENT_TIMESTAMP   │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│                        items                            │
│                   (Legacy/Basic Usage)                  │
├─────────────────────────────────────────────────────────┤
│ PK │ id                INTEGER PRIMARY KEY              │
│    │ name              TEXT                             │
└─────────────────────────────────────────────────────────┘
```

### Database Tables Detail

#### `users`

Stores user profiles with gamification data.

| Column       | Type       | Description                                          |
| ------------ | ---------- | ---------------------------------------------------- |
| id           | INTEGER PK | Unique user identifier                               |
| name         | TEXT       | User's display name                                  |
| level        | INTEGER    | User level (calculated: floor(total_points/200) + 1) |
| total_points | INTEGER    | Cumulative points from all scans                     |
| scans_today  | INTEGER    | Number of scans performed today                      |
| joined_date  | TEXT       | ISO timestamp of account creation                    |
| created_at   | TEXT       | Record creation timestamp                            |
| updated_at   | TEXT       | Last update timestamp                                |

#### `product_scans`

Stores every product scan with complete analysis data.

| Column              | Type       | Description                               |
| ------------------- | ---------- | ----------------------------------------- |
| id                  | INTEGER PK | Unique scan identifier                    |
| user_id             | INTEGER FK | References users(id)                      |
| name                | TEXT       | Product name (e.g., "Plastic Bottle")     |
| brand               | TEXT       | Brand name if detected                    |
| category            | TEXT       | Product category                          |
| barcode             | TEXT       | Barcode or "camera-scanned"               |
| points              | INTEGER    | Points earned from this scan              |
| rating              | REAL       | Confidence score (0-100)                  |
| description         | TEXT       | Product description with material info    |
| recyclability       | TEXT       | Material type (plastic, metal, etc.)      |
| suggestions         | TEXT       | JSON array of recycling suggestions       |
| confidence          | REAL       | AI confidence percentage                  |
| analysis_method     | TEXT       | "openai-vision-with-hsy" or other         |
| object_material     | TEXT       | Short material description                |
| waste_guide_match   | TEXT       | JSON object with HSY waste guide details  |
| ai_recycling_advice | TEXT       | AI-generated advice (when no HSY match)   |
| is_dangerous        | INTEGER    | 1 if hazardous material detected          |
| danger_warning      | TEXT       | Warning message for hazardous items       |
| general_tips        | TEXT       | JSON array of general recycling tips      |
| alternative_answers | TEXT       | JSON array of alternative interpretations |
| image_path          | TEXT       | Path to uploaded image file               |
| photo_width         | INTEGER    | Image width in pixels                     |
| photo_height        | INTEGER    | Image height in pixels                    |
| scanned_at          | TEXT       | Scan timestamp                            |
| created_at          | TEXT       | Record creation timestamp                 |

#### `items`

Simple key-value storage (legacy/demo purposes).

---

## 🌐 API Endpoints

### User Management APIs

#### `POST /users`

Create a new user account.

**Request:**

```json
{
  "name": "EcoWarrior",
  "level": 1,
  "total_points": 0,
  "scans_today": 0
}
```

**Response:**

```json
{
  "id": 1,
  "name": "EcoWarrior",
  "level": 1,
  "totalPoints": 0,
  "scansToday": 0,
  "joinedDate": "2025-12-12T10:00:00.000Z"
}
```

---

#### `GET /users`

Retrieve all users.

**Response:**

```json
[
  {
    "id": 1,
    "name": "EcoWarrior",
    "level": 3,
    "totalPoints": 450,
    "scansToday": 5,
    "joinedDate": "2025-12-01T10:00:00.000Z"
  }
]
```

---

#### `GET /users/:id`

Get specific user by ID.

**Response:**

```json
{
  "id": 1,
  "name": "EcoWarrior",
  "level": 3,
  "totalPoints": 450,
  "scansToday": 5,
  "joinedDate": "2025-12-01T10:00:00.000Z"
}
```

---

#### `PUT /users/:id`

Update user profile.

**Request:**

```json
{
  "name": "Updated Name",
  "level": 4,
  "total_points": 600,
  "scans_today": 10
}
```

---

#### `DELETE /users/:id`

Delete user account.

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

---

### Product Scanning APIs

#### `POST /analyze-product`

Upload and analyze product image.

**Request:**

- Content-Type: `multipart/form-data`
- Body:
  - `image`: Image file (max 10MB)
  - `userId`: User ID (optional)

**Response:**

```json
{
  "id": 42,
  "name": "Plastic Bottle",
  "brand": "Coca-Cola",
  "category": "Beverage Container",
  "barcode": "camera-scanned",
  "points": 52,
  "rating": 85,
  "description": "plastic bottle - Clear PET plastic beverage container",
  "scannedAt": "2025-12-12T10:30:00.000Z",
  "photoUri": "/uploads/1733998200000-123456789.jpg",
  "photoWidth": 0,
  "photoHeight": 0,
  "recyclability": "plastic",
  "suggestions": ["Rinse before recycling", "Remove cap and label"],
  "confidence": 85,
  "analysisMethod": "openai-vision-with-hsy",
  "objectMaterial": "plastic bottle",
  "wasteGuideMatch": {
    "id": "123",
    "title": "Plastic bottles",
    "synonyms": ["PET bottle", "beverage bottle"],
    "notes": "Rinse and flatten",
    "wasteTypes": [...],
    "recyclingMethods": [...],
    "instructions": "..."
  },
  "aiRecyclingAdvice": null,
  "alternativeAnswers": [
    {
      "itemName": "Glass Bottle",
      "material": "glass",
      "sortingExplanation": "If glass, dispose in glass recycling",
      "confidence": 60,
      "hsyMatchId": 456,
      "wasteGuideMatch": {...}
    },
    ...
  ]
}
```

---

#### `GET /users/:id/scans`

Get user's scan history.

**Response:**

```json
[
  {
    "id": 42,
    "name": "Plastic Bottle",
    "brand": "Coca-Cola",
    "category": "Beverage Container",
    "points": 52,
    "rating": 85,
    "scannedAt": "2025-12-12T10:30:00.000Z",
    "wasteGuideMatch": {...},
    "alternativeAnswers": [...]
  }
]
```

---

### HSY Waste Guide APIs (Debug/Testing)

#### `GET /hsy-cache`

View cached HSY waste guide items.

**Response:**

```json
{
  "success": true,
  "itemCount": 623,
  "items": [...],
  "cacheTimestamp": 1733998200000,
  "cacheAge": 3600000
}
```

---

#### `GET /hsy-test/:id`

Test specific HSY item by ID.

**Response:**

```json
{
  "success": true,
  "id": "123",
  "details": {
    "id": "123",
    "title": "Plastic bottles",
    "synonyms": ["PET bottle"],
    "wasteTypes": [...],
    "recyclingMethods": [...]
  }
}
```

---

#### `GET /hsy-search/:term`

Search HSY cache by keyword.

**Response:**

```json
{
  "success": true,
  "searchTerm": "plastic",
  "matchCount": 15,
  "matches": [...]
}
```

---

#### `GET /waste-guide`

Direct HSY API test endpoint.

---

#### `POST /waste-guide/search`

Test HSY matching with AI.

**Request:**

```json
{
  "searchTerm": "plastic bottle"
}
```

---

#### `GET /hsy-auth-test`

Verify HSY API credentials.

---

### Legacy/Demo APIs

#### `GET /items`

Get all items (legacy).

#### `POST /items`

Create item (legacy).

---

## 🔌 External Integrations

### 1. OpenAI GPT-4 Vision API

**Purpose:** AI-powered image analysis and product identification

**Configuration:**

```javascript
OPENAI_API_KEY=sk-...
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
```

**API Calls per Scan:**

- Call #1: Object material identification
- Call #2: Main product analysis (primary + 4 alternatives)
- Call #3: HSY matching for primary answer
- Call #4-7: HSY matching for each alternative
- Call #8 (optional): AI recycling advice (if no HSY match)

**Total:** 6-8 API calls per product scan

**Models Used:**

- `gpt-4o-mini` - Cost-effective, fast analysis

**Request Format:**

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Analyze this image..."
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,...",
            "detail": "high"
          }
        }
      ]
    }
  ],
  "max_tokens": 1500,
  "temperature": 0.4
}
```

---

### 2. HSY Waste Guide API (Helsinki Region Environmental Services)

**Purpose:** Official waste disposal guidelines for Finnish waste management

**Configuration:**

```javascript
HSY_CLIENT_ID=your_client_id
HSY_CLIENT_SECRET=your_client_secret
HSY_WASTE_API_URL=https://dev.klapi.hsy.fi/int2001/v1/waste-guide-api/waste-pages?lang=en
```

**Authentication:**

- Header-based authentication
- Client ID + Client Secret

**Cache Strategy:**

- In-memory cache
- 24-hour duration
- Auto-refresh on expiry
- ~600-650 waste items cached

**Endpoints Used:**

1. **List All Items:**

   - `GET /waste-pages?lang=en`
   - Returns: All waste categories with basic info
   - Pagination: Auto-handled with multiple strategies

2. **Item Details:**
   - `GET /waste-pages/:id?lang=en`
   - Returns: Full details for specific waste item
   - Includes: waste types, recycling methods, instructions

**Data Structure:**

```json
{
  "id": "123",
  "title": "Plastic bottles",
  "synonyms": ["PET bottle", "beverage bottle"],
  "notes": "Rinse and flatten before recycling",
  "wasteTypes": [
    {
      "id": "plastic",
      "title": "Plastic recycling",
      "description": "...",
      "informationPageUrl": "..."
    }
  ],
  "recyclingMethods": [
    {
      "id": "recycling-center",
      "title": "Recycling center",
      "description": "...",
      "isFree": true,
      "infoPageUrl": "..."
    }
  ]
}
```

---

## 🎮 Gamification System

### Points Calculation

```javascript
points = Math.floor(confidence / 2) + (hsyMatch ? 10 : 0);
```

- Base: Confidence score ÷ 2 (0-50 points)
- Bonus: +10 points if HSY match found
- Range: 0-60 points per scan

### Level Calculation

```javascript
level = Math.floor(totalPoints / 200) + 1;
```

- Every 200 points = 1 level
- Level 1: 0-199 points
- Level 2: 200-399 points
- Level 3: 400-599 points
- etc.

---

## 📦 File Storage

**Upload Directory:** `./uploads/`

**Naming Convention:** `{timestamp}-{random9digits}{extension}`

- Example: `1733998200000-123456789.jpg`

**Served As:** Static files via Express

- Route: `GET /uploads/:filename`
- Public access for frontend image display

---

## 🔐 Environment Variables

```bash
# Backend (.env)
PORT=3000
OPENAI_API_KEY=sk-...
HSY_CLIENT_ID=your_client_id
HSY_CLIENT_SECRET=your_client_secret
```

```typescript
// Frontend (api.ts)
const API_BASE_URL = "http://192.168.1.145:3000";
```

---

## 📊 Performance Considerations

### Caching Strategy

- **HSY Cache:** 24-hour in-memory cache reduces API calls
- **Image Storage:** Local filesystem for uploaded images
- **Database:** SQLite for fast local queries

### API Optimization

- **Batch Processing:** Multiple OpenAI calls in sequence (not parallel to avoid rate limits)
- **Pagination:** Smart HSY pagination with multiple format attempts
- **Deduplication:** Prevent duplicate HSY items in cache

### Scalability Limits

- **Current:** Single-instance server, SQLite database
- **Recommended for Production:**
  - PostgreSQL/MySQL for multi-user scalability
  - Redis for distributed caching
  - CDN for image serving
  - Load balancer for multiple server instances

---

## 📝 Notes

1. **AI Reasoning:** The system now includes AI reasoning for HSY matches, explaining exact vs material-based matching
2. **Alternative Answers:** Each scan provides 4 alternative interpretations with separate HSY matching
3. **Fallback System:** If no HSY match found, AI generates custom recycling advice
4. **Hazard Detection:** AI identifies potentially dangerous materials and provides warnings
5. **Multi-language:** HSY API supports `lang` parameter (en, fi, sv)

---

**Last Updated:** December 12, 2025
