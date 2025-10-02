import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface UserProfile {
  name: string;
  level: number;
  totalPoints: number;
  scansToday: number;
  joinedDate: string;
}

interface MainMenuProps {
  onScan: () => void;
  onStatistics: () => void;
  onProfile: () => void;
  scanCount: number;
  userProfile: UserProfile;
}

const { width } = Dimensions.get("window");

const MainMenu = ({
  onScan,
  onStatistics,
  onProfile,
  scanCount,
  userProfile,
}: MainMenuProps) => {
  const handleExternalLink = () => {
    Linking.openURL(
      "https://www.hsy.fi/jatteet-ja-kierratys/jateopas-ja-lajitteluohjeet/"
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with user info */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.appTitle}>ScanPro</Text>
          <Text style={styles.welcomeText}>
            Welcome back, {userProfile.name}!
          </Text>
        </View>

        <TouchableOpacity onPress={onProfile} style={styles.avatarButton}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Points and level display */}
      <LinearGradient
        colors={["rgba(99, 102, 241, 0.1)", "rgba(168, 85, 247, 0.1)"]}
        style={styles.pointsCard}
      >
        <View style={styles.pointsContent}>
          <View style={styles.pointsLeft}>
            <LinearGradient
              colors={["#6366f1", "#a855f7"]}
              style={styles.coinsIcon}
            >
              <Ionicons name="diamond" size={24} color="#ffffff" />
            </LinearGradient>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsValue}>{userProfile.totalPoints}</Text>
              <Text style={styles.pointsLabel}>Total Points</Text>
            </View>
          </View>
          <View style={styles.pointsRight}>
            <Text style={styles.levelText}>Level {userProfile.level}</Text>
            <Text style={styles.scansText}>
              {userProfile.scansToday} scans today
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main scan button */}
      <View style={styles.scanButtonContainer}>
        <TouchableOpacity onPress={onScan} style={styles.scanButton}>
          <LinearGradient
            colors={["#6366f1", "#8b5cf6"]}
            style={styles.scanButtonGradient}
          >
            <Ionicons name="scan" size={64} color="#ffffff" />
            <Text style={styles.scanButtonText}>Scan Product</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Quick stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsContent}>
          <View style={styles.statsIcon}>
            <Ionicons name="bar-chart" size={20} color="#10b981" />
          </View>
          <View style={styles.statsInfo}>
            <Text style={styles.statsLabel}>Total Scans</Text>
            <Text style={styles.statsValue}>{scanCount}</Text>
          </View>
        </View>
      </View>

      {/* Menu options */}
      <View style={styles.menuOptions}>
        <TouchableOpacity onPress={onStatistics} style={styles.menuOption}>
          <Ionicons name="bar-chart" size={20} color="#6366f1" />
          <View style={styles.menuOptionText}>
            <Text style={styles.menuOptionTitle}>Scan History</Text>
            <Text style={styles.menuOptionSubtitle}>
              View all scanned products
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onProfile} style={styles.menuOption}>
          <Ionicons name="person" size={20} color="#6366f1" />
          <View style={styles.menuOptionText}>
            <Text style={styles.menuOptionTitle}>Profile</Text>
            <Text style={styles.menuOptionSubtitle}>
              Manage your account & stats
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleExternalLink} style={styles.menuOption}>
          <Ionicons name="time" size={20} color="#6366f1" />
          <View style={styles.menuOptionText}>
            <Text style={styles.menuOptionTitle}>Go to Jäteopas</Text>
            <Text style={styles.menuOptionSubtitle}>Waste guide website</Text>
          </View>
          <Ionicons name="open" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerText: {
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  welcomeText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  avatarButton: {
    padding: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366f1",
  },
  pointsCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  pointsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  pointsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pointsInfo: {
    alignItems: "flex-start",
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  pointsLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  pointsRight: {
    alignItems: "flex-end",
  },
  levelText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6366f1",
  },
  scansText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  scanButtonContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  scanButton: {
    width: 192,
    height: 192,
    borderRadius: 96,
  },
  scanButtonGradient: {
    flex: 1,
    borderRadius: 96,
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
  scanButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  statsCard: {
    backgroundColor: "rgba(248, 250, 252, 0.5)",
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statsContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statsInfo: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  menuOptions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
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
  menuOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  menuOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  menuOptionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
});

export default MainMenu;