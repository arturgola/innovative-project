import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface GreetingScreenProps {
  onContinue: () => void;
}

const { width, height } = Dimensions.get("window");

const GreetingScreen = ({ onContinue }: GreetingScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      {/* Background gradient overlay */}
      <View style={styles.backgroundGradient} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* App icon */}
        <View style={styles.iconContainer}>
          <View style={styles.appIcon}>
            <Ionicons name="scan" size={48} color="#ffffff" />
          </View>
          <View style={styles.sparkle}>
            <Ionicons name="sparkles" size={24} color="#6366f1" />
          </View>
        </View>

        {/* Welcome text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.appName}>ScanPro</Text>
          <Text style={styles.subtitle}>
            Discover products instantly with intelligent scanning
          </Text>
        </View>

        {/* Continue button */}
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Decorative elements */}
      <View style={styles.decorativeElement1} />
      <View style={styles.decorativeElement2} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 10,
  },
  iconContainer: {
    position: "relative",
    marginBottom: 32,
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  sparkle: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6366f1",
    textAlign: "center",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
    maxWidth: 300,
  },
  continueButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  decorativeElement1: {
    position: "absolute",
    top: height * 0.25,
    left: 16,
    width: 8,
    height: 8,
    backgroundColor: "#6366f1",
    borderRadius: 4,
    opacity: 0.6,
  },
  decorativeElement2: {
    position: "absolute",
    bottom: height * 0.33,
    right: 24,
    width: 12,
    height: 12,
    backgroundColor: "#6366f1",
    borderRadius: 6,
    opacity: 0.4,
  },
});

export default GreetingScreen;