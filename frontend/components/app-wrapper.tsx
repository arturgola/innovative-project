import React from "react";
import { useAppContext } from "../app/contexts/app-context";
import LoadingScreen from "./loading-screen";

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const { isLoadingUser, hasUser } = useAppContext();

  // Show loading screen while checking for user
  if (isLoadingUser) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
