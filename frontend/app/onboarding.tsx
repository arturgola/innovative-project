import React from "react";
import { router } from "expo-router";
import CreateUserScreen from "@/components/create-user";
import { useAppContext } from "../contexts/app-context";

export default function OnboardingPage() {
  const { createNewUser, isLoadingUser } = useAppContext();

  const handleCreateUser = async (name: string) => {
    await createNewUser(name);
    // Navigate to the main app after user creation
    router.replace("/(tabs)");
  };

  return (
    <CreateUserScreen
      onCreateUser={handleCreateUser}
      isLoading={isLoadingUser}
    />
  );
}
