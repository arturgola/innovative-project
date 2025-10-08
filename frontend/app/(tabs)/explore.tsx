import React from "react";
import { router } from "expo-router";
import StatisticsScreen from "@/components/statistics-screen";
import { useAppContext } from "../../contexts/app-context";
import { Product } from "../../types";

export default function TabTwoScreen() {
  const { scannedProducts, setCurrentProduct, isLoadingUser, hasUser } =
    useAppContext();

  // Show loading or redirect to onboarding if no user
  if (isLoadingUser || !hasUser) {
    return null; // Let the main layout handle navigation
  }

  const handleBack = () => {
    router.back();
  };

  const handleViewProduct = (product: Product) => {
    setCurrentProduct(product);
    router.push("/product" as any);
  };

  return (
    <StatisticsScreen
      onBack={handleBack}
      scannedProducts={scannedProducts}
      onViewProduct={handleViewProduct}
    />
  );
}
