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
import { Image } from "expo-image";
import { Colors } from "@/constants/theme";

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
      {/* Header with logo + user */}
      <View style={styles.header}>
        <View style={styles.brandWrap}>
          <Image
            source={require("@/assets/images/hsy-logo.png")}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="HSY"
          />
          <View>
            <Text style={styles.appTitle}>HSY EcoScan</Text>
            <Text style={styles.welcomeText}>
              Welcome back, {userProfile?.name ?? ""}!
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={onProfile} style={styles.avatarButton}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(userProfile?.name?.charAt(0) ?? "").toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Points and level display */}
      <LinearGradient
        colors={["rgba(0,170,163,0.08)", "rgba(100,195,205,0.10)"]}
        style={styles.pointsCard}
      >
        <View style={styles.pointsContent}>
          <View style={styles.pointsLeft}>
            <LinearGradient
              colors={[Colors.light.tint, "#19C2C3"]}
              style={styles.coinsIcon}
            >
              <Ionicons name="diamond" size={24} color={Colors.light.buttonText} />
            </LinearGradient>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsValue}>
                {String(userProfile?.totalPoints ?? 0)}
              </Text>
              <Text style={styles.pointsLabel}>Total Points</Text>
            </View>
          </View>
          <View style={styles.pointsRight}>
            <Text style={styles.levelText}>
              {`Level ${String(userProfile?.level ?? 0)}`}
            </Text>
            <Text style={styles.scansText}>
              {`${String(userProfile?.scansToday ?? 0)} scans today`}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main scan button */}
      <View style={styles.scanButtonContainer}>
        <TouchableOpacity onPress={onScan} style={styles.scanButton}>
          <LinearGradient
            colors={[Colors.light.tint, "#19C2C3"]}
            style={styles.scanButtonGradient}
          >
            <Ionicons name="scan" size={64} color={Colors.light.buttonText} />
            <Text style={styles.scanButtonText}>Scan Product</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Quick stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsContent}>
          <View style={styles.statsIcon}>
            <Ionicons name="bar-chart" size={20} color={"#0F766E"} />
          </View>
          <View style={styles.statsInfo}>
            <Text style={styles.statsLabel}>Total Scans</Text>
            <Text style={styles.statsValue}>{String(scanCount ?? 0)}</Text>
          </View>
        </View>
      </View>

      {/* Menu options */}
      <View style={styles.menuOptions}>
        <TouchableOpacity onPress={onStatistics} style={styles.menuOption}>
          <Ionicons name="bar-chart" size={20} color={Colors.light.tint} />
          <View style={styles.menuOptionText}>
            <Text style={styles.menuOptionTitle}>Scan History</Text>
            <Text style={styles.menuOptionSubtitle}>
              View all scanned products
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onProfile} style={styles.menuOption}>
          <Ionicons name="person" size={20} color={Colors.light.tint} />
          <View style={styles.menuOptionText}>
            <Text style={styles.menuOptionTitle}>Profile</Text>
            <Text style={styles.menuOptionSubtitle}>
              Manage your account & stats
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleExternalLink} style={styles.menuOption}>
          <Ionicons name="open" size={20} color={Colors.light.tint} />
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
  container: { flex: 1, backgroundColor: Colors.light.background },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  brandWrap: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  logo: { width: 40, height: 40 },
  appTitle: { fontSize: 22, fontWeight: "800", color: Colors.light.tint },
  welcomeText: { fontSize: 14, color: Colors.light.icon, marginTop: 2 },

  avatarButton: { padding: 4 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.light.chipBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: Colors.light.tint },

  pointsCard: {
    marginHorizontal: 24,
    marginBottom: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  pointsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  pointsLeft: { flexDirection: "row", alignItems: "center" },
  coinsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pointsInfo: { alignItems: "flex-start" },
  pointsValue: { fontSize: 24, fontWeight: "bold", color: Colors.light.text },
  pointsLabel: { fontSize: 13, color: Colors.light.icon },

  pointsRight: { alignItems: "flex-end" },
  levelText: { fontSize: 16, fontWeight: "700", color: Colors.light.tint },
  scansText: { fontSize: 12, color: Colors.light.icon, marginTop: 2 },

  scanButtonContainer: { alignItems: "center", marginBottom: 28 },
  scanButton: { width: 192, height: 192, borderRadius: 96 },
  scanButtonGradient: {
    flex: 1,
    borderRadius: 96,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 8,
  },
  scanButtonText: {
    color: Colors.light.buttonText,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },

  statsCard: {
    backgroundColor: Colors.light.card,
    marginHorizontal: 24,
    marginBottom: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statsContent: { flexDirection: "row", alignItems: "center", padding: 16 },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(0,170,163,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statsInfo: { flex: 1 },
  statsLabel: { fontSize: 14, color: Colors.light.icon },
  statsValue: { fontSize: 22, fontWeight: "800", color: Colors.light.text },

  menuOptions: { paddingHorizontal: 24, paddingBottom: 40 },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  menuOptionText: { flex: 1, marginLeft: 12 },
  menuOptionTitle: { fontSize: 16, fontWeight: "600", color: Colors.light.text },
  menuOptionSubtitle: { fontSize: 13, color: Colors.light.icon, marginTop: 2 },
});

export default MainMenu;
