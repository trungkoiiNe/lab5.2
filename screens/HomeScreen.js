import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Button,
  Image,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Text,
} from "react-native";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import * as ImagePicker from "expo-image-picker";
import firestore from "@react-native-firebase/firestore";
import { Colors } from "../config";

export const HomeScreen = () => {
  const [avatar, setAvatar] = useState(null);
  const [userInfo, setUserInfo] = useState({
    Username: "",
    email: "",
  });
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    fetchAvatar();
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    const user = auth().currentUser;
    if (user) {
      const userDoc = await firestore()
        .collection("SystemUsers")
        .doc(user.uid)
        .get();
      if (userDoc.exists) {
        setUserInfo(userDoc.data());
        if (!userDoc.data().email) {
          setIsEditingEmail(true);
        }
      } else {
        const newUserInfo = {
          Username: user.displayName || "",
          email: user.email,
        };
        await firestore()
          .collection("SystemUsers")
          .doc(user.uid)
          .set(newUserInfo);
        setUserInfo(newUserInfo);
      }
    }
  };

  const updateUsername = async () => {
    const user = auth().currentUser;
    if (user) {
      await firestore()
        .collection("SystemUsers")
        .doc(user.uid)
        .update({ Username: newUsername });
      setUserInfo({ ...userInfo, Username: newUsername });
      setIsEditingUsername(false);
      console.log("Username updated successfully");
    }
  };

  const updateEmail = async () => {
    if (!isValidEmail(newEmail)) {
      setEmailError("Invalid email format");
      return;
    }

    setEmailError("");
    const user = auth().currentUser;
    if (user) {
      await firestore()
        .collection("SystemUsers")
        .doc(user.uid)
        .update({ email: newEmail });
      setUserInfo({ ...userInfo, email: newEmail });
      setIsEditingEmail(false);
      console.log("Email updated successfully");
    }
  };

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      const user = auth().currentUser;
      const reference = storage().ref(`${user.uid}.png`);
      console.log(result);
      let filePath = result.assets[0].uri;
      if (Platform.OS === "ios") {
        filePath = filePath.replace("file://", "");
      }

      try {
        await reference.putFile(filePath);
        console.log("Image uploaded successfully");
        fetchAvatar();
      } catch (error) {
        console.log("Error uploading image:", error);
      }
    }
  };

  const handleLogout = () => {
    auth()
      .signOut()
      .catch((error) => console.log("Error logging out: ", error));
  };
  const fetchAvatar = async () => {
    const user = auth().currentUser;
    if (user) {
      try {
        const url = await storage().ref(`${user.uid}.png`).getDownloadURL();
        setAvatar(url);
      } catch (error) {
        url = await storage().ref(`defaultavataaaaaaaaaa.jpg`).getDownloadURL();
        setAvatar(url);
        console.log("Avatar not found:", error);
      }
    }
  };
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          // <View style={styles.avatarPlaceholder}>
          //   <Text style={styles.avatarPlaceholderText}>No Avatar</Text>
          // </View>
          <Image source={{ uri: avatar }} style={styles.avatar} />
        )}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleImageUpload}
        >
          <Text style={styles.uploadButtonText}>Upload Avatar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Username</Text>
        <View style={styles.usernameContainer}>
          <Text style={styles.infoText}>{userInfo.Username}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditingUsername(true)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.usernameContainer}>
          <Text style={styles.infoText}>{userInfo.email}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditingEmail(true)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* <Text style={styles.label}>Age</Text> */}
      {/* <TextInput
          style={styles.input}
          placeholder="Enter your age"
          value={userInfo.age}
          onChangeText={(text) => setUserInfo({ ...userInfo, age: text })}
          keyboardType="numeric"
        /> */}

      <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditingUsername}
        onRequestClose={() => setIsEditingUsername(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.modalInput}
              placeholder="New Username"
              value={newUsername}
              onChangeText={setNewUsername}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={updateUsername}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditingUsername(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditingEmail}
        onRequestClose={() => setIsEditingEmail(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter Email"
              value={newEmail}
              onChangeText={(text) => {
                setNewEmail(text);
                setEmailError("");
              }}
              keyboardType="email-address"
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={updateEmail}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditingEmail(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.white,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.mediumGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarPlaceholderText: {
    color: Colors.white,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
  infoContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: Colors.black,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 15,
    color: Colors.black,
  },
  usernameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 14,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: Colors.mediumGray,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  signOutButton: {
    backgroundColor: Colors.red,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  signOutButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalInput: {
    width: 200,
    height: 40,
    borderColor: Colors.mediumGray,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: Colors.mediumGray,
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    color: Colors.red,
    fontSize: 14,
    marginBottom: 10,
  },
});
