import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { ApiService } from "../services/api";
import { useAppContext } from "../contexts/app-context";

interface ScanScreenProps {
  onBack: () => void;
  onScanComplete: (product: any) => void;
  isActive?: boolean;
}

const { width, height } = Dimensions.get("window");

const ScanScreen = ({
  onBack,
  onScanComplete,
  isActive = true,
}: ScanScreenProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useState(new Animated.Value(0))[0];
  const scanLineAnim = useState(new Animated.Value(0))[0];
  const { userProfile } = useAppContext();

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

  // Handle camera permissions
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera" size={64} color="#00AAA3" />
          <Text style={styles.permissionText}>
            We need your permission to use the camera
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;

    setIsScanning(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      // Show analyzing message
      Alert.alert(
        "Analyzing...",
        "Please wait while we analyze your product image."
      );

      try {
        // Analyze the image using the backend API, passing user ID if available
        const analysisResult = await ApiService.analyzeProductImage(
          photo.uri,
          userProfile.id
        );

        // Add the photo dimensions to the result
        const productWithAnalysis = {
          ...analysisResult,
          photoWidth: photo.width,
          photoHeight: photo.height,
        };

        setIsScanning(false);
        onScanComplete(productWithAnalysis);
      } catch (analysisError) {
        console.error("Analysis error:", analysisError);

        // Check if we got a fallback result from the backend
        if (
          analysisError instanceof Error &&
          analysisError.message.includes("Analysis failed")
        ) {
          // Try to get fallback data from error response if available
          const fallbackProduct = {
            id: Date.now(),
            name: "Scanned Product",
            brand: "Unknown Brand",
            category: "General Item",
            barcode: "camera-scanned",
            points: Math.floor(Math.random() * 50) + 10,
            rating: 0,
            description: "Product scanned via camera. AI analysis unavailable.",
            scannedAt: new Date().toISOString(),
            photoUri: photo.uri,
            photoWidth: photo.width,
            photoHeight: photo.height,
            recyclability: "Check local guidelines",
            ecoScore: 0,
            suggestions: ["Check product packaging for recycling symbols"],
            confidence: 0,
            analysisMethod: "basic",
            objectMaterial: "unknown object",
          };

          setIsScanning(false);
          Alert.alert(
            "Analysis Failed",
            "Unable to analyze the product with AI. Basic scan completed.",
            [{ text: "OK" }]
          );
          onScanComplete(fallbackProduct);
        } else {
          setIsScanning(false);
          Alert.alert("Error", "Failed to analyze product. Please try again.");
        }
      }
    } catch (error) {
      setIsScanning(false);
      Alert.alert("Error", "Failed to take picture. Please try again.");
      console.error("Camera error:", error);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
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

      {/* Camera View - Only render when active and permissions granted */}
      {isActive && permission?.granted ? (
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          {/* Scan Frame Overlay */}
          <View style={styles.scanFrameContainer}>
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
          </View>

          {/* Instructions Overlay */}
          <View style={styles.instructionsOverlay}>
            <Text style={styles.instructionText}>
              {isScanning
                ? "Analyzing with AI..."
                : "Position the product within the frame"}
            </Text>
          </View>

          {/* Tips Overlay */}
          <View style={styles.tipsOverlay}>
            <View style={styles.tipItem}>
              <Ionicons name="flashlight" size={18} color="#ffffff" />
              <Text style={styles.tipText}>
                Use good lighting for best AI analysis
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="bulb" size={18} color="#ffffff" />
              <Text style={styles.tipText}>
                AI will analyze eco-friendliness
              </Text>
            </View>
          </View>

          {/* Camera Controls Overlay */}
          <View style={styles.cameraControlsOverlay}>
            <TouchableOpacity
              onPress={toggleCameraFacing}
              style={styles.flipButton}
            >
              <Ionicons name="camera-reverse" size={24} color="#ffffff" />
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.scanButtonWrapper,
                {
                  transform: [{ scale: pulseScale }],
                },
              ]}
            >
              <TouchableOpacity
                onPress={handleTakePicture}
                disabled={isScanning}
                style={[styles.scanButton, { opacity: isScanning ? 0.7 : 1 }]}
              >
                <LinearGradient
                  colors={["#00AAA3", "#008782"]}
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

            <View style={styles.placeholder} />
          </View>
        </CameraView>
      ) : (
        // Show inactive camera placeholder when not active
        <View style={styles.inactiveCamera}>
          <Ionicons name="camera" size={64} color="#666666" />
          <Text style={styles.inactiveCameraText}>Camera is inactive</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  permissionText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  permissionButton: {
    backgroundColor: "#00AAA3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  camera: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scanFrameContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  instructionsOverlay: {
    position: "absolute",
    top: "25%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tipsOverlay: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tipText: {
    color: "#ffffff",
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.9,
  },
  cameraControlsOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
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
  scanFrame: {
    width: width - 120,
    height: width - 180,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#00AAA3",
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
    backgroundColor: "#00AAA3",
    shadowColor: "#00AAA3",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  instructionText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 20,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontWeight: "500",
  },
  scanButtonWrapper: {
    shadowColor: "#00AAA3",
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
  inactiveCamera: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  inactiveCameraText: {
    color: "#666666",
    fontSize: 16,
    marginTop: 16,
  },
});

export default ScanScreen;
