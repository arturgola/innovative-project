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
          <Ionicons name="camera" size={64} color="#6366f1" />
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

      // Create a product object with the photo information
      const productWithPhoto = {
        id: Date.now(),
        name: "Scanned Product",
        brand: "Unknown Brand",
        category: "Recyclable Item",
        barcode: "unknown",
        points: Math.floor(Math.random() * 50) + 10,
        rating: 0,
        description: "Product scanned via camera. Analysis pending.",
        scannedAt: new Date().toISOString(),
        photoUri: photo.uri, // Store the photo URI
        photoWidth: photo.width,
        photoHeight: photo.height,
      };

      setIsScanning(false);
      onScanComplete(productWithPhoto);
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
                ? "Taking picture..."
                : "Position the product within the frame"}
            </Text>
          </View>

          {/* Tips Overlay */}
          <View style={styles.tipsOverlay}>
            <View style={styles.tipItem}>
              <Ionicons name="flashlight" size={18} color="#ffffff" />
              <Text style={styles.tipText}>
                Use good lighting for best results
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="resize" size={18} color="#ffffff" />
              <Text style={styles.tipText}>Hold steady and align barcode</Text>
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
    backgroundColor: "#6366f1",
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
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 20,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontWeight: "500",
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
