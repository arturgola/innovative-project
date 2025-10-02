import React from "react";
import { router } from "expo-router";
import ScanScreen from "@/components/scan-screen";
import { useAppContext } from "./contexts/app-context";
import { Product } from "./types";

export default function ScanPage() {
  const { setCurrentProduct, addScannedProduct } = useAppContext();

  const handleBack = () => {
    router.back();
  };

  const handleScanComplete = (product: Product) => {
    setCurrentProduct(product);
    addScannedProduct(product);
    router.push("/product" as any);
  };

  return <ScanScreen onBack={handleBack} onScanComplete={handleScanComplete} />;
}
