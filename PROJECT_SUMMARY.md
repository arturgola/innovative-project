# 📚 EcoScan - Complete Project Documentation

## 🎯 Quick Navigation

- **[Project Architecture](./PROJECT_ARCHITECTURE.md)** - System architecture, diagrams, and technical stack
- **[Data Flow Diagrams](./DATA_FLOW_DIAGRAM.md)** - Detailed data flow and processing pipelines
- **[API Usage Guide](./API_USAGE.md)** - Complete API reference and examples
- **[Setup Guide](./readme.md)** - Installation and running instructions

---

## 📝 Project Overview

**EcoScan** is an AI-powered mobile application that helps users identify products through camera scanning and provides accurate recycling and disposal guidance. The system combines advanced computer vision (OpenAI GPT-4 Vision) with official waste management data (HSY Waste Guide API) to deliver comprehensive environmental impact information.

### 🎯 Key Features

✅ **Smart Product Scanning** - AI-powered image recognition  
✅ **Material Identification** - Automatic material type detection  
✅ **Recycling Guidance** - Official disposal instructions from HSY database  
✅ **Alternative Analysis** - Multiple interpretations for ambiguous items  
✅ **User Gamification** - Points, levels, and progress tracking  
✅ **Scan History** - Complete history of all analyzed products  
✅ **Offline Capability** - Cached waste guide for faster responses

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP                           │
│              React Native + Expo Router                 │
│                                                         │
│  • Camera Integration (Expo Camera)                    │
│  • User Interface (React Native Components)            │
│  • State Management (React Context API)                │
│  • Navigation (Expo Router - File-based)               │
└────────────────────┬────────────────────────────────────┘
                     │ REST API (HTTP/JSON)
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   BACKEND SERVER                        │
│                 Node.js + Express.js                    │
│                                                         │
│  • File Upload (Multer)                                │
│  • Image Processing (Base64 conversion)                │
│  • AI Integration (OpenAI GPT-4 Vision)                │
│  • Waste Guide Integration (HSY API)                   │
│  • In-Memory Caching (24-hour cache)                   │
│  • Database Management (SQLite3)                       │
└────────────────────┬───────────────┬────────────────────┘
                     │               │
          ┌──────────┘               └──────────┐
          ↓                                     ↓
┌─────────────────────┐              ┌─────────────────────┐
│   OpenAI GPT-4 API  │              │   HSY Waste Guide   │
│                     │              │   (Finnish API)     │
│  • Vision Analysis  │              │                     │
│  • Product ID       │              │  • 600+ Items       │
│  • Material Detection│             │  • Disposal Methods │
│  • HSY Matching     │              │  • Waste Categories │
│  • Recycling Advice │              │                     │
└─────────────────────┘              └─────────────────────┘
```

---

## 🔄 Core Data Flow

### Product Scanning Pipeline

```
1. User Captures Image
   ↓
2. Upload to Backend (multipart/form-data)
   ↓
3. Load HSY Waste Guide Cache (600+ items)
   ↓
4. AI Analysis #1: Identify Material
   → "plastic bottle"
   ↓
5. AI Analysis #2: Full Product Analysis
   → Primary Answer + 4 Alternatives
   ↓
6. AI Analysis #3-7: HSY Matching for Each
   → Match with waste guide database
   ↓
7. Fetch Complete HSY Details
   → Waste types, recycling methods
   ↓
8. Calculate Points & Level
   → points = confidence/2 + HSY bonus
   ↓
9. Save to Database
   → product_scans + update user stats
   ↓
10. Return Complete Analysis
    → Display results to user
```

**Total Processing Time:** 10-20 seconds  
**OpenAI API Calls:** 6-8 per scan  
**Database Writes:** 2 (scan record + user update)

---

## 💾 Database Schema

### Tables

#### 1. **users**

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  scans_today INTEGER DEFAULT 0,
  joined_date TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields:**

- `level` = floor(total_points / 200) + 1
- `total_points` = cumulative points from all scans
- `scans_today` = daily scan counter

#### 2. **product_scans**

```sql
CREATE TABLE product_scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,  -- FK to users
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  barcode TEXT,
  points INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  description TEXT,
  recyclability TEXT,
  suggestions TEXT,  -- JSON array
  confidence REAL DEFAULT 0,
  analysis_method TEXT DEFAULT 'openai-vision',
  object_material TEXT,
  waste_guide_match TEXT,  -- JSON object (HSY data)
  ai_recycling_advice TEXT,
  is_dangerous INTEGER DEFAULT 0,
  danger_warning TEXT,
  general_tips TEXT,  -- JSON array
  alternative_answers TEXT,  -- JSON array
  image_path TEXT,
  photo_width INTEGER,
  photo_height INTEGER,
  scanned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

