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
}

export interface UserProfile {
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
