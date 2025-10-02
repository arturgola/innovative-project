import React from "react";
import { router } from "expo-router";
import SuccessScreen from "@/components/success-screen";

export default function SuccessPage() {
  const handleContinue = () => {
    router.push("/(tabs)");
  };

  return <SuccessScreen onContinue={handleContinue} />;
}
