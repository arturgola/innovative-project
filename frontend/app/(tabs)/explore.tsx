import React from "react";
import { router } from "expo-router";
import StatisticsScreen from "@/components/statistics-screen";
import { useAppContext } from "../../contexts/app-context";
import { ProductAnalysisResult } from "../../services/api";

export default function TabTwoScreen() {
  const { setCurrentProduct, isLoadingUser, hasUser } = useAppContext();

  // Show loading or redirect to onboarding if no user
  if (isLoadingUser || !hasUser) {
    return null; // Let the main layout handle navigation
  }

  const handleBack = () => {
    router.back();
  };

  const handleViewProduct = (product: ProductAnalysisResult) => {
    // Convert ProductAnalysisResult to Product type for context
    const productForContext = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      barcode: product.barcode,
      points: product.points,
      rating: product.rating,
      description: product.description,
      scannedAt: product.scannedAt,
      photoUri: product.photoUri,
      photoWidth: product.photoWidth,
      photoHeight: product.photoHeight,
      recyclability: product.recyclability,
      ecoScore: product.ecoScore,
      suggestions: product.suggestions,
      confidence: product.confidence,
      analysisMethod: product.analysisMethod as
        | "openai-vision"
        | "basic"
        | "barcode",
      objectMaterial: product.objectMaterial,
    };
    setCurrentProduct(productForContext);
    router.push("/product" as any);
  };

  return (
    <StatisticsScreen onBack={handleBack} onViewProduct={handleViewProduct} />
  );
}
