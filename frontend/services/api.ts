import { UserProfile } from "../types";

const API_BASE_URL = "http://192.168.1.145:3000";

export interface ProductAnalysisResult {
  id: number;
  name: string;
  brand: string;
  category: string;
  barcode: string;
  points: number;
  rating: number;
  description: string;
  recyclability: string;
  ecoScore: number;
  suggestions: string[];
  confidence: number;
  analysisMethod: string;
  objectMaterial: string;
  photoUri: string;
  photoWidth: number;
  photoHeight: number;
  scannedAt: string;
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

  // Product Analysis API methods
  static async analyzeProductImage(
    imageUri: string,
    userId?: number
  ): Promise<ProductAnalysisResult> {
    try {
      // Create FormData for image upload
      const formData = new FormData();

      // Convert the image URI to a blob and append to form data
      const response = await fetch(imageUri);
      const blob = await response.blob();

      formData.append("image", blob, "product-image.jpg");

      if (userId) {
        formData.append("userId", userId.toString());
      }

      const analysisResponse = await fetch(`${API_BASE_URL}/analyze-product`, {
        method: "POST",
        body: formData,
      });

      if (!analysisResponse.ok) {
        const error = await analysisResponse.json();
        throw new Error(error.error || "Failed to analyze image");
      }

      const result = await analysisResponse.json();

      // Convert relative photoUri to absolute URL
      if (result.photoUri && !result.photoUri.startsWith("http")) {
        result.photoUri = `${API_BASE_URL}${result.photoUri}`;
      }

      return result;
    } catch (error) {
      console.error("Error analyzing image:", error);
      throw error;
    }
  }

  // Get user's scan history
  static async getUserScans(userId: number): Promise<ProductAnalysisResult[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/scans`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch user scans");
      }

      const scans = await response.json();

      // Convert relative photoUri to absolute URL for each scan
      return scans.map((scan: ProductAnalysisResult) => ({
        ...scan,
        photoUri:
          scan.photoUri && !scan.photoUri.startsWith("http")
            ? `${API_BASE_URL}${scan.photoUri}`
            : scan.photoUri,
      }));
    } catch (error) {
      console.error("Error fetching user scans:", error);
      throw error;
    }
  }
}
