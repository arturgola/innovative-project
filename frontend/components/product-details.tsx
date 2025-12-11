import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Image,
  Linking,
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
  const [showAlternatives, setShowAlternatives] = useState(false);

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
              colors={["#E6FAFB", "#D9F0F2"]}
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
          </View>

          <View style={styles.pointsSection}>
            <Ionicons name="diamond" size={24} color="#00AAA3" />
            <Text style={styles.pointsText}>{product.points} points</Text>
          </View>
        </View>

        {/* Enhanced Description with AI Analysis */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Product Analysis</Text>

          {/* OpenAI Analysis */}
          <View style={styles.analysisSection}>
            <View style={styles.analysisSectionHeader}>
              <Ionicons name="bulb" size={20} color="#00AAA3" />
              <Text style={styles.analysisSectionTitle}>AI Analysis</Text>
            </View>
            <Text style={styles.descriptionText}>{product.description}</Text>

            {/* Alternative Answers - Expandable inline */}
            {product.alternativeAnswers &&
              product.alternativeAnswers.length > 0 && (
                <View style={styles.alternativesInlineContainer}>
                  <TouchableOpacity
                    onPress={() => setShowAlternatives(!showAlternatives)}
                    style={styles.alternativesInlineHeader}
                  >
                    <View style={styles.alternativesHeaderLeft}>
                      <Ionicons name="options" size={18} color="#6b7280" />
                      <Text style={styles.alternativesInlineTitle}>
                        Not satisfied? Try alternative answers
                      </Text>
                    </View>
                    <Ionicons
                      name={showAlternatives ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#6b7280"
                    />
                  </TouchableOpacity>

                  {showAlternatives && (
                    <View style={styles.alternativesInlineContent}>
                      <Text style={styles.alternativesSubtitle}>
                        Select a different interpretation if the primary
                        analysis doesn't match:
                      </Text>

                      {product.alternativeAnswers.map((alternative, index) => {
                        // Debug logging
                        if (index === 0) {
                          console.log(
                            "Alternative answer sample:",
                            JSON.stringify(alternative, null, 2)
                          );
                        }

                        return (
                          <View key={index} style={styles.alternativeItem}>
                            <View style={styles.alternativeItemHeader}>
                              <View style={styles.alternativeItemHeaderLeft}>
                                <Ionicons
                                  name="cube-outline"
                                  size={18}
                                  color="#00AAA3"
                                />
                                <Text style={styles.alternativeItemName}>
                                  {alternative.itemName}
                                </Text>
                              </View>
                              <View style={styles.alternativeConfidenceBadge}>
                                <Text style={styles.alternativeConfidenceText}>
                                  {alternative.confidence}%
                                </Text>
                              </View>
                            </View>

                            <View style={styles.alternativeMaterialRow}>
                              <Ionicons name="apps" size={14} color="#6b7280" />
                              <Text style={styles.alternativeMaterialText}>
                                Material: {alternative.material}
                              </Text>
                            </View>

                            <View style={styles.alternativeSortingBox}>
                              <Ionicons
                                name="information-circle"
                                size={16}
                                color="#00AAA3"
                              />
                              <Text style={styles.alternativeSortingText}>
                                {alternative.sortingExplanation}
                              </Text>
                            </View>

                            {alternative.wasteGuideMatch &&
                            alternative.wasteGuideMatch.title ? (
                              <View style={styles.alternativeHsyDetails}>
                                <View style={styles.alternativeHsyHeader}>
                                  <Ionicons
                                    name="leaf"
                                    size={16}
                                    color="#10b981"
                                  />
                                  <Text style={styles.alternativeHsyHeaderText}>
                                    HSY Waste Guide
                                  </Text>
                                </View>

                                <Text style={styles.alternativeHsyTitle}>
                                  {alternative.wasteGuideMatch.title}
                                </Text>

                                {alternative.wasteGuideMatch.synonyms &&
                                  alternative.wasteGuideMatch.synonyms.length >
                                    0 && (
                                    <Text style={styles.alternativeHsySynonyms}>
                                      Also:{" "}
                                      {alternative.wasteGuideMatch.synonyms
                                        .slice(0, 3)
                                        .join(", ")}
                                    </Text>
                                  )}

                                {alternative.wasteGuideMatch.notes && (
                                  <Text style={styles.alternativeHsyNotes}>
                                    {alternative.wasteGuideMatch.notes.replace(
                                      /<[^>]*>/g,
                                      ""
                                    )}
                                  </Text>
                                )}

                                {alternative.wasteGuideMatch.recyclingMethods &&
                                  alternative.wasteGuideMatch.recyclingMethods
                                    .length > 0 && (
                                    <View
                                      style={styles.alternativeRecyclingMethods}
                                    >
                                      <Text
                                        style={
                                          styles.alternativeRecyclingMethodsTitle
                                        }
                                      >
                                        Disposal:
                                      </Text>
                                      {alternative.wasteGuideMatch.recyclingMethods
                                        .slice(0, 2)
                                        .map((method, idx) => (
                                          <View
                                            key={idx}
                                            style={styles.alternativeMethodItem}
                                          >
                                            <Ionicons
                                              name={
                                                method.isFree
                                                  ? "checkmark-circle"
                                                  : "card"
                                              }
                                              size={12}
                                              color={
                                                method.isFree
                                                  ? "#10b981"
                                                  : "#f59e0b"
                                              }
                                            />
                                            <Text
                                              style={
                                                styles.alternativeMethodText
                                              }
                                            >
                                              {method.title}
                                              {method.isFree && " (Free)"}
                                            </Text>
                                          </View>
                                        ))}
                                    </View>
                                  )}
                              </View>
                            ) : alternative.hsyMatchId ? (
                              <View style={styles.alternativeHsyBadge}>
                                <Ionicons
                                  name="checkmark-circle"
                                  size={14}
                                  color="#10b981"
                                />
                                <Text style={styles.alternativeHsyText}>
                                  HSY Waste Guide match found (ID:{" "}
                                  {alternative.hsyMatchId})
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
          </View>

          {/* HSY Waste Guide Match */}
          {product.wasteGuideMatch ? (
            <View style={styles.analysisSection}>
              <View style={styles.analysisSectionHeader}>
                <Ionicons name="leaf" size={20} color="#10b981" />
                <Text style={styles.analysisSectionTitle}>
                  HSY Waste Guide API
                </Text>
              </View>

              <Text style={styles.hsyTitle}>
                {product.wasteGuideMatch.title}
              </Text>

              {product.wasteGuideMatch.synonyms &&
                product.wasteGuideMatch.synonyms.length > 0 && (
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
                    {product.wasteGuideMatch.notes.replace(/<[^>]*>/g, "")}
                  </Text>
                </View>
              )}

              {/* Waste Types */}
              {product.wasteGuideMatch.wasteTypes &&
                product.wasteGuideMatch.wasteTypes.length > 0 && (
                  <View style={styles.wasteTypesContainer}>
                    <Text style={styles.sectionSubtitle}>
                      Waste Classification:
                    </Text>
                    {product.wasteGuideMatch.wasteTypes.map(
                      (wasteType, index) => (
                        <View key={index} style={styles.wasteTypeItem}>
                          <Ionicons
                            name="information-circle"
                            size={16}
                            color="#6b7280"
                          />
                          <View style={styles.wasteTypeContent}>
                            <Text style={styles.wasteTypeTitle}>
                              {wasteType.title}
                            </Text>
                            <Text style={styles.wasteTypeDescription}>
                              {wasteType.description}
                            </Text>
                          </View>
                        </View>
                      )
                    )}
                  </View>
                )}

              {/* Recycling Methods */}
              {product.wasteGuideMatch.recyclingMethods &&
                product.wasteGuideMatch.recyclingMethods.length > 0 && (
                  <View style={styles.recyclingMethodsContainer}>
                    <Text style={styles.sectionSubtitle}>
                      Disposal Options:
                    </Text>
                    {product.wasteGuideMatch.recyclingMethods
                      .slice(0, 3)
                      .map((method, index) => (
                        <View key={index} style={styles.recyclingMethodItem}>
                          <Ionicons
                            name={method.isFree ? "checkmark-circle" : "card"}
                            size={16}
                            color={method.isFree ? "#10b981" : "#f59e0b"}
                          />
                          <View style={styles.recyclingMethodContent}>
                            <Text style={styles.recyclingMethodTitle}>
                              {method.title}
                            </Text>
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
          ) : (
            <View style={styles.analysisSection}>
              <View style={styles.analysisSectionHeader}>
                <Ionicons name="information-circle" size={20} color="#f59e0b" />
                <Text style={styles.analysisSectionTitle}>
                  HSY Waste Guide API
                </Text>
              </View>

              <View style={styles.noHSYMatchContainer}>
                <Text style={styles.noHSYMatchTitle}>
                  No specific waste guide match found
                </Text>
                <Text style={styles.noHSYMatchDescription}>
                  For detailed waste sorting and recycling instructions specific
                  to your area, please visit the official HSY waste guide:
                </Text>
                <TouchableOpacity
                  style={styles.hsyLinkButton}
                  onPress={() => {
                    Linking.openURL(
                      "https://www.hsy.fi/jatteet-ja-kierratys/jateopas-ja-lajitteluohjeet/"
                    );
                  }}
                >
                  <Ionicons name="globe" size={16} color="#00AAA3" />
                  <Text style={styles.hsyLinkText}>Visit HSY Waste Guide</Text>
                  <Ionicons name="open" size={16} color="#00AAA3" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* AI Recycling Advice - shown when no HSY match found */}
        {product.aiRecyclingAdvice && (
          <View style={styles.descriptionCard}>
            <View style={styles.analysisSection}>
              <View style={styles.analysisSectionHeader}>
                <Ionicons
                  name={
                    product.aiRecyclingAdvice.isDangerous ? "warning" : "bulb"
                  }
                  size={20}
                  color={
                    product.aiRecyclingAdvice.isDangerous
                      ? "#ef4444"
                      : "#00AAA3"
                  }
                />
                <Text style={styles.analysisSectionTitle}>
                  AI Recycling Advice
                </Text>
              </View>

              {product.aiRecyclingAdvice.isDangerous &&
                product.aiRecyclingAdvice.dangerWarning && (
                  <View style={styles.dangerWarningContainer}>
                    <View style={styles.dangerWarningHeader}>
                      <Ionicons name="warning" size={16} color="#ef4444" />
                      <Text style={styles.dangerWarningTitle}>
                        Safety Notice
                      </Text>
                    </View>
                    <Text style={styles.dangerWarningText}>
                      {product.aiRecyclingAdvice.dangerWarning}
                    </Text>
                    <TouchableOpacity
                      style={styles.hsyLinkButton}
                      onPress={() => {
                        Linking.openURL(
                          "https://www.hsy.fi/jatteet-ja-kierratys/jateopas-ja-lajitteluohjeet/"
                        );
                      }}
                    >
                      <Ionicons name="globe" size={16} color="#00AAA3" />
                      <Text style={styles.hsyLinkText}>
                        Visit HSY Waste Guide
                      </Text>
                      <Ionicons name="open" size={16} color="#00AAA3" />
                    </TouchableOpacity>
                  </View>
                )}

              <Text style={styles.aiRecyclingAdviceText}>
                {product.aiRecyclingAdvice.advice}
              </Text>

              {product.aiRecyclingAdvice.generalTips &&
                product.aiRecyclingAdvice.generalTips.length > 0 && (
                  <View style={styles.generalTipsContainer}>
                    <Text style={styles.generalTipsTitle}>Recycling Tips:</Text>
                    {product.aiRecyclingAdvice.generalTips.map((tip, index) => (
                      <View key={index} style={styles.generalTipItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#10b981"
                        />
                        <Text style={styles.generalTipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                )}
            </View>
          </View>
        )}

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
              colors={["#00AAA3", "#008782"]}
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

  pointsSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00AAA3",
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
    backgroundColor: "#E6FAFB",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#00AAA3",
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
  noHSYMatchContainer: {
    padding: 16,
    backgroundColor: "#fff7ed",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  noHSYMatchTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400e",
    marginBottom: 8,
  },
  noHSYMatchDescription: {
    fontSize: 14,
    color: "#451a03",
    lineHeight: 20,
    marginBottom: 16,
  },
  hsyLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00AAA3",
  },
  hsyLinkText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#00AAA3",
    marginHorizontal: 4,
  },
  // AI Recycling Advice styles
  dangerWarningContainer: {
    backgroundColor: "#fef2f2",
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  dangerWarningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dangerWarningTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
    marginLeft: 6,
  },
  dangerWarningText: {
    fontSize: 14,
    color: "#7f1d1d",
    lineHeight: 20,
    marginBottom: 12,
  },
  aiRecyclingAdviceText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 16,
  },
  generalTipsContainer: {
    marginTop: 8,
  },
  generalTipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  generalTipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  generalTipText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  // Alternative Answers Inline Styles
  alternativesInlineContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(229, 231, 235, 0.5)",
  },
  alternativesInlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  alternativesHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  alternativesInlineTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  alternativesInlineContent: {
    marginTop: 12,
  },
  alternativesSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 12,
  },
  alternativeItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  alternativeItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  alternativeItemHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  alternativeItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 6,
    flex: 1,
  },
  alternativeConfidenceBadge: {
    backgroundColor: "#E6FAFB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  alternativeConfidenceText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#00AAA3",
  },
  alternativeMaterialRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alternativeMaterialText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 6,
  },
  alternativeSortingBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#00AAA3",
    marginBottom: 6,
  },
  alternativeSortingText: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 16,
    marginLeft: 6,
    flex: 1,
  },
  alternativeHsyBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  alternativeHsyText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#10b981",
    marginLeft: 4,
  },
  // Alternative HSY Details Styles
  alternativeHsyDetails: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  alternativeHsyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  alternativeHsyHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
    marginLeft: 4,
  },
  alternativeHsyTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#065f46",
    marginBottom: 4,
  },
  alternativeHsySynonyms: {
    fontSize: 11,
    color: "#047857",
    fontStyle: "italic",
    marginBottom: 6,
  },
  alternativeHsyNotes: {
    fontSize: 11,
    color: "#065f46",
    lineHeight: 16,
    marginBottom: 6,
    paddingLeft: 4,
  },
  alternativeRecyclingMethods: {
    marginTop: 6,
  },
  alternativeRecyclingMethodsTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#065f46",
    marginBottom: 4,
  },
  alternativeMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  alternativeMethodText: {
    fontSize: 11,
    color: "#064e3b",
    marginLeft: 4,
  },
  // Old styles to remove
  alternativesCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginHorizontal: 24,
    marginTop: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  alternativesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  alternativesHeaderTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 10,
    flex: 1,
  },
  alternativesContent: {
    padding: 16,
  },
});

export default ProductDetails;
