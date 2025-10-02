import React from "react";
import { router } from "expo-router";
import ProductDetails from "@/components/product-details";
import { useAppContext } from "./contexts/app-context";

export default function ProductPage() {
  const { currentProduct } = useAppContext();

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push("/success" as any);
  };

  if (!currentProduct) {
    return null;
  }

  return (
    <ProductDetails
      product={currentProduct}
      onBack={handleBack}
      onContinue={handleContinue}
    />
  );
}
