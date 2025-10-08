import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ApiService, ProductAnalysisResult } from "../services/api";
import { useAppContext } from "../contexts/app-context";

interface StatisticsScreenProps {
  onBack: () => void;
  onViewProduct: (product: ProductAnalysisResult) => void;
}

const StatisticsScreen = ({ onBack, onViewProduct }: StatisticsScreenProps) => {
  const { userProfile } = useAppContext();
  const [scannedProducts, setScannedProducts] = useState<
    ProductAnalysisResult[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserScans();
  }, [userProfile.id]);

  const fetchUserScans = async () => {
    if (!userProfile.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const scans = await ApiService.getUserScans(userProfile.id);
      setScannedProducts(scans);
    } catch (err) {
      console.error("Error fetching user scans:", err);
      setError("Failed to load scan history");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryStats = () => {
    const categories = scannedProducts.reduce(
      (acc: Record<string, number>, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      },
      {}
    );

    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
    }));
  };

  const getTotalPoints = () => {
    return scannedProducts.reduce(
      (total: number, product) => total + product.points,
      0
    );
  };

  const categoryStats = getCategoryStats();
  const totalPoints = getTotalPoints();

  const renderProduct = ({
    item: product,
    index,
  }: {
    item: ProductAnalysisResult;
    index: number;
  }) => (
    <View style={styles.productCard}>
      <View style={styles.productContent}>
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productIcon}>
              <Ionicons name="cube" size={24} color="#9ca3af" />
            </View>
            <View style={styles.productTitleContainer}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.productBrand} numberOfLines={1}>
                {product.brand}
              </Text>
            </View>
          </View>

          <View style={styles.productMeta}>
            <View style={styles.productMetaLeft}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar" size={12} color="#6b7280" />
                <Text style={styles.dateText}>
                  {formatDate(product.scannedAt)}
                </Text>
              </View>
            </View>
            <View style={styles.pointsContainer}>
              <Ionicons name="diamond" size={12} color="#6366f1" />
              <Text style={styles.pointsText}>{product.points} pts</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onViewProduct(product)}
          style={styles.viewButton}
        >
          <Ionicons name="eye" size={16} color="#6366f1" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryItem = ({
    item,
  }: {
    item: { category: string; count: number };
  }) => (
    <View style={styles.categoryItem}>
      <Text style={styles.categoryLabel}>{item.category}</Text>
      <View style={styles.categoryCountBadge}>
        <Text style={styles.categoryCount}>{item.count}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Statistics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading scan history...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={fetchUserScans}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Overview stats */}
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={["rgba(99, 102, 241, 0.1)", "rgba(99, 102, 241, 0.05)"]}
                style={styles.statCard}
              >
                <View style={styles.statContent}>
                  <View style={styles.statIcon}>
                    <Ionicons name="cube" size={20} color="#6366f1" />
                  </View>
                  <View style={styles.statInfo}>
                    <Text style={styles.statValue}>
                      {scannedProducts.length}
                    </Text>
                    <Text style={styles.statLabel}>Total Scans</Text>
                  </View>
                </View>
              </LinearGradient>

              <LinearGradient
                colors={["rgba(168, 85, 247, 0.1)", "rgba(168, 85, 247, 0.05)"]}
                style={styles.statCard}
              >
                <View style={styles.statContent}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: "rgba(168, 85, 247, 0.2)" },
                    ]}
                  >
                    <Ionicons name="diamond" size={20} color="#a855f7" />
                  </View>
                  <View style={styles.statInfo}>
                    <Text style={styles.statValue}>{totalPoints}</Text>
                    <Text style={styles.statLabel}>Points Earned</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Category breakdown */}
            {categoryStats.length > 0 && (
              <View style={styles.categorySection}>
                <Text style={styles.sectionTitle}>Categories Scanned</Text>
                <View style={styles.categoryCard}>
                  <FlatList
                    data={categoryStats}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item.category}
                    scrollEnabled={false}
                  />
                </View>
              </View>
            )}

            {/* Recent scans */}
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Recent Scans</Text>

              {scannedProducts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="cube" size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateText}>
                    No products scanned yet
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    Start scanning to see your history
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={scannedProducts.slice().reverse()}
                  renderItem={renderProduct}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </>
        )}
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
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  categorySection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229, 231, 235, 0.5)",
  },
  categoryLabel: {
    fontSize: 14,
    color: "#1f2937",
  },
  categoryCountBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  recentSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  productTitleContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  productBrand: {
    fontSize: 12,
    color: "#6b7280",
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productMetaLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 10,
    color: "#374151",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 10,
    color: "#6b7280",
    marginLeft: 4,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6366f1",
    marginLeft: 4,
  },
  viewButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 16,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default StatisticsScreen;