**Key Features:**

- Stores complete AI analysis results
- HSY waste guide match data (JSON)
- Alternative interpretations (up to 4)
- Full image metadata

---

## 🌐 API Endpoints Summary

### User Management

| Method | Endpoint     | Description         |
| ------ | ------------ | ------------------- |
| POST   | `/users`     | Create new user     |
| GET    | `/users`     | Get all users       |
| GET    | `/users/:id` | Get user by ID      |
| PUT    | `/users/:id` | Update user profile |
| DELETE | `/users/:id` | Delete user         |

### Product Scanning

| Method | Endpoint             | Description                           |
| ------ | -------------------- | ------------------------------------- |
| POST   | `/analyze-product`   | Analyze product image (main endpoint) |
| GET    | `/users/:id/scans`   | Get user's scan history               |
| GET    | `/uploads/:filename` | Access uploaded images                |

### HSY Waste Guide (Debug/Testing)

| Method | Endpoint              | Description             |
| ------ | --------------------- | ----------------------- |
| GET    | `/hsy-cache`          | View cached waste guide |
| GET    | `/hsy-test/:id`       | Test specific HSY item  |
| GET    | `/hsy-search/:term`   | Search cached items     |
| GET    | `/waste-guide`        | Test HSY API connection |
| POST   | `/waste-guide/search` | AI-powered HSY search   |
| GET    | `/hsy-auth-test`      | Verify HSY credentials  |

---

## 🔌 External API Integrations

### 1. OpenAI GPT-4 Vision API

**Purpose:** Product identification, material analysis, HSY matching

**Configuration:**

```bash
OPENAI_API_KEY=sk-...
```

**API Calls per Scan:**

1. Material identification (1 call)
2. Primary + alternatives analysis (1 call)
3. HSY matching for primary (1 call)
4. HSY matching for 4 alternatives (4 calls)
5. AI recycling advice fallback (1 call, if needed)

**Total:** 6-8 calls per scan

**Model:** `gpt-4o-mini` (cost-effective)

**Request Format:**

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "Analyze..." },
        {
          "type": "image_url",
          "image_url": { "url": "data:image/jpeg;base64,..." }
        }
      ]
    }
  ],
  "max_tokens": 1500,
  "temperature": 0.4
}
```

---

### 2. HSY Waste Guide API

**Purpose:** Official Finnish waste management guidelines

**Configuration:**

```bash
HSY_CLIENT_ID=your_client_id
HSY_CLIENT_SECRET=your_client_secret
```

**Base URL:**

```
https://dev.klapi.hsy.fi/int2001/v1/waste-guide-api/
```

**Endpoints Used:**

- `GET /waste-pages?lang=en` - List all items (paginated)
- `GET /waste-pages/:id?lang=en` - Item details

**Authentication:** Header-based (client_id + client_secret)

**Cache Strategy:**

- In-memory cache (24-hour validity)
- ~600-650 items cached
- Auto-refresh on expiry
- Pagination handling (multiple URL patterns tested)

**Data Structure:**

```json
{
  "id": "123",
  "title": "Plastic bottles",
  "synonyms": ["PET bottle", "beverage bottle"],
  "notes": "Rinse and flatten",
  "wasteTypes": [{...}],
  "recyclingMethods": [{...}]
}
```

---

## 🎮 Gamification System

### Points Calculation

```javascript
points = Math.floor(confidence / 2) + (hsyMatch ? 10 : 0);
```

**Range:** 0-60 points per scan

- Base: confidence score ÷ 2 (0-50 points)
- Bonus: +10 if HSY match found

### Level Progression

```javascript
level = Math.floor(totalPoints / 200) + 1;
```

**Examples:**

- 0-199 points → Level 1
- 200-399 points → Level 2
- 400-599 points → Level 3
- 600-799 points → Level 4

---

## 📱 Frontend Structure

### File-Based Routing (Expo Router)

```
app/
├── _layout.tsx              # Root layout
├── greeting.tsx             # Onboarding
├── (tabs)/
│   ├── _layout.tsx         # Tab navigation
│   ├── index.tsx           # Home (Main Menu)
│   └── explore.tsx         # Statistics
├── scan.tsx                # Camera scanning
├── product.tsx             # Analysis results
├── success.tsx             # Success confirmation
└── user-profile.tsx        # Profile management
```

### Key Components

```
components/
├── greeting-screen.tsx      # Welcome UI
├── main-menu.tsx           # Dashboard with stats
├── scan-screen.tsx         # Camera interface
├── product-details.tsx     # Results display
├── statistics-screen.tsx   # History & charts
├── success-screen.tsx      # Success feedback
├── user-profile.tsx        # Profile editor
└── ui/                     # Reusable UI elements
```

### Global State (Context API)

```typescript
interface AppState {
  currentProduct: Product | null;
  scannedProducts: Product[];
  userProfile: UserProfile;
  isLoadingUser: boolean;
  hasUser: boolean;

