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
import { LinearGradient } from "expo-linear-gradient";

interface SuccessScreenProps {
  onContinue: () => void;
}

const { width, height } = Dimensions.get("window");

const SuccessScreen = ({ onContinue }: SuccessScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const bounceAnim = useState(new Animated.Value(0))[0];

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

      // Bouncing animation for decorative elements
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, bounceAnim]);

  const bounceTranslateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      {/* Background effects */}
      <LinearGradient
        colors={["rgba(16, 185, 129, 0.1)", "rgba(168, 85, 247, 0.05)", "rgba(16, 185, 129, 0.15)"]}
        style={styles.backgroundGradient}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Success icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={["#10b981", "rgba(16, 185, 129, 0.8)"]}
            style={styles.successIcon}
          >
            <Ionicons name="checkmark-circle" size={64} color="#ffffff" />
          </LinearGradient>

          {/* Sparkle effects */}
          <View style={styles.sparkle1}>
            <Ionicons name="sparkles" size={32} color="#a855f7" />
          </View>
          <View style={styles.sparkle2}>
            <Ionicons name="sparkles" size={24} color="#10b981" />
          </View>
        </View>

        {/* Success message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Scan Successful!</Text>
          <Text style={styles.subtitle}>
            Product has been successfully scanned and added to your history
          </Text>
        </View>

        {/* Stats card */}
        <View style={styles.statsCard}>
          <View style={styles.statsContent}>
            <View style={styles.statusIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </View>
            <View style={styles.statusText}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={styles.statusValue}>Successfully Scanned</Text>
            </View>
          </View>
        </View>

        {/* Continue buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={onContinue} style={styles.primaryButton}>
            <LinearGradient
              colors={["#6366f1", "#8b5cf6"]}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>Continue Scanning</Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onContinue} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Decorative floating elements */}
      <Animated.View
        style={[
          styles.decorativeElement1,
          {
            transform: [{ translateY: bounceTranslateY }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeElement2,
          {
            transform: [{ translateY: bounceTranslateY }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeElement3,
          {
            transform: [{ translateY: bounceTranslateY }],
          },
        ]}
      />
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
  successIcon: {
    width: 128,
    height: 128,
    borderRadius: 64,
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
  sparkle1: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  sparkle2: {
    position: "absolute",
    bottom: -4,
    left: -4,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  statsCard: {
    backgroundColor: "rgba(248, 250, 252, 0.5)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    padding: 24,
    marginBottom: 48,
    minWidth: 280,
  },
  statsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusText: {
    alignItems: "flex-start",
  },
  statusLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
  },
  buttonsContainer: {
    width: "100%",
    maxWidth: 300,
  },
  primaryButton: {
    marginBottom: 12,
    borderRadius: 12,
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "600",
  },
  decorativeElement1: {
    position: "absolute",
    top: height * 0.25,
    left: 32,
    width: 12,
    height: 12,
    backgroundColor: "rgba(16, 185, 129, 0.4)",
    borderRadius: 6,
  },
  decorativeElement2: {
    position: "absolute",
    top: height * 0.33,
    right: 48,
    width: 8,
    height: 8,
    backgroundColor: "rgba(168, 85, 247, 0.6)",
    borderRadius: 4,
  },
  decorativeElement3: {
    position: "absolute",
    bottom: height * 0.33,
    left: 48,
    width: 16,
    height: 16,
    backgroundColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 8,
  },
});

export default SuccessScreen;