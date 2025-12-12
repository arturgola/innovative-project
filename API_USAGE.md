# 🌐 EcoScan - API Usage Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Base Configuration](#base-configuration)
- [Authentication](#authentication)
- [User Management APIs](#user-management-apis)
- [Product Scanning APIs](#product-scanning-apis)
- [HSY Waste Guide APIs](#hsy-waste-guide-apis)
- [Error Handling](#error-handling)
- [Rate Limits & Best Practices](#rate-limits--best-practices)
- [Code Examples](#code-examples)

---

## 📝 Overview

The EcoScan API is a RESTful service that provides product scanning, user management, and waste guide integration. All endpoints return JSON responses.

**Base URL:** `http://192.168.1.145:3000` (configurable)

**Supported Methods:** GET, POST, PUT, DELETE

**Content Types:**

- `application/json` - Standard JSON requests/responses
- `multipart/form-data` - Image upload endpoint

---

## ⚙️ Base Configuration

### Frontend Configuration

```typescript
// frontend/services/api.ts
const API_BASE_URL = "http://192.168.1.145:3000";
```

### Backend Configuration

```javascript
// backend/.env
PORT=3000
OPENAI_API_KEY=sk-...
HSY_CLIENT_ID=your_client_id
HSY_CLIENT_SECRET=your_client_secret
```

### Starting the Server

```bash
# Backend
cd backend
npm install
npm run dev  # Development with nodemon
# or
npm start    # Production

# Frontend
cd frontend
npm install
npx expo start
```

---

## 🔐 Authentication

### Current Implementation

- **No authentication required** (development mode)
- User identification via `userId` parameter in requests

### Future Recommendations

For production deployment, implement:

- JWT tokens
- OAuth 2.0
- API keys
- Rate limiting per user

---

## 👤 User Management APIs

### 1. Create User

Create a new user account.

**Endpoint:** `POST /users`

**Request Body:**

```json
{
  "name": "EcoWarrior",
  "level": 1,
  "total_points": 0,
  "scans_today": 0
}
```

**Required Fields:**

- `name` (string, not empty)

**Optional Fields:**

- `level` (integer, default: 1)
- `total_points` (integer, default: 0)
- `scans_today` (integer, default: 0)

**Success Response:**

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

**Status Codes:**

- `200 OK` - User created successfully
- `400 Bad Request` - Invalid name (empty or missing)
- `500 Internal Server Error` - Database error

**Example (Frontend):**

```typescript
import { ApiService } from "./services/api";

const newUser = await ApiService.createUser({
  name: "EcoWarrior",
  level: 1,
  totalPoints: 0,
  scansToday: 0,
  joinedDate: new Date().toISOString(),
});

console.log(newUser);
// {id: 1, name: "EcoWarrior", ...}
```

**Example (cURL):**

```bash
curl -X POST http://192.168.1.145:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "EcoWarrior",
    "level": 1,
    "total_points": 0,
    "scans_today": 0
  }'
```

---

### 2. Get All Users

Retrieve list of all users.

**Endpoint:** `GET /users`

**Request:** No parameters required

**Success Response:**

```json
[
  {
    "id": 1,
    "name": "EcoWarrior",
    "level": 3,
    "totalPoints": 450,
    "scansToday": 5,
    "joinedDate": "2025-12-01T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "GreenHero",
    "level": 2,
    "totalPoints": 320,
    "scansToday": 3,
    "joinedDate": "2025-12-05T14:30:00.000Z"
  }
]
```

**Status Codes:**

- `200 OK` - Users retrieved successfully
- `500 Internal Server Error` - Database error

**Example (Frontend):**

```typescript
const users = await ApiService.getAllUsers();
console.log(`Found ${users.length} users`);
```

**Example (cURL):**

```bash
curl http://192.168.1.145:3000/users
```

---

### 3. Get User by ID

Retrieve specific user details.

**Endpoint:** `GET /users/:id`

**URL Parameters:**

- `id` (integer) - User ID

**Success Response:**

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

**Status Codes:**

- `200 OK` - User found
- `404 Not Found` - User does not exist
- `500 Internal Server Error` - Database error

**Example (Frontend):**

```typescript
const user = await ApiService.getUserById(1);
console.log(user.name); // "EcoWarrior"
```

**Example (cURL):**

```bash
curl http://192.168.1.145:3000/users/1
```

---

### 4. Update User

Update user profile information.

**Endpoint:** `PUT /users/:id`

**URL Parameters:**

- `id` (integer) - User ID

**Request Body:**

```json
{
  "name": "Updated Name",
  "level": 4,
  "total_points": 600,
  "scans_today": 10
}
```

**Required Fields:**

- `name` (string, not empty)

**Optional Fields:**

- `level` (integer)
- `total_points` (integer)
- `scans_today` (integer)

**Note:** Fields not provided will retain their current values.

**Success Response:**

```json
{
  "id": 1,
  "name": "Updated Name",
  "level": 4,
  "totalPoints": 600,
  "scansToday": 10,
  "joinedDate": "2025-12-01T10:00:00.000Z"
}
```

**Status Codes:**

- `200 OK` - User updated successfully
- `400 Bad Request` - Invalid name
- `404 Not Found` - User does not exist
- `500 Internal Server Error` - Database error

**Example (Frontend):**

```typescript
const updatedUser = await ApiService.updateUser(1, {
  name: "Updated Name",
  level: 4,
  total_points: 600,
});
```

**Example (cURL):**

```bash
curl -X PUT http://192.168.1.145:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "level": 4,
    "total_points": 600
  }'
```

---

### 5. Delete User

Delete a user account.

**Endpoint:** `DELETE /users/:id`

**URL Parameters:**

- `id` (integer) - User ID

**Success Response:**

```json
{
  "message": "User deleted successfully"
}
```

**Status Codes:**

- `200 OK` - User deleted
- `404 Not Found` - User does not exist
- `500 Internal Server Error` - Database error

**Example (Frontend):**

```typescript
await ApiService.deleteUser(1);
console.log("User deleted");
```

**Example (cURL):**

```bash
curl -X DELETE http://192.168.1.145:3000/users/1
```

---

## 📸 Product Scanning APIs

### 1. Analyze Product Image

Upload and analyze a product image using AI.

**Endpoint:** `POST /analyze-product`

**Content-Type:** `multipart/form-data`

**Form Fields:**

- `image` (file) - Image file (JPEG/PNG, max 10MB)
- `userId` (string, optional) - User ID for stat tracking

**File Requirements:**

- **Max Size:** 10 MB
- **Formats:** JPEG, PNG
- **Recommended:** 1000x1000px or higher for best AI analysis

**Success Response:**

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
  "recyclability": "PET plastic",
  "suggestions": [
    "Rinse container before recycling",
    "Remove cap and label if possible",
    "Flatten to save space"
  ],
  "confidence": 85,
  "analysisMethod": "openai-vision-with-hsy",
  "objectMaterial": "plastic bottle",
  "wasteGuideMatch": {
    "id": "123",
    "title": "Plastic bottles",
    "synonyms": ["PET bottle", "beverage bottle", "drink bottle"],
    "notes": "Rinse and flatten before recycling",
    "wasteTypes": [
      {
        "id": "plastic",
        "title": "Plastic recycling",
        "description": "Place in plastic recycling bin",
        "informationPageUrl": "https://..."
      }
    ],
    "recyclingMethods": [
      {
        "id": "recycling-bin",
        "title": "Plastic recycling bin",
        "description": "Yellow bin for plastic waste",
        "isFree": true,
        "infoPageUrl": "https://..."
      }
    ]
  },
  "aiRecyclingAdvice": null,
  "alternativeAnswers": [
    {
      "itemName": "Glass Bottle",
      "material": "glass",
      "sortingExplanation": "If made of glass, place in glass recycling",
      "confidence": 60,
      "hsyMatchId": 456,
      "wasteGuideMatch": {
        "id": "456",
        "title": "Glass bottles",
        "synonyms": ["glass container"],
        "wasteTypes": [...],
        "recyclingMethods": [...]
      }
    },
    {
      "itemName": "Aluminum Can",
      "material": "aluminum",
      "sortingExplanation": "If metal can, place in metal recycling",
      "confidence": 50,
      "hsyMatchId": 789,
      "wasteGuideMatch": {...}
    },
    {
      "itemName": "Tetra Pak Carton",
      "material": "cardboard composite",
      "sortingExplanation": "If carton packaging, special recycling",
      "confidence": 40,
      "hsyMatchId": 101,
      "wasteGuideMatch": {...}
    },
    {
      "itemName": "Reusable Container",
      "material": "reusable plastic",
      "sortingExplanation": "If reusable, clean and reuse",
      "confidence": 30,
      "hsyMatchId": null,
      "wasteGuideMatch": null
    }
  ]
}
```

**Response Fields Explained:**

| Field                | Type    | Description                           |
| -------------------- | ------- | ------------------------------------- |
| `id`                 | integer | Unique scan ID                        |
| `name`               | string  | Product name identified by AI         |
| `brand`              | string  | Brand name (if visible)               |
| `category`           | string  | Product category                      |
| `barcode`            | string  | "camera-scanned" for image scans      |
| `points`             | integer | Points earned (0-60)                  |
| `rating`             | number  | Confidence score (0-100)              |
| `description`        | string  | Full description with material info   |
| `scannedAt`          | string  | ISO timestamp                         |
| `photoUri`           | string  | Relative path to uploaded image       |
| `recyclability`      | string  | Material type                         |
| `suggestions`        | array   | Recycling tips                        |
| `confidence`         | number  | AI confidence percentage              |
| `analysisMethod`     | string  | Analysis method used                  |
| `objectMaterial`     | string  | Short material description            |
| `wasteGuideMatch`    | object  | HSY waste guide details (if found)    |
| `aiRecyclingAdvice`  | object  | AI-generated advice (if no HSY match) |
| `alternativeAnswers` | array   | 4 alternative interpretations         |

**Error Response (Analysis Failed):**

```json
{
  "error": "Analysis failed",
  "fallback": {
    "id": 1733998200000,
    "name": "Scanned Product",
    "brand": "Unknown Brand",
    "category": "General Item",
    "barcode": "camera-scanned",
    "points": 35,
    "rating": 0,
    "description": "Product scanned via camera. AI analysis unavailable.",
    "scannedAt": "2025-12-12T10:30:00.000Z",
    "analysisMethod": "basic"
  }
}
```

**Status Codes:**

- `200 OK` - Analysis completed successfully
- `400 Bad Request` - No image file provided
- `500 Internal Server Error` - Analysis failed (returns fallback)

**Example (Frontend - React Native):**

```typescript
import { ApiService } from "./services/api";

// After capturing image with Expo Camera
const photoUri = "file:///path/to/image.jpg";
const userId = 1;

try {
  const result = await ApiService.analyzeProductImage(photoUri, userId);

  console.log("Product:", result.name);
  console.log("Points earned:", result.points);
  console.log("HSY Match:", result.wasteGuideMatch?.title);
  console.log("Alternatives:", result.alternativeAnswers.length);

  // Navigate to product details screen
  navigation.navigate("Product", { product: result });
} catch (error) {
  console.error("Analysis failed:", error);
  Alert.alert("Error", "Failed to analyze product");
}
```

**Example (cURL):**

```bash
curl -X POST http://192.168.1.145:3000/analyze-product \
  -F "image=@/path/to/image.jpg" \
  -F "userId=1"
```

**Example (Fetch API):**

```javascript
const formData = new FormData();
formData.append("image", {
  uri: imageUri,
  type: "image/jpeg",
  name: "product.jpg",
});
formData.append("userId", "1");

const response = await fetch("http://192.168.1.145:3000/analyze-product", {
  method: "POST",
  body: formData,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

const result = await response.json();
```

---

### 2. Get User Scan History

Retrieve all scans for a specific user.

**Endpoint:** `GET /users/:id/scans`

**URL Parameters:**

- `id` (integer) - User ID

**Success Response:**

```json
[
  {
    "id": 42,
    "name": "Plastic Bottle",
    "brand": "Coca-Cola",
    "category": "Beverage Container",
    "barcode": "camera-scanned",
    "points": 52,
    "rating": 85,
    "description": "plastic bottle - ...",
    "recyclability": "PET plastic",
    "suggestions": [...],
    "confidence": 85,
    "analysisMethod": "openai-vision-with-hsy",
    "objectMaterial": "plastic bottle",
    "wasteGuideMatch": {...},
    "aiRecyclingAdvice": null,
    "alternativeAnswers": [...],
    "photoUri": "/uploads/1733998200000-123456789.jpg",
    "photoWidth": 0,
    "photoHeight": 0,
    "scannedAt": "2025-12-12T10:30:00.000Z"
  },
  {
    "id": 41,
    "name": "Metal Can",
    "brand": "Unknown",
    "category": "Food Container",
    "points": 45,
    "rating": 80,
    "scannedAt": "2025-12-12T09:15:00.000Z",
    ...
  }
]
```

**Sorting:** Results are ordered by `created_at DESC` (newest first)

**Status Codes:**

- `200 OK` - Scans retrieved successfully
- `500 Internal Server Error` - Database error

**Example (Frontend):**

```typescript
const scans = await ApiService.getUserScans(1);
console.log(`User has ${scans.length} scans`);

// Display in UI
scans.forEach((scan) => {
  console.log(`${scan.name} - ${scan.points} points`);
});
```

**Example (cURL):**

```bash
curl http://192.168.1.145:3000/users/1/scans
```

---

### 3. Get Uploaded Images

Access uploaded product images.

**Endpoint:** `GET /uploads/:filename`

**URL Parameters:**

- `filename` (string) - Image filename from `photoUri`

**Example:**

```
GET /uploads/1733998200000-123456789.jpg
```

**Response:** Image file (JPEG/PNG)

**Status Codes:**

- `200 OK` - Image found
- `404 Not Found` - Image does not exist

**Example (Frontend - Display Image):**

```typescript
import { Image } from "react-native";

const photoUri = `${API_BASE_URL}/uploads/1733998200000-123456789.jpg`;

<Image source={{ uri: photoUri }} style={{ width: 300, height: 300 }} />;
```

---

## ♻️ HSY Waste Guide APIs

These APIs are primarily for debugging and testing the HSY integration.

### 1. View HSY Cache

Inspect the cached HSY waste guide data.

**Endpoint:** `GET /hsy-cache`

**Success Response:**

```json
{
  "success": true,
  "itemCount": 623,
  "items": [
    {
      "id": "123",
      "title": "Plastic bottles",
      "synonyms": ["PET bottle", "beverage bottle"]
    },
    ...622 more items
  ],
  "cacheTimestamp": 1733998200000,
  "cacheAge": 3600000
}
```

**Response Fields:**

- `success` (boolean) - Operation status
- `itemCount` (integer) - Number of cached items
- `items` (array) - All cached waste guide items
- `cacheTimestamp` (number) - Cache creation time (ms)
- `cacheAge` (number) - Age in milliseconds

**Status Codes:**

- `200 OK` - Cache retrieved
- `500 Internal Server Error` - Cache unavailable

**Example (cURL):**

```bash
curl http://192.168.1.145:3000/hsy-cache
```

---

### 2. Test HSY Item by ID

Fetch full details for a specific HSY waste guide item.

**Endpoint:** `GET /hsy-test/:id`

**URL Parameters:**

- `id` (string) - HSY waste guide item ID

**Success Response:**

```json
{
  "success": true,
  "id": "123",
  "details": {
    "id": "123",
    "title": "Plastic bottles",
    "synonyms": ["PET bottle", "beverage bottle"],
    "notes": "Rinse and flatten before recycling",
    "wasteTypes": [
      {
        "id": "plastic",
        "title": "Plastic recycling",
        "description": "Place in yellow recycling bin"
      }
    ],
    "recyclingMethods": [
      {
        "id": "recycling-bin",
        "title": "Plastic recycling bin",
        "description": "Yellow bin for plastic waste",
        "isFree": true,
        "infoPageUrl": "https://..."
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK` - Item found
- `500 Internal Server Error` - HSY API error

**Example (cURL):**

```bash
curl http://192.168.1.145:3000/hsy-test/123
```

---

### 3. Search HSY Cache

Search cached items by keyword.

**Endpoint:** `GET /hsy-search/:term`

**URL Parameters:**

- `term` (string) - Search keyword

**Success Response:**

```json
{
  "success": true,
  "searchTerm": "plastic",
  "matchCount": 15,
  "matches": [
    {
      "id": "123",
      "title": "Plastic bottles",
      "synonyms": ["PET bottle", "beverage bottle"]
    },
    {
      "id": "124",
      "title": "Plastic bags",
      "synonyms": ["shopping bag", "carrier bag"]
    },
    ...10 more matches (limited to first 10)
  ]
}
```

**Search Logic:**

- Case-insensitive
- Searches both `title` and `synonyms` fields
- Returns maximum 10 results

**Status Codes:**

- `200 OK` - Search completed
- `500 Internal Server Error` - Search failed

**Example (cURL):**

```bash
curl http://192.168.1.145:3000/hsy-search/plastic
```

---

### 4. Test Waste Guide API

Test direct connection to HSY API.

**Endpoint:** `GET /waste-guide`

**Success Response:**

```json
{
  "success": true,
  "itemCount": 20,
  "totalResults": 623,
  "items": [
    {
      "id": "123",
      "title": "Plastic bottles",
      "synonyms": [...]
    },
    ...first 5 items as sample
  ],
  "responseStructure": ["total", "hits", "page", ...]
}
```

**Status Codes:**

- `200 OK` - HSY API accessible
- `500 Internal Server Error` - Connection failed

---

### 5. Search Waste Guide with AI

Test AI-powered matching with HSY database.

**Endpoint:** `POST /waste-guide/search`

**Request Body:**

```json
{
  "searchTerm": "plastic bottle"
}
```

**Success Response:**

```json
{
  "success": true,
  "searchTerm": "plastic bottle",
  "matchId": 123,
  "match": {
    "id": "123",
    "title": "Plastic bottles",
    "synonyms": ["PET bottle", "beverage bottle"],
    "wasteTypes": [...],
    "recyclingMethods": [...]
  }
}
```

**Response (No Match):**

```json
{
  "success": true,
  "searchTerm": "unknown item",
  "matchId": null,
  "match": null
}
```

**Status Codes:**

- `200 OK` - Search completed
- `400 Bad Request` - Missing searchTerm
- `500 Internal Server Error` - Search failed

**Example (cURL):**

```bash
curl -X POST http://192.168.1.145:3000/waste-guide/search \
  -H "Content-Type: application/json" \
  -d '{"searchTerm": "plastic bottle"}'
```

---

### 6. Test HSY Authentication

Verify HSY API credentials.

**Endpoint:** `GET /hsy-auth-test`

**Success Response:**

```json
{
  "success": true,
  "message": "HSY authentication headers configured successfully",
  "authMethod": "Client ID/Secret Headers",
  "clientId": "your_client_id",
  "headers": {
    "Content-Type": "application/json",
    "client_id": "your_client_id",
    "client_secret": "abc123..."
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "HSY credentials not configured...",
  "authMethod": "Client ID/Secret Headers",
  "missingCredentials": {
    "clientId": true,
    "clientSecret": false
  }
}
```

**Status Codes:**

- `200 OK` - Credentials configured
- `500 Internal Server Error` - Missing credentials

---

## ⚠️ Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Code | Meaning               | Typical Causes                        |
| ---- | --------------------- | ------------------------------------- |
| 200  | OK                    | Request successful                    |
| 400  | Bad Request           | Missing required fields, invalid data |
| 404  | Not Found             | Resource does not exist               |
| 500  | Internal Server Error | Database error, external API failure  |

### Frontend Error Handling Pattern

```typescript
try {
  const result = await ApiService.someMethod();
  // Handle success
} catch (error) {
  console.error("API Error:", error);

  if (error.message.includes("Failed to fetch")) {
    // Network error - server unreachable
    Alert.alert("Network Error", "Cannot connect to server");
  } else if (error.message.includes("404")) {
    // Resource not found
    Alert.alert("Not Found", "Resource does not exist");
  } else {
    // Other errors
    Alert.alert("Error", error.message);
  }
}
```

---

## 🚦 Rate Limits & Best Practices

### Current Limits

**No rate limiting implemented** in development mode.

### Recommended for Production

```javascript
// Example: 100 requests per 15 minutes per IP
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later",
});

app.use("/analyze-product", limiter);
```

### Best Practices

1. **Image Upload**

   - Resize images client-side before upload
   - Compress to reduce transfer time
   - Recommended max: 2000x2000px, 2MB

2. **Caching**

   - HSY cache is auto-managed (24h)
   - Frontend should cache user data locally
   - Use React Query or similar for automatic caching

3. **Error Handling**

   - Always handle network errors
   - Implement retry logic for failed requests
   - Show user-friendly error messages

4. **Performance**
   - Debounce search requests
   - Use pagination for large lists
   - Lazy load images

---

## 💻 Code Examples

### Complete Frontend Integration

```typescript
// services/api.ts
import { UserProfile, ProductAnalysisResult } from "../types";

const API_BASE_URL = "http://192.168.1.145:3000";

export class ApiService {
  // Create new user
  static async createUser(
    userData: Omit<UserProfile, "id">
  ): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create user");
    }

    return await response.json();
  }

  // Analyze product image
  static async analyzeProductImage(
    imageUri: string,
    userId?: number
  ): Promise<ProductAnalysisResult> {
    const formData = new FormData();

    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "product-image.jpg",
    } as any);

    if (userId) {
      formData.append("userId", userId.toString());
    }

    const response = await fetch(`${API_BASE_URL}/analyze-product`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to analyze image");
    }

    const result = await response.json();

    // Convert relative photoUri to absolute URL
    if (result.photoUri && !result.photoUri.startsWith("http")) {
      result.photoUri = `${API_BASE_URL}${result.photoUri}`;
    }

    return result;
  }

  // Get user scan history
  static async getUserScans(userId: number): Promise<ProductAnalysisResult[]> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/scans`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch scans");
    }

    const scans = await response.json();

    // Convert relative URIs to absolute
    return scans.map((scan: ProductAnalysisResult) => ({
      ...scan,
      photoUri:
        scan.photoUri && !scan.photoUri.startsWith("http")
          ? `${API_BASE_URL}${scan.photoUri}`
          : scan.photoUri,
    }));
  }
}
```

### Complete Scan Flow Example

```typescript
// components/scan-screen.tsx
import React, { useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ApiService } from "../services/api";
import { useAppContext } from "../contexts/app-context";

export function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { userProfile, addScannedProduct } = useAppContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    setIsAnalyzing(true);

    try {
      // 1. Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      // 2. Analyze with backend
      const result = await ApiService.analyzeProductImage(
        photo.uri,
        userProfile.id
      );

      // 3. Add to history
      addScannedProduct(result);

      // 4. Navigate to results
      router.push("/product");
    } catch (error) {
      console.error("Scan failed:", error);
      Alert.alert("Error", "Failed to analyze product. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera}>
        <Button
          title={isAnalyzing ? "Analyzing..." : "Capture"}
          onPress={handleCapture}
          disabled={isAnalyzing}
        />
      </CameraView>
    </View>
  );
}
```

---

## 🔗 Related Documentation

- [Project Architecture](./PROJECT_ARCHITECTURE.md) - System design and components
- [Data Flow Diagram](./DATA_FLOW_DIAGRAM.md) - Detailed flow diagrams
- [README.md](./readme.md) - Setup and installation guide

---

**Last Updated:** December 12, 2025
