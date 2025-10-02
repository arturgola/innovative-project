import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  barcode: string;
  points: number;
  rating: number;
  description: string;
  scannedAt: string;
}

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onContinue: () => void;
}

const ProductDetails = ({
  product,
  onBack,
  onContinue,
}: ProductDetailsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this product: ${product.name} by ${product.brand}. Points: ${product.points}`,
        title: `${product.name} - ScanPro`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < Math.floor(rating) ? "star" : "star-outline"}
        size={16}
        color={i < rating ? "#fbbf24" : "#d1d5db"}
      />
    ));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product image placeholder */}
        <LinearGradient
          colors={["#f8fafc", "#f1f5f9"]}
          style={styles.productImageCard}
        >
          <Ionicons name="cube" size={96} color="#9ca3af" />
          <Text style={styles.imagePlaceholderText}>Product Image</Text>
        </LinearGradient>

        {/* Product info */}
        <View style={styles.productInfo}>
          <View style={styles.titleSection}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productBrand}>{product.brand}</Text>
          </View>

          <View style={styles.metaSection}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
            <View style={styles.ratingContainer}>
              {renderStars(product.rating)}
              <Text style={styles.ratingText}>({product.rating})</Text>
            </View>
          </View>

          <View style={styles.pointsSection}>
            <Ionicons name="diamond" size={24} color="#6366f1" />
            <Text style={styles.pointsText}>{product.points} points</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* Product details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Product Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Barcode</Text>
            <Text style={styles.detailValue}>{product.barcode}</Text>
          </View>

          <View style={styles.detailRowLast}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="calendar" size={16} color="#6b7280" />
              <Text style={styles.detailLabel}>Scanned</Text>
            </View>
            <Text style={styles.detailValue}>{formatDate(product.scannedAt)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={onContinue} style={styles.primaryButton}>
            <LinearGradient
              colors={["#6366f1", "#8b5cf6"]}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>
                Collect {product.points} Points
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Share Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  productImageCard: {
    margin: 24,
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 16,
  },
  productInfo: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  titleSection: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 18,
    color: "#6b7280",
  },
  metaSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  pointsSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6366f1",
    marginLeft: 8,
  },
  descriptionCard: {
    margin: 24,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  detailsCard: {
    margin: 24,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229, 231, 235, 0.5)",
  },
  detailRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailValue: {
    fontSize: 14,
    color: "#1f2937",
    fontFamily: "monospace",
  },
  actionsContainer: {
    padding: 24,
  },
  primaryButton: {
    marginBottom: 12,
    borderRadius: 12,
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default ProductDetails;