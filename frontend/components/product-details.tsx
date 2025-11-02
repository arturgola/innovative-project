import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Product } from "../types";

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
        {/* Product image */}
        <View style={styles.productImageContainer}>
          {product.photoUri ? (
            <Image
              source={{ uri: product.photoUri }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={["#f8fafc", "#f1f5f9"]}
              style={styles.productImageCard}
            >
              <Ionicons name="cube" size={96} color="#9ca3af" />
              <Text style={styles.imagePlaceholderText}>Product Image</Text>
            </LinearGradient>
          )}
          {product.photoUri && (
            <View style={styles.imageOverlay}>
              <View style={styles.cameraIndicator}>
                <Ionicons name="camera" size={16} color="#ffffff" />
                <Text style={styles.cameraText}>Scanned Image</Text>
              </View>
            </View>
          )}
        </View>

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

        {/* Enhanced Description with AI Analysis */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Product Analysis</Text>
          
          {/* OpenAI Analysis */}
          <View style={styles.analysisSection}>
            <View style={styles.analysisSectionHeader}>
              <Ionicons name="bulb" size={20} color="#6366f1" />
              <Text style={styles.analysisSectionTitle}>AI Analysis</Text>
            </View>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* HSY Waste Guide Match */}
          {product.wasteGuideMatch && (
            <View style={styles.analysisSection}>
              <View style={styles.analysisSectionHeader}>
              <Ionicons name="leaf" size={20} color="#10b981" />
                <Text style={styles.analysisSectionTitle}>Waste Disposal Guide</Text>
                <View style={styles.matchScoreBadge}>
                  <Text style={styles.matchScoreText}>
                    {product.wasteGuideMatch.matchScore}% match
                  </Text>
                </View>
              </View>
              
              <Text style={styles.hsyTitle}>{product.wasteGuideMatch.title}</Text>
              
              {product.wasteGuideMatch.synonyms && product.wasteGuideMatch.synonyms.length > 0 && (
                <View style={styles.synonymsContainer}>
                  <Text style={styles.synonymsLabel}>Also known as:</Text>
                  <Text style={styles.synonymsText}>
                    {product.wasteGuideMatch.synonyms.join(", ")}
                  </Text>
                </View>
              )}

              {product.wasteGuideMatch.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>
                    {product.wasteGuideMatch.notes.replace(/<[^>]*>/g, '')}
                  </Text>
                </View>
              )}

              {/* Waste Types */}
              {product.wasteGuideMatch.wasteTypes && product.wasteGuideMatch.wasteTypes.length > 0 && (
                <View style={styles.wasteTypesContainer}>
                  <Text style={styles.sectionSubtitle}>Waste Classification:</Text>
                  {product.wasteGuideMatch.wasteTypes.map((wasteType, index) => (
                    <View key={index} style={styles.wasteTypeItem}>
                      <Ionicons name="information-circle" size={16} color="#6b7280" />
                      <View style={styles.wasteTypeContent}>
                        <Text style={styles.wasteTypeTitle}>{wasteType.title}</Text>
                        <Text style={styles.wasteTypeDescription}>{wasteType.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Recycling Methods */}
              {product.wasteGuideMatch.recyclingMethods && product.wasteGuideMatch.recyclingMethods.length > 0 && (
                <View style={styles.recyclingMethodsContainer}>
                  <Text style={styles.sectionSubtitle}>Disposal Options:</Text>
                  {product.wasteGuideMatch.recyclingMethods.slice(0, 3).map((method, index) => (
                    <View key={index} style={styles.recyclingMethodItem}>
                      <Ionicons 
                        name={method.isFree ? "checkmark-circle" : "card"} 
                        size={16} 
                        color={method.isFree ? "#10b981" : "#f59e0b"} 
                      />
                      <View style={styles.recyclingMethodContent}>
                        <Text style={styles.recyclingMethodTitle}>{method.title}</Text>
                        <Text style={styles.recyclingMethodDescription}>
                          {method.description}
                        </Text>
                        {method.isFree && (
                          <Text style={styles.freeTag}>Free of charge</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
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
            <Text style={styles.detailValue}>
              {formatDate(product.scannedAt)}
            </Text>
          </View>
        </View>

        {/* AI Analysis Information */}
        {product.ecoScore !== undefined && (
          <View style={styles.aiAnalysisCard}>
            <Text style={styles.aiAnalysisTitle}>
              AI Environmental Analysis
            </Text>

            {product.objectMaterial && (
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Material Type</Text>
                <Text style={styles.analysisValue}>
                  {product.objectMaterial}
                </Text>
              </View>
            )}

            {product.ecoScore !== undefined && (
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Eco Score</Text>
                <View style={styles.ecoScoreContainer}>
                  <Text style={styles.ecoScoreValue}>
                    {product.ecoScore}/100
                  </Text>
                  <View style={styles.ecoScoreBar}>
                    <View
                      style={[
                        styles.ecoScoreFill,
                        {
                          width: `${product.ecoScore}%`,
                          backgroundColor:
                            product.ecoScore >= 70
                              ? "#10b981"
                              : product.ecoScore >= 40
                              ? "#f59e0b"
                              : "#ef4444",
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}

            {product.recyclability && (
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Recyclability</Text>
                <Text style={styles.analysisValue}>
                  {product.recyclability}
                </Text>
              </View>
            )}

            {product.confidence !== undefined && (
              <View style={styles.analysisRowLast}>
                <Text style={styles.analysisLabel}>AI Confidence</Text>
                <Text style={styles.analysisValue}>{product.confidence}%</Text>
              </View>
            )}

            {product.suggestions && product.suggestions.length > 0 && (
              <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsTitle}>
                  Eco-Friendly Suggestions
                </Text>
                {product.suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionItem}>
                    <Ionicons name="leaf" size={14} color="#10b981" />
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

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

          <TouchableOpacity
            onPress={handleShare}
            style={styles.secondaryButton}
          >
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
  productImageContainer: {
    position: "relative",
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#f9fafb",
  },
  imageOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  cameraIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cameraText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },
  aiAnalysisCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginHorizontal: 24,
    marginTop: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  aiAnalysisTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  analysisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229, 231, 235, 0.5)",
  },
  analysisRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  analysisLabel: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  analysisValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
    textAlign: "right",
  },
  ecoScoreContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  ecoScoreValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "600",
    marginBottom: 4,
  },
  ecoScoreBar: {
    width: 100,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  ecoScoreFill: {
    height: "100%",
    borderRadius: 3,
  },
  suggestionsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(229, 231, 235, 0.5)",
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  // Enhanced Description Styles
  analysisSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229, 231, 235, 0.3)",
  },
  analysisSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
    flex: 1,
  },
  matchScoreBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchScoreText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
  },
  hsyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  synonymsContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  synonymsLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  synonymsText: {
    fontSize: 14,
    color: "#374151",
    fontStyle: "italic",
  },
  notesContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#fef7ff",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  notesText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  wasteTypesContainer: {
    marginBottom: 16,
  },
  wasteTypeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
  },
  wasteTypeContent: {
    flex: 1,
    marginLeft: 8,
  },
  wasteTypeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
    marginBottom: 4,
  },
  wasteTypeDescription: {
    fontSize: 13,
    color: "#451a03",
    lineHeight: 18,
  },
  recyclingMethodsContainer: {
    marginBottom: 8,
  },
  recyclingMethodItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
  },
  recyclingMethodContent: {
    flex: 1,
    marginLeft: 8,
  },
  recyclingMethodTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065f46",
    marginBottom: 4,
  },
  recyclingMethodDescription: {
    fontSize: 13,
    color: "#064e3b",
    lineHeight: 18,
    marginBottom: 4,
  },
  freeTag: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
    fontStyle: "italic",
  },
});

export default ProductDetails;
