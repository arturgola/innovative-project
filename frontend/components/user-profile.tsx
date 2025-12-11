import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
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

interface UserProfileProps {
  userProfile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserProfileScreen = ({
  userProfile,
  onBack,
  onUpdateProfile,
}: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userProfile.name);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSaveName = async () => {
    if (editedName.trim() === "") {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateProfile({ name: editedName.trim() });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getLevelProgress = () => {
    const currentLevelMin = (userProfile.level - 1) * 200;
    const nextLevelMin = userProfile.level * 100;
    const progress = ((userProfile.totalPoints - currentLevelMin) / 200) * 100;
    return Math.min(progress, 100);
  };

  const getNextLevelPoints = () => {
    const nextLevelMin = userProfile.level * 200;
    return Math.max(0, nextLevelMin - userProfile.totalPoints);
  };

  const achievements = [
    {
      name: "First Scan",
      description: "Complete your first product scan",
      unlocked: userProfile.totalPoints > 0,
      icon: "🎯",
    },
    {
      name: "Point Collector",
      description: "Earn 100 total points",
      unlocked: userProfile.totalPoints >= 100,
      icon: "💰",
    },
    {
      name: "Daily Scanner",
      description: "Scan 5 products in one day",
      unlocked: userProfile.scansToday >= 5,
      icon: "📱",
    },
    {
      name: "Level Up",
      description: "Reach level 5",
      unlocked: userProfile.level >= 5,
      icon: "⭐",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <LinearGradient
          colors={["rgba(0,170,163,0.1)", "rgba(100,195,205,0.1)"]}
          style={styles.profileCard}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    value={editedName}
                    onChangeText={setEditedName}
                    style={styles.nameInput}
                    placeholder="Enter your name"
                    returnKeyType="done"
                    onSubmitEditing={handleSaveName}
                  />
                  <TouchableOpacity
                    onPress={handleSaveName}
                    style={[
                      styles.saveButton,
                      isUpdating && styles.buttonDisabled,
                    ]}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#00AAA3" />
                    ) : (
                      <Ionicons name="checkmark" size={16} color="#00AAA3" />
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.nameContainer}>
                  <Text style={styles.userName}>{userProfile.name}</Text>
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={styles.editButton}
                  >
                    <Ionicons name="create" size={16} color="#00AAA3" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.levelContainer}>
                <Ionicons name="star" size={16} color="#008782" />
                <Text style={styles.levelText}>Level {userProfile.level}</Text>
              </View>
            </View>
          </View>

          {/* Level progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Progress to Level {userProfile.level + 1}
              </Text>
              <Text style={styles.progressPoints}>
                {getNextLevelPoints()} points needed
              </Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={["#00AAA3", "#008782"]}
                style={[
                  styles.progressFill,
                  { width: `${getLevelProgress()}%` },
                ]}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Stats cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="diamond" size={24} color="#00AAA3" />
            </View>
            <Text style={styles.statValue}>{userProfile.totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(100,195,205,0.2)" },
              ]}
            >
              <Ionicons name="trophy" size={24} color="#64C3CD" />
            </View>
            <Text style={styles.statValue}>{userProfile.scansToday}</Text>
            <Text style={styles.statLabel}>Scans Today</Text>
          </View>
        </View>

        {/* Member info */}
        <View style={styles.memberCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={20} color="#00AAA3" />
            <Text style={styles.cardTitle}>Member Information</Text>
          </View>

          <View style={styles.memberInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <View style={styles.infoValue}>
                <Ionicons name="calendar" size={16} color="#6b7280" />
                <Text style={styles.infoText}>
                  {formatDate(userProfile.joinedDate)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRowLast}>
              <Text style={styles.infoLabel}>Current Level</Text>
              <Text
                style={[
                  styles.infoText,
                  { color: "#00AAA3", fontWeight: "500" },
                ]}
              >
                Level {userProfile.level}
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="trophy" size={20} color="#00AAA3" />
            <Text style={styles.cardTitle}>Achievements</Text>
          </View>

          <View style={styles.achievementsGrid}>
            {achievements.map((achievement, index) => (
              <View
                key={achievement.name}
                style={[
                  styles.achievementItem,
                  {
                    backgroundColor: achievement.unlocked
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(156, 163, 175, 0.1)",
                    borderColor: achievement.unlocked
                      ? "rgba(16, 185, 129, 0.3)"
                      : "rgba(156, 163, 175, 0.3)",
                  },
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text
                  style={[
                    styles.achievementName,
                    {
                      color: achievement.unlocked ? "#10b981" : "#6b7280",
                    },
                  ]}
                >
                  {achievement.name}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>
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
  profileCard: {
    margin: 24,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,170,163,0.2)",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#00AAA3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  profileInfo: {
    flex: 1,
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    borderBottomWidth: 1,
    borderBottomColor: "#00AAA3",
    paddingBottom: 4,
    marginRight: 8,
  },
  saveButton: {
    padding: 4,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  levelText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#008782",
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  progressPoints: {
    fontSize: 14,
    color: "#6b7280",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(156, 163, 175, 0.2)",
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,170,163,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
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
  memberCard: {
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
  },
  memberInfo: {
    paddingTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229, 231, 235, 0.5)",
  },
  infoRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginLeft: 8,
  },
  achievementsCard: {
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
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementItem: {
    width: "47%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default UserProfileScreen;