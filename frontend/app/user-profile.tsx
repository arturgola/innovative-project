import React from "react";
import { router } from "expo-router";
import UserProfile from "@/components/user-profile";
import { useAppContext } from "./contexts/app-context";

export default function UserProfilePage() {
  const { userProfile, updateUserProfile } = useAppContext();

  const handleBack = () => {
    router.back();
  };

  return (
    <UserProfile
      userProfile={userProfile}
      onBack={handleBack}
      onUpdateProfile={updateUserProfile}
    />
  );
}
