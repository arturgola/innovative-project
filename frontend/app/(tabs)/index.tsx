import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import MainMenu from "@/components/main-menu";
import LoadingScreen from "@/components/loading-screen";
import { useAppContext } from "../../contexts/app-context";
import { ApiService } from "../../services/api";


export default function HomeScreen() {
  const { userProfile, isLoadingUser, hasUser } = useAppContext();
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    if (!isLoadingUser && !hasUser) {
      // Navigate to onboarding if no user exists
      router.replace("/onboarding" as any);
    }
  }, [isLoadingUser, hasUser]);

  useEffect(() => {
    async function loadScanCount() {
      if (!userProfile?.id) return;
      try {
        const scans = await ApiService.getUserScans(userProfile.id);
        setScanCount(scans.length);
      } catch (err) {
        console.error("Failed to load scan count", err);
      }
    }

    if (hasUser && !isLoadingUser) {
      loadScanCount();
    }
  }, [hasUser, isLoadingUser, userProfile?.id]);

  // Show loading screen while checking for user
  if (isLoadingUser) {
    return <LoadingScreen />;
  }

  // If no user exists, the effect above will navigate to onboarding
  if (!hasUser) {
    return <LoadingScreen />;
  }

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
      scanCount={scanCount}
      userProfile={userProfile}
    />
  );
}
