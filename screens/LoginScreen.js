import React, { useState, useEffect, useContext } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import auth from "@react-native-firebase/auth";
import { View, TextInput, Logo, Button, FormErrorMessage } from "../components";
import { Images, Colors } from "../config";
import { AuthenticatedUserContext } from "../providers";
import { FacebookSignIn } from "../components/FacebookSignIn";
import { useTogglePasswordVisibility } from "../hooks";
import { loginValidationSchema } from "../utils";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { GoogleSignin } from "@react-native-google-signin/google-signin";
// import { GoogleSignIn } from "../components/GoogleSignIn";
// import { GoogleSignInButton } from "../components/GoogleSignIn";

export const LoginScreen = ({ navigation }) => {
  // const { user, setUser } = useContext(AuthenticatedUserContext);
  const [errorState, setErrorState] = useState(null);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "211046659413-7mk40kdelrjr6anp27t7n01t8444cjqj.apps.googleusercontent.com",
    });
  }, [navigation]);
  const GoogleSignInButton = () => {
    const provider = auth.GoogleAuthProvider;
    //handle Google SignIn function will change auth state
    const handleGoogleSignIn = async () => {
      try {
        await GoogleSignin.hasPlayServices();
        //why cant i choose google account
        const userInfo = await GoogleSignin.signIn();

        console.log("userinfo", userInfo.data.idToken);
        const credential = provider.credential(
          userInfo.data.idToken,
          userInfo.data.accessToken
        );
        auth()
          .signInWithCredential(credential)
          .then(({ user }) => {
            console.log("user", user);
          })
          .catch((error) => {
            console.log("error", error);
          });
      } catch (error) {
        console.log("error", error);
      }
    };
    const signOutAndRevokeAccess = async () => {
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        await auth().signOut();
      } catch (error) {
        console.error("Error signing out:", error);
      }
    };
    return (
      <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    );
  };
  const { passwordVisibility, handlePasswordVisibility, rightIcon } =
    useTogglePasswordVisibility();
  const handleLogin = (values) => {};

  return (
    <>
      <View isSafe style={styles.container}>
        <KeyboardAwareScrollView enableOnAndroid={true}>
          {/* LogoContainer: consist app logo and screen title */}
          <View style={styles.logoContainer}>
            <Logo uri={Images.logo} />
            <Text style={styles.screenTitle}>Welcome back!</Text>
          </View>
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={loginValidationSchema}
            onSubmit={(values) => handleLogin(values)}
          >
            {({
              values,
              touched,
              errors,
              handleChange,
              handleSubmit,
              handleBlur,
            }) => (
              <>
                {/* Input fields */}
                <TextInput
                  name="email"
                  leftIconName="email"
                  placeholder="Enter email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoFocus={true}
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                />
                <FormErrorMessage
                  error={errors.email}
                  visible={touched.email}
                />
                <TextInput
                  name="password"
                  leftIconName="key-variant"
                  placeholder="Enter password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={passwordVisibility}
                  textContentType="password"
                  rightIcon={rightIcon}
                  handlePasswordVisibility={handlePasswordVisibility}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                />
                <FormErrorMessage
                  error={errors.password}
                  visible={touched.password}
                />
                {/* Display Screen Error Messages */}
                {errorState !== "" ? (
                  <FormErrorMessage error={errorState} visible={true} />
                ) : null}
                {/* Login button */}
                <Button style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Login</Text>
                </Button>
                <GoogleSignInButton />
                <FacebookSignIn/>
                {/* Button to google sign in */}
                {/* <Button
                  style={styles.borderlessButtonContainer}
                  borderless
                  title={"Sign in with Google"}
                  onPress={handleGoogleSignIn}
                /> */}
              </>
            )}
          </Formik>
          {/* Button to navigate to SignupScreen to create a new account */}
          <Button
            style={styles.borderlessButtonContainer}
            borderless
            title={"Create a new account?"}
            onPress={() => navigation.navigate("Signup")}
          />
          <Button
            style={styles.borderlessButtonContainer}
            borderless
            title={"Forgot Password"}
            onPress={() => navigation.navigate("ForgotPassword")}
          />
        </KeyboardAwareScrollView>
      </View>

      {/* App info footer */}
      {/* <View style={styles.footer}>
        <Text style={styles.footerText}>Expo Firebase Starter App</Text>
      </View> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
  },
  logoContainer: {
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.black,
    paddingTop: 20,
  },
  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingBottom: 48,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.orange,
  },
  button: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: Colors.orange,
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: "700",
  },
  borderlessButtonContainer: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
