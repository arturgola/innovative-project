# OpenAI Vision Integration Setup

This app now includes OpenAI Vision API integration to analyze product images for eco-friendliness and sustainability information, with specialized object and material identification.

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the API key

### 2. Configure Environment Variables

1. Open the `.env` file in the frontend directory
2. Replace `your-openai-api-key-here` with your actual OpenAI API key:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### 3. How It Works

#### Step-by-Step Process:

1. **User Takes Photo**: When a user taps the camera button in the scan screen, the app captures a photo using the device camera.

2. **Image Preparation**: The captured image is converted to base64 format for transmission to the OpenAI API.

3. **Dual Analysis Process**: The image is analyzed twice for optimal results:

   **First Call - Object & Material Identification:**

   - **Purpose**: Quick identification of the basic object type and material
   - **Model**: GPT-4o-mini with low temperature (0.1) for consistency
   - **Prompt**: "Analyze the object in this image and identify its material. Return only a short description string with the object type and material."
   - **Response**: Simple strings like "plastic bottle", "aluminum can", "glass jar", "cardboard box"
   - **Token Usage**: Maximum 50 tokens (cost-efficient)

   **Second Call - Comprehensive Product Analysis:**

   - **Purpose**: Detailed sustainability and environmental analysis
   - **Model**: GPT-4o-mini with moderate temperature (0.3) for balanced creativity
   - **Prompt**: Two-step analysis including object identification + detailed JSON response
   - **Response**: Complete product information in JSON format
   - **Token Usage**: Maximum 1000 tokens

4. **Data Processing**:

   - Parse JSON response from the comprehensive analysis
   - Combine object/material description with full product details
   - Calculate points based on eco-score (eco-score ÷ 2)
   - Store all analysis data in the product object

5. **Fallback Handling**: If either API call fails:

   - App continues with basic product information
   - User receives notification about AI analysis failure
   - Basic scan functionality remains available

6. **Result Display**: The analyzed product is passed to the success screen with:
   - Object material prominently displayed
   - Sustainability score and recommendations
   - Recyclability information
   - Confidence level of the analysis

#### Technical Flow:

```
User Tap → Photo Capture → Base64 Conversion →
API Call 1 (Object/Material) → API Call 2 (Full Analysis) →
Data Combination → Product Object Creation → Success Screen
```

#### Example Analysis Flow:

- **Input**: Photo of a Coca-Cola bottle
- **Object Analysis**: "plastic bottle"
- **Full Analysis**: Brand identification, eco-score, recyclability info
- **Final Description**: "plastic bottle - Coca-Cola PET bottle, recyclable through most municipal programs..."
- **Additional Data**: Eco-score: 65, Suggestions: ["Recycle in designated bins", "Consider reusable alternatives"]

### 4. API Usage

The image analysis is handled by two methods in `frontend/services/api.ts`:

- `ApiService.analyzeObjectMaterial(imageUri)` - Returns object type and material (e.g., "plastic bottle")
- `ApiService.analyzeProductImage(imageUri)` - Returns comprehensive analysis with sustainability info

Both methods are called automatically when taking a picture in the scan screen.

#### Implementation Details:

**File Structure:**

- `frontend/services/api.ts` - Contains OpenAI API integration methods
- `frontend/components/scan-screen.tsx` - Camera interface and analysis trigger
- `frontend/app/types/index.ts` - TypeScript interfaces for data structures
- `frontend/.env` - Environment variables (API key storage)

**Key Methods:**

```typescript
// Quick object/material identification
ApiService.analyzeObjectMaterial(imageUri: string): Promise<ObjectMaterialAnalysis>

// Comprehensive product analysis
ApiService.analyzeProductImage(imageUri: string): Promise<ProductAnalysisResult>

// Base64 conversion helper
ApiService.convertImageToBase64(imageUri: string): Promise<string>
```

**Data Structures:**

```typescript
interface ObjectMaterialAnalysis {
  shortDescription: string; // e.g., "plastic bottle"
}

interface ProductAnalysisResult {
  name: string; // Product name
  brand: string; // Brand identification
  category: string; // Product category
  recyclability: string; // Recycling information
  ecoScore: number; // Environmental score (1-100)
  description: string; // Detailed description
  suggestions: string[]; // Eco-friendly suggestions
  confidence: number; // AI confidence level (0-100)
}
```

**API Configuration:**

- **Model**: gpt-4o-mini (cost-effective Vision model)
- **Image Detail**: "high" for better analysis accuracy
- **Temperature**: 0.1 for object analysis, 0.3 for full analysis
- **Max Tokens**: 50 for object analysis, 1000 for full analysis

### 5. Error Handling

- If the OpenAI API is unavailable or returns an error, the app falls back to basic product scanning
- Users will be notified if AI analysis fails but can still use the basic scan functionality

### 6. Cost Considerations

- OpenAI Vision API charges per image analyzed
- Current model used: `gpt-4o-mini` (cost-effective option)
- Consider implementing usage limits for production apps

## Testing

1. Make sure your OpenAI API key is properly configured
2. Take a picture of any product using the scan screen
3. The app will show "Analyzing with AI..." during processing
4. Results will include detailed environmental information

## Troubleshooting

### Common Issues:

1. **"Analysis Failed" Error**:

   - Check if OpenAI API key is correctly set in `.env` file
   - Verify API key has sufficient credits
   - Ensure internet connection is stable

2. **"Failed to take picture" Error**:

   - Grant camera permissions to the app
   - Check if camera is available (not used by another app)
   - Restart the app if camera appears frozen

3. **Slow Analysis Response**:

   - Normal processing time: 3-8 seconds
   - Poor internet connection can increase wait time
   - Large images may take longer to process

4. **Inaccurate Results**:
   - Ensure good lighting when taking photos
   - Keep the object clearly visible and centered
   - Avoid blurry or heavily shadowed images
   - Try taking the photo from different angles

### Debug Mode:

Enable console logging to see detailed API responses:

```javascript
// In api.ts, uncomment these lines for debugging:
console.log("Object Analysis Result:", objectResult);
console.log("Full Analysis Result:", analysisResult);
```

## Performance Optimization

- **Cost Management**: Each photo analysis costs approximately $0.01-0.02
- **Rate Limiting**: Implement delays between requests if needed
- **Caching**: Consider caching results for identical products
- **Image Compression**: Images are captured at 0.8 quality to balance analysis accuracy and upload speed

## Privacy

- Images are sent to OpenAI for analysis
- No images are stored permanently on OpenAI's servers according to their API policy
- Images are processed in real-time and not retained by the service
- Consider adding privacy notices in production apps
- API calls are made over HTTPS for secure transmission
