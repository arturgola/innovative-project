import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Product, UserProfile } from "../types";
import { ApiService } from "../services/api";

interface AppState {
  currentProduct: Product | null;
  scannedProducts: Product[];
  userProfile: UserProfile;
  isLoadingUser: boolean;
  hasUser: boolean;
  setCurrentProduct: (product: Product | null) => void;
  setScannedProducts: (products: Product[]) => void;
  setUserProfile: (profile: UserProfile) => void;
  addScannedProduct: (product: Product) => void;
  createNewUser: (name: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
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
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [hasUser, setHasUser] = useState(false);

  // Load user profile on app start (you might want to implement user selection logic)
  useEffect(() => {
    // For now, this creates a default user or loads the first user
    // You can modify this to implement user selection/login logic
    loadOrCreateUser();
  }, []);

  const loadOrCreateUser = async () => {
    setIsLoadingUser(true);
    try {
      const users = await ApiService.getAllUsers();
      if (users.length > 0) {
        // Load the first user
        setUserProfile(users[0]);
        setHasUser(true);
      } else {
        // No users exist, show onboarding
        setHasUser(false);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      // On error, show onboarding to create user
      setHasUser(false);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const createNewUser = async (name: string) => {
    setIsLoadingUser(true);
    try {
      const newUser = await ApiService.createUser({
        name,
        level: 1,
        totalPoints: 0,
        scansToday: 0,
        joinedDate: new Date().toISOString(),
      });
      setUserProfile(newUser);
      setHasUser(true);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    } finally {
      setIsLoadingUser(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile.id) {
      console.error("Cannot update user: no user ID");
      return;
    }

    try {
      const updatedUser = await ApiService.updateUser(userProfile.id, updates);
      setUserProfile(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const addScannedProduct = async (product: Product) => {
    setScannedProducts((prev) => [...prev, product]);

    // If user has an ID, refresh their profile from the backend to get updated stats
    if (userProfile.id) {
      try {
        const updatedUser = await ApiService.getUserById(userProfile.id);
        setUserProfile(updatedUser);
      } catch (error) {
        console.error("Error refreshing user profile:", error);
        // Fallback: update local state manually
        const newTotalPoints = userProfile.totalPoints + product.points;
        const newScansToday = userProfile.scansToday + 1;
        const newLevel = Math.floor(newTotalPoints / 100) + 1;

        setUserProfile({
          ...userProfile,
          totalPoints: newTotalPoints,
          scansToday: newScansToday,
          level: newLevel,
        });
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentProduct,
        scannedProducts,
        userProfile,
        isLoadingUser,
        hasUser,
        setCurrentProduct,
        setScannedProducts,
        setUserProfile,
        addScannedProduct,
        createNewUser,
        updateUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
