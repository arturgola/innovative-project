# Backend API Integration for OpenAI Analysis

## Changes Made

### Backend Changes

1. **Added Dependencies**:

   - `multer`: For handling image file uploads
   - `axios`: For making HTTP requests to OpenAI API
   - `dotenv`: For environment variable management
   - `form-data`: For FormData handling

2. **Environment Configuration**:

   - Created `.env` file for storing OpenAI API key
   - Added environment variable loading with `dotenv`

3. **Database Schema**:

   - Added `product_scans` table to store all scan results with full OpenAI analysis data
   - Includes fields for user association, analysis results, image storage, and metadata

4. **Image Upload Handling**:

   - Configured `multer` for image file uploads to `uploads/` directory
   - Added file size limits (10MB) and proper file naming

5. **OpenAI Integration**:

   - Moved OpenAI API logic to backend server
   - Added helper functions for image analysis:
     - `analyzeObjectMaterial()`: Quick object and material identification
     - `analyzeProductImage()`: Full product analysis with eco-scoring
   - Secure API key handling on server side

6. **New API Endpoints**:
   - `POST /analyze-product`: Upload image and get AI analysis
   - `GET /users/:id/scans`: Get user's scan history
   - `GET /uploads/:filename`: Serve uploaded images

### Frontend Changes

1. **Updated API Service**:

   - Removed client-side OpenAI API calls
   - Updated `ApiService.analyzeProductImage()` to upload images to backend
   - Added `getUserScans()` method for fetching scan history
   - Improved error handling and fallback mechanisms

2. **Scan Screen Updates**:

   - Modified to use new backend API endpoint
   - Added user context integration for associating scans with users
   - Improved error handling with proper fallback for failed analyses

3. **App Context Updates**:
   - Updated `addScannedProduct()` to refresh user stats from backend
   - Backend now handles user stat updates automatically during scan

## Security Improvements

- OpenAI API key is now stored securely on the backend
- No sensitive API keys exposed in frontend code
- Image processing happens server-side

## Database Persistence

- All scan results are now stored in the database
- User scan history is preserved across sessions
- Images are stored on the server for future reference

## API Usage

### Analyze Product Image

```bash
POST /analyze-product
Content-Type: multipart/form-data

Fields:
- image: Image file (max 10MB)
- userId: (optional) User ID to associate scan with
```

### Get User Scan History

```bash
GET /users/:id/scans
```

## Setup Instructions

1. Add your OpenAI API key to `/backend/.env`:

   ```
   OPENAI_API_KEY=your-actual-openai-api-key-here
   ```

2. Backend will automatically create the `uploads/` directory for image storage

3. Database tables are created automatically on server start

## File Structure Changes

```
backend/
├── .env (new - contains OpenAI API key)
├── uploads/ (new - created automatically)
├── server.js (updated with OpenAI integration)
└── package.json (updated with new dependencies)

frontend/
├── services/api.ts (updated to use backend API)
├── components/scan-screen.tsx (updated to use new API)
└── contexts/app-context.tsx (updated for backend integration)
```
