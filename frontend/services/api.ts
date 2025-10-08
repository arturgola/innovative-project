import { UserProfile } from "../types";

const API_BASE_URL = "http://192.168.1.145:3000";

// OpenAI Configuration
const OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY || "your-openai-api-key-here";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export interface ProductAnalysisResult {
  name: string;
  brand: string;
  category: string;
  recyclability: string;
  ecoScore: number;
  description: string;
  suggestions: string[];
  confidence: number;
}

export interface ObjectMaterialAnalysis {
  shortDescription: string;
}

export class ApiService {
  // User API methods
  static async createUser(
    userData: Omit<UserProfile, "id">
  ): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch users");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  static async getUserById(id: number): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch user");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  static async updateUser(
    id: number,
    userData: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  static async deleteUser(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // OpenAI Vision API methods
  static async analyzeObjectMaterial(
    imageUri: string
  ): Promise<ObjectMaterialAnalysis> {
    try {
      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);

      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze the object in this image and identify its material. Return only a short description string with the object type and material. For example: "plastic bottle", "metal can", "glass jar", "cardboard box", "fabric shirt", "leather shoe", etc. Keep it very brief - just type and material.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: "high",
                  },
                },
              ],
            },
          ],
          max_tokens: 50,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to analyze image");
      }

      const data = await response.json();
      const shortDescription = data.choices[0].message.content.trim();

      return {
        shortDescription: shortDescription || "unknown object",
      };
    } catch (error) {
      console.error("Error analyzing object material with OpenAI:", error);
      return {
        shortDescription: "unknown object",
      };
    }
  }

  static async analyzeProductImage(
    imageUri: string
  ): Promise<ProductAnalysisResult> {
    try {
      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);

      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `First, analyze the object in this image and identify its material. Then provide comprehensive analysis.

STEP 1: Analyze object and its material, return only string with object short descriptions, such as type and material (e.g., "plastic bottle", "metal can", "glass jar").

STEP 2: Provide detailed analysis in JSON format:
                  {
                    "name": "Product name",
                    "brand": "Brand name", 
                    "category": "Product category",
                    "recyclability": "Type of recyclability (e.g., fully recyclable, partially recyclable, not recyclable)",
                    "ecoScore": "Environmental score from 1-100",
                    "description": "Brief product description including the object type and material from step 1",
                    "suggestions": ["Array of eco-friendly suggestions"],
                    "confidence": "Confidence level from 0-100"
                  }
                  
                  Focus on sustainability and environmental impact. Include the object type and material analysis in the description field. If you can't identify the product clearly, provide general information and mark confidence as low.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: "high",
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to analyze image");
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse the JSON response
      try {
        const analysisResult = JSON.parse(content);
        return analysisResult;
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          name: "Unknown Product",
          brand: "Unknown Brand",
          category: "General Item",
          recyclability: "Check local guidelines",
          ecoScore: 50,
          description:
            "Product analysis incomplete. Please try again with a clearer image.",
          suggestions: [
            "Check product packaging for recycling symbols",
            "Consider eco-friendly alternatives",
          ],
          confidence: 30,
        };
      }
    } catch (error) {
      console.error("Error analyzing image with OpenAI:", error);
      throw error;
    }
  }

  private static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove the data:image/jpeg;base64, prefix
          const base64Data = base64.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw error;
    }
  }
}
