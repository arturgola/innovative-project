import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product, UserProfile } from "../types";

interface AppState {
  currentProduct: Product | null;
  scannedProducts: Product[];
  userProfile: UserProfile;
  setCurrentProduct: (product: Product | null) => void;
  setScannedProducts: (products: Product[]) => void;
  setUserProfile: (profile: UserProfile) => void;
  addScannedProduct: (product: Product) => void;
}

const defaultUserProfile: UserProfile = {
  name: "Scanner Pro",
  level: 1,
  totalPoints: 0,
  scansToday: 0,
  joinedDate: new Date().toISOString(),
};

const AppContext = createContext<AppState | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [scannedProducts, setScannedProducts] = useState<Product[]>([]);
  const [userProfile, setUserProfile] =
    useState<UserProfile>(defaultUserProfile);

  const addScannedProduct = (product: Product) => {
    setScannedProducts((prev) => [...prev, product]);
    // Update user profile with points and scan count
    setUserProfile((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + product.points,
      scansToday: prev.scansToday + 1,
      level: Math.floor((prev.totalPoints + product.points) / 100) + 1,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        currentProduct,
        scannedProducts,
        userProfile,
        setCurrentProduct,
        setScannedProducts,
        setUserProfile,
        addScannedProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
