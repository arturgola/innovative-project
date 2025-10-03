import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface CreateUserProps {
  onCreateUser: (name: string) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const CreateUserScreen = ({
  onCreateUser,
  onCancel,
  isLoading = false,
}: CreateUserProps) => {
  const [name, setName] = useState("");

  const handleCreateUser = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    try {
      await onCreateUser(name.trim());
    } catch (error) {
      Alert.alert("Error", "Failed to create user account. Please try again.");
    }
  };

  return (
    <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="person-add" size={80} color="white" />
          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>
            Let's get started with your eco-scanning journey!
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              maxLength={50}
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.buttonDisabled]}
            onPress={handleCreateUser}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.createButtonText}>Create Profile</Text>
              </>
            )}
          </TouchableOpacity>

          {onCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="scan" size={24} color="white" />
            <Text style={styles.featureText}>Scan eco-friendly products</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="trophy" size={24} color="white" />
            <Text style={styles.featureText}>Earn points and level up</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="stats-chart" size={24} color="white" />
            <Text style={styles.featureText}>Track your progress</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 24,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  createButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  features: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    marginLeft: 12,
  },
});

export default CreateUserScreen;
