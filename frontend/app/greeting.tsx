import React from "react";
import { router } from "expo-router";
import GreetingScreen from "@/components/greeting-screen";

export default function GreetingPage() {
  const handleContinue = () => {
    router.push("/(tabs)");
  };

  return <GreetingScreen onContinue={handleContinue} />;
}
