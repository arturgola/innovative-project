import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface ScanScreenProps {
  onBack: () => void;
  onScanComplete: (product: any) => void;
}

const { width, height } = Dimensions.get("window");

const ScanScreen = ({ onBack, onScanComplete }: ScanScreenProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const pulseAnim = useState(new Animated.Value(0))[0];
  const scanLineAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (isScanning) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Scan line animation
      Animated.loop(
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(0);
      scanLineAnim.setValue(0);
    }
  }, [isScanning, pulseAnim, scanLineAnim]);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      const mockProduct = {
        id: Date.now(),
        name: "Coca Cola Bottle",
        brand: "Coca Cola",
        category: "Plastic Waste",
        barcode: "5449000000996",
        points: Math.floor(Math.random() * 50) + 10, // Random points between 10-60
        rating: 4.2,
        description:
          "This is a Coca Cola plastic bottle (PET #1). Please recycle it in a plastic recycling bin. PET plastic is widely recycled and can be reused to make new bottles and textiles. Check your local recycling guidelines for proper disposal.",
        scannedAt: new Date().toISOString(),
      };
      setIsScanning(false);
      onScanComplete(mockProduct);
    }, 2000);
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "transparent"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Product</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Scanning area */}
      <View style={styles.scanningArea}>
        <View style={styles.scanFrame}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Scanning line */}
          {isScanning && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanLineTranslateY }],
                },
              ]}
            />
          )}
        </View>

        {/* Instructions */}
        <Text style={styles.instructionText}>
          {isScanning
            ? "Scanning product..."
            : "Position the barcode within the frame"}
        </Text>

        {/* Scan button */}
        <View style={styles.scanButtonContainer}>
          <Animated.View
            style={[
              styles.scanButtonWrapper,
              {
                transform: [{ scale: pulseScale }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleScan}
              disabled={isScanning}
              style={[
                styles.scanButton,
                { opacity: isScanning ? 0.7 : 1 },
              ]}
            >
              <LinearGradient
                colors={["#6366f1", "#8b5cf6"]}
                style={styles.scanButtonGradient}
              >
                <Ionicons
                  name={isScanning ? "hourglass" : "camera"}
                  size={32}
                  color="#ffffff"
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Bottom instructions */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.bottomInstructions}
      >
        <View style={styles.instructionItem}>
          <Ionicons name="flashlight" size={20} color="#ffffff" />
          <Text style={styles.instructionItemText}>
            Use good lighting for best results
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="resize" size={20} color="#ffffff" />
          <Text style={styles.instructionItemText}>
            Hold steady and align barcode
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "500",
  },
  placeholder: {
    width: 40,
  },
  scanningArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  scanFrame: {
    width: width - 80,
    height: width - 80,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#6366f1",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "#6366f1",
    shadowColor: "#6366f1",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  instructionText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
    marginBottom: 60,
  },
  scanButtonContainer: {
    alignItems: "center",
  },
  scanButtonWrapper: {
    shadowColor: "#6366f1",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  scanButtonGradient: {
    flex: 1,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomInstructions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 50,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  instructionItemText: {
    color: "#ffffff",
    fontSize: 14,
    marginLeft: 12,
    opacity: 0.9,
  },
});

export default ScanScreen;