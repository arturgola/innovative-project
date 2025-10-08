export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  barcode: string;
  points: number;
  rating: number;
  description: string;
  scannedAt: string;
  photoUri?: string;
  photoWidth?: number;
  photoHeight?: number;
  // AI Analysis fields
  recyclability?: string;
  ecoScore?: number;
  suggestions?: string[];
  confidence?: number;
  analysisMethod?: "openai-vision" | "basic" | "barcode";
  objectMaterial?: string;
}

export interface UserProfile {
  id?: number;
  name: string;
  level: number;
  totalPoints: number;
  scansToday: number;
  joinedDate: string;
}

export type Screen =
  | "greeting"
  | "menu"
  | "scan"
  | "product"
  | "success"
  | "statistics"
  | "profile";
