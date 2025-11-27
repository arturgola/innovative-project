export interface HSYWasteGuideMatch {
  title: string;
  matchScore: number;
  id: string;
  synonyms: string[];
  notes?: string;
  wasteTypes?: {
    id: string;
    title: string;
    description: string;
    informationPageUrl?: string;
  }[];
  recyclingMethods?: {
    id: string;
    title: string;
    description: string;
    isFree: boolean;
    infoPageUrl?: string;
  }[];
}

export interface AIRecyclingAdvice {
  advice: string;
  isDangerous: boolean;
  dangerWarning?: string;
  generalTips: string[];
}

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
  // HSY Waste Guide match
  wasteGuideMatch?: HSYWasteGuideMatch;
  // AI Recycling Advice fallback
  aiRecyclingAdvice?: AIRecyclingAdvice;
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
