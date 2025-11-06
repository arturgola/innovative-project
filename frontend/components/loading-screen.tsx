import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LoadingScreen() {
  return (
    <LinearGradient colors={["#00AAA3", "#008782"]} style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="scan" size={80} color="white" />
        <Text style={styles.title}>EcoScan</Text>
        <Text style={styles.subtitle}>Loading your profile...</Text>
        <ActivityIndicator size="large" color="white" style={styles.loader} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
});
