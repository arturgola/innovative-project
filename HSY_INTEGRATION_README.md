# HSY Waste Guide API Integration

## Overview

The backend server now integrates with the HSY (Helsinki Region Environmental Services Authority) Waste Guide API to provide accurate waste disposal information for scanned products.

## Configuration

### Environment Variables

Add the following to your `backend/.env` file:

```env
# HSY Waste Guide API Configuration
HSY_CLIENT_ID=your_client_id_here
HSY_CLIENT_SECRET=your_client_secret_here
```

### Authentication Setup

The HSY API uses custom header authentication:

1. Contact HSY to obtain API credentials (Client ID and Client Secret)
2. Update the `.env` file with your credentials:
   ```env
   HSY_CLIENT_ID=your_actual_client_id
   HSY_CLIENT_SECRET=your_actual_client_secret
   ```
3. The system will automatically include these as headers in API requests
4. Restart the server after updating the environment variables

### Authentication Method

The system sends credentials as custom headers with each request:

```
client_id: your_client_id
client_secret: your_client_secret
```

This matches the HSY API curl example:

```bash
curl "http://dev.klapi.hsy.fi/openapi/v1/jateopas/resurssi1" \
  -H "client_id:1234" \
  -H "client_secret:abcd"
```

## How It Works

1. **Image Analysis**: User uploads an image via the `/analyze-product` endpoint
2. **OpenAI Processing**: The image is analyzed using OpenAI's GPT-4 Vision to identify the product and material
3. **HSY Matching**: The AI response is used to search the HSY waste guide database
4. **Result Matching**: The system finds the best matching waste disposal item based on:
   - Product name similarity
   - Material type matching
   - Category alignment
   - Word-by-word analysis

## API Endpoints

### Main Product Analysis

```
POST /analyze-product
```

Now returns waste guide match information in the response:

```json
{
  "id": 123,
  "name": "Plastic Bottle",
  "wasteGuideMatch": {
    "title": "Plastic bottles and containers",
    "matchScore": 5,
    "id": "waste-item-id",
    "url": "https://...",
    "content": "Disposal instructions..."
  }
}
```

### Test Endpoints

#### Get HSY Waste Guide Data

```
GET /waste-guide
```

Returns sample data from the HSY waste guide API for testing connectivity.

#### Search Waste Guide

```
POST /waste-guide/search
Content-Type: application/json

{
  "searchTerm": "plastic bottle"
}
```

Tests the matching algorithm with a specific search term.

#### Test HSY Authentication

```
GET /hsy-auth-test
```

Tests the HSY authentication (OAuth2 or API key) and returns authentication status.

## Database Schema

The `product_scans` table now includes:

```sql
waste_guide_match TEXT -- JSON string with HSY waste guide match data
```

This stores the complete match information including title, score, ID, URL, and content.

## Matching Algorithm

The system uses a sophisticated matching algorithm with scoring:

1. **Direct Title Matches** (Score: +3): Exact matches in waste guide item titles
2. **Material Matches** (Score: +2): Material keywords found in titles
3. **Category Matches** (Score: +1): Product category matches
4. **Word Matching** (Score: +1): Individual word similarities

The highest scoring match is returned as the best result.

## Authentication Features

- **Simple Header Authentication**: Uses client_id and client_secret headers directly
- **No Token Management**: No need for token caching or refresh logic
- **Direct API Access**: Each request includes authentication headers
- **Secure**: Credentials are sent with each authenticated request

## Error Handling

- **Missing Credentials**: Clear error messages when client ID/secret are not configured
- **Authentication Errors**: Logs 401/403 status codes with helpful messages
- **Network Issues**: Gracefully handles timeouts and connection errors
- **Invalid Responses**: Handles non-array responses and malformed data

## Example Usage

After scanning a plastic bottle, the system might return:

```json
{
  "wasteGuideMatch": {
    "title": "Muovipullot ja -purkit / Plastic bottles and jars",
    "matchScore": 5,
    "id": "muovipullot-ja-purkit",
    "url": "https://dev.klapi.hsy.fi/...",
    "content": "Detailed disposal instructions..."
  }
}
```

## Testing

1. Start the server: `npm start`
2. Test API connectivity: `GET http://localhost:3000/waste-guide`
3. Test search functionality: `POST http://localhost:3000/waste-guide/search`
4. Upload an image via the mobile app to test full integration

## Troubleshooting

- **No matches found**: Check that the HSY API key is valid and has proper permissions
- **Authentication errors**: Verify the API key format and contact HSY for support
- **Timeout issues**: The system has a 10-second timeout for HSY API calls