  setCurrentProduct: (product: Product | null) => void;
  addScannedProduct: (product: Product) => void;
  setUserProfile: (profile: UserProfile) => void;
  createNewUser: (name: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}
```

---

## 🛠️ Technology Stack

### Frontend

- **React Native** 0.81.4
- **Expo** ^54.0.13
- **Expo Router** ^6.0.11 (file-based navigation)
- **TypeScript** ~5.9.2
- **Expo Camera** ^17.0.8
- **React Navigation** ^7.1.8

### Backend

- **Node.js** (latest)
- **Express.js** ^5.1.0
- **SQLite3** ^5.1.7
- **Multer** ^2.0.2 (file uploads)
- **Axios** ^1.12.2 (HTTP client)
- **dotenv** ^17.2.3
- **CORS** ^2.8.5

### External Services

- **OpenAI GPT-4 Vision API** - AI analysis
- **HSY Waste Guide API** - Waste management data

---

## 📊 Performance Metrics

### Typical Scan Timeline

```
Image Upload:              1-2 seconds
HSY Cache Load:           <0.01s (cached) / 10-15s (fresh)
Material Analysis:         1-2 seconds
Main Product Analysis:     2-3 seconds
HSY Matching (Primary):    1-2 seconds
Alternatives (4x):         4-8 seconds
Fetch HSY Details:         0.5-1 second
Database Save:            <0.1 second
──────────────────────────────────────
Total Time:               10-20 seconds
```

### Data Sizes

```
Image Upload:              2-5 MB
Base64 Encoded:           4-7 MB
OpenAI Request:           4-7 MB
OpenAI Response:          1-3 KB
HSY Cache:                ~100 KB (simplified)
Database Record:          5-10 KB
```

### Resource Usage

```
OpenAI API Calls:         6-8 per scan
Database Writes:          2 per scan
Network Transfer:         5-10 MB per scan
Storage per Scan:         2-5 MB (image + DB)
```

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required
- Node.js 16+
- npm or yarn
- Expo CLI
- Mobile device or simulator

# For Backend
- OpenAI API key
- HSY API credentials
```

### Installation

1. **Clone Repository**

```bash
git clone <repository-url>
cd innovative-project
```

2. **Backend Setup**

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=3000
OPENAI_API_KEY=sk-...
HSY_CLIENT_ID=your_client_id
HSY_CLIENT_SECRET=your_client_secret
EOF

# Start server
npm run dev
```

3. **Frontend Setup**

```bash
cd frontend
npm install

# Update API URL in services/api.ts
# Change to your backend IP address

# Start Expo
npx expo start
```

4. **Run on Device**

- Scan QR code with Expo Go app
- Or use iOS Simulator / Android Emulator

---

## 🔒 Security Considerations

### Current Implementation (Development)

- No authentication
- No rate limiting
- API keys in environment variables
- File uploads accepted without validation

### Production Recommendations

1. **Authentication**

   - Implement JWT tokens
   - OAuth 2.0 for user login
   - API key authentication for mobile apps

2. **Rate Limiting**

   ```javascript
   const rateLimit = require("express-rate-limit");
   app.use(
     "/analyze-product",
     rateLimit({
       windowMs: 15 * 60 * 1000,
       max: 100,
     })
   );
   ```

3. **File Validation**

   - Validate file types (MIME types)
   - Scan for malware
   - Limit file sizes
   - Sanitize filenames

4. **Data Protection**

   - Encrypt sensitive data
   - Use HTTPS only
   - Implement CORS properly
   - Sanitize user inputs

5. **API Key Management**
   - Use secrets manager (AWS Secrets Manager, etc.)
   - Rotate keys regularly
   - Monitor API usage

---

## 📈 Scalability Recommendations

### Current Limitations

- **Database:** SQLite (single file, not ideal for concurrent writes)
- **File Storage:** Local filesystem (not scalable)
- **Cache:** In-memory (lost on restart, not distributed)
- **Server:** Single instance (no load balancing)

### Production Architecture

```
┌─────────────────┐
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌────────┐
│ Server │ │ Server │  (Multiple instances)
│   #1   │ │   #2   │
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         ↓
┌─────────────────┐
│   PostgreSQL    │  (Production database)
│   + Read Replica│
└─────────────────┘

┌─────────────────┐
│     Redis       │  (Distributed cache)
└─────────────────┘

┌─────────────────┐
│    S3/CDN       │  (Image storage)
└─────────────────┘
```

**Recommended Changes:**

1. **Database:** PostgreSQL or MySQL
2. **Cache:** Redis (distributed)
3. **File Storage:** AWS S3, Google Cloud Storage, or Azure Blob
4. **CDN:** CloudFront for image delivery
5. **Monitoring:** New Relic, Datadog, or similar
6. **Logging:** Centralized logging (ELK stack)

---

## 🧪 Testing Recommendations

### Current Status

- No automated tests implemented

### Recommended Testing Strategy

1. **Unit Tests** (Jest)

   ```javascript
   // Example: calculateLevel function
   test("calculates level correctly", () => {
     expect(calculateLevel(0)).toBe(1);
     expect(calculateLevel(199)).toBe(1);
     expect(calculateLevel(200)).toBe(2);
     expect(calculateLevel(450)).toBe(3);
   });
   ```

2. **Integration Tests** (Supertest)

   ```javascript
   // Example: User creation
   test("POST /users creates new user", async () => {
     const res = await request(app)
       .post("/users")
       .send({ name: "Test User" })
       .expect(200);

     expect(res.body).toHaveProperty("id");
     expect(res.body.name).toBe("Test User");
   });
   ```

3. **E2E Tests** (Detox for React Native)
   ```javascript
   test("should scan product successfully", async () => {
     await element(by.id("scan-button")).tap();
     await element(by.id("capture-button")).tap();
     await waitFor(element(by.id("product-details")))
       .toBeVisible()
       .withTimeout(20000);
   });
   ```

---

## 📚 Documentation Files

This documentation suite consists of:

### 1. **PROJECT_ARCHITECTURE.md**

- System architecture diagrams
- Technology stack details
- Component descriptions
- Database schema
- External integrations
- Performance considerations

### 2. **DATA_FLOW_DIAGRAM.md**

- Complete data flow pipelines
- Step-by-step processing flows
- User authentication flow
- Scan history retrieval
- HSY cache management
- Error handling flows
- Performance metrics

### 3. **API_USAGE.md**

- Complete API reference
- Request/response examples
- Error handling
- Rate limits
- Code examples
- Integration patterns

### 4. **README.md**

- Quick start guide
- Installation instructions
- Project structure
- How to run
- Development guidelines

---

## 🤝 Contributing

### Development Workflow

1. **Feature Branch**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes**

   - Follow existing code style
   - Add comments for complex logic
   - Update documentation

3. **Test**

   - Test locally
   - Verify API endpoints
   - Check mobile app functionality

4. **Commit**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push & PR**
   ```bash
   git push origin feature/new-feature
   # Create Pull Request on GitHub
   ```

---

## 📝 License

This project is licensed under the ISC License.

---

## 📧 Support

For questions or issues:

1. Check the documentation files
2. Review API examples
3. Check console logs for errors
4. Open an issue on GitHub

---

**Documentation Version:** 1.0  
**Last Updated:** December 12, 2025  
**Project Status:** Development/MVP

---

## 🎯 Future Roadmap

### Planned Features

- [ ] Barcode scanning support
- [ ] Product database integration
- [ ] Social features (sharing, challenges)
- [ ] Weekly/monthly statistics
- [ ] Achievement badges
- [ ] Multi-language support
- [ ] Offline mode improvements
- [ ] AR recycling instructions
- [ ] Community waste sorting tips

### Technical Improvements

- [ ] Add automated tests
- [ ] Implement authentication
- [ ] Set up CI/CD pipeline
- [ ] Migrate to PostgreSQL
- [ ] Add Redis caching
- [ ] Implement rate limiting
- [ ] Add monitoring/alerting
- [ ] Optimize image processing
- [ ] Add request validation
- [ ] Improve error handling

---

**Happy Scanning! 🌱♻️**
