import React from "react";
import { router } from "expo-router";
import MainMenu from "@/components/main-menu";
import { useAppContext } from "../contexts/app-context";

export default function HomeScreen() {
  const { userProfile, scannedProducts } = useAppContext();

  const handleScan = () => {
    router.push("/scan" as any);
  };

  const handleStatistics = () => {
    router.push("/(tabs)/explore");
  };

  const handleProfile = () => {
    router.push("/user-profile" as any);
  };

  return (
    <MainMenu
      onScan={handleScan}
      onStatistics={handleStatistics}
      onProfile={handleProfile}
      scanCount={scannedProducts.length}
      userProfile={userProfile}
    />
  );
}
