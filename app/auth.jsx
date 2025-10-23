import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function AuthPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  // Different redirect URIs for web vs mobile
  const redirectUri = useMemo(() => 
    AuthSession.makeRedirectUri({
      scheme: Platform.OS === 'web' ? undefined : 'myapp',
      useProxy: Platform.OS !== 'web',
    }),
    []
  );

  console.log("Redirect URI:", redirectUri);

  // Configure Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "919532266925-q341n37m66gnjphfc76isl10oj01s8s9.apps.googleusercontent.com",
    webClientId: "919532266925-rsi2ff0cq4q3rp1ejsr1l4snirqn2p6c.apps.googleusercontent.com",
    redirectUri: redirectUri,
  });

  useEffect(() => {
    // Firebase auth listener
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        try {
          router.replace("/account");
        } catch (e) {
          console.log("Router navigation failed:", e);
        }
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  // Watch for Google auth response
  useEffect(() => {
    if (!response) return;

    const handleResponse = async () => {
      console.log("=== Google Auth Response ===");
      console.log("Type:", response.type);
      
      if (response.type === "success") {
        setLoadingAuth(true);
        setError("");
        
        try {
          const { authentication } = response;
          
          if (!authentication) {
            throw new Error("No authentication data received");
          }

          const { idToken, accessToken } = authentication;
          
          console.log("Tokens:", {
            hasIdToken: !!idToken,
            hasAccessToken: !!accessToken,
            idTokenLength: idToken?.length,
            accessTokenLength: accessToken?.length
          });

          // Create Firebase credential
          let credential;
          if (idToken) {
            console.log("Using ID token for Firebase");
            credential = GoogleAuthProvider.credential(idToken, accessToken);
          } else if (accessToken) {
            console.log("Using access token for Firebase");
            credential = GoogleAuthProvider.credential(null, accessToken);
          } else {
            throw new Error("No valid tokens received from Google");
          }

          console.log("Signing in to Firebase...");
          const result = await signInWithCredential(auth, credential);
          console.log("✅ Success! Signed in as:", result.user.email);
          
          if (Platform.OS !== 'web') {
            Alert.alert("Success", `Signed in as ${result.user.email}`);
          }
          
        } catch (err) {
          console.error("❌ Firebase sign-in error:", err);
          console.error("Error code:", err.code);
          console.error("Error message:", err.message);
          
          let errorMessage = "Google sign-in failed";
          
          if (err.code === "auth/account-exists-with-different-credential") {
            errorMessage = "An account already exists with this email using a different sign-in method";
          } else if (err.code === "auth/invalid-credential") {
            errorMessage = "Invalid credentials. Please check your Firebase configuration";
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          setError(errorMessage);
          if (Platform.OS !== 'web') {
            Alert.alert("Error", errorMessage);
          }
        } finally {
          setLoadingAuth(false);
        }
      } else if (response.type === "error") {
        console.error("❌ Google auth error:", response.error);
        
        let errorMessage = "Authentication failed";
        
        if (response.error?.message?.includes("redirect_uri_mismatch")) {
          errorMessage = `Redirect URI mismatch! Add this to Google Console: ${redirectUri}`;
        } else if (response.error?.message) {
          errorMessage = response.error.message;
        }
        
        setError(errorMessage);
        if (Platform.OS !== 'web') {
          Alert.alert("Error", errorMessage);
        }
      } else if (response.type === "dismiss" || response.type === "cancel") {
        console.log("⚠️ User dismissed/cancelled Google sign-in");
        setError("");
      }
    };

    handleResponse();
  }, [response, redirectUri]);

  // Email/password handlers
  const handleSubmit = async () => {
    setError("");
    
    if (!email || !password) {
      setError("Please provide email and password.");
      return;
    }
    
    setLoadingAuth(true);
    
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      console.error("Email auth error:", err);
      
      let errorMessage = "Authentication failed";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed. Please try again.");
    }
  };

  // Google button pressed
  const handleGoogleLogin = async () => {
    setError("");
    
    if (!request) {
      setError("Google sign-in is not ready yet. Please wait and try again.");
      return;
    }
    
    try {
      console.log("=== Starting Google Sign-In ===");
      console.log("Platform:", Platform.OS);
      console.log("Redirect URI:", redirectUri);
      console.log("Request ready:", !!request);
      
      // For mobile (Expo Go), use proxy
      // For web, don't use proxy
      const result = await promptAsync({ 
        useProxy: Platform.OS !== 'web',
        showInRecents: Platform.OS === 'android'
      });
      
      console.log("PromptAsync completed with type:", result.type);
      
    } catch (err) {
      console.error("❌ Error in promptAsync:", err);
      setError("Failed to open Google sign-in. Please try again.");
    }
  };

  // If user signed-in show a simple logged-in view
  if (user) {
    return (
      <View style={styles.loggedIn}>
        <Text style={styles.welcome}>Welcome!</Text>
        <Text style={styles.email}>{user.email}</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignup ? "Create Account" : "Login"}</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#999"
        editable={!loadingAuth}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        placeholderTextColor="#999"
        editable={!loadingAuth}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity 
        style={[styles.submitBtn, loadingAuth && styles.btnDisabled]} 
        onPress={handleSubmit} 
        disabled={loadingAuth}
      >
        {loadingAuth ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>
            {isSignup ? "Sign Up" : "Login"}
          </Text>
        )}
      </TouchableOpacity>
      {Platform.OS === 'web' && (
        <>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Sign-in Button */}
        <TouchableOpacity
          onPress={handleGoogleLogin}
          style={[styles.googleBtn, (!request || loadingAuth) && styles.btnDisabled]}
          activeOpacity={0.8}
          disabled={!request || loadingAuth}
        >
          {loadingAuth ? (
            <ActivityIndicator color="#4285F4" />
          ) : (
            <>
              <Image
                source={{ 
                  uri: "https://developers.google.com/identity/images/g-logo.png" 
                }}
                style={styles.googleLogo}
                resizeMode="contain"
              />
              <Text style={styles.googleText}>
                {!isSignup? "Sign in with Google" : "Sign up with Google"}
              </Text>
            </>
          )}
        </TouchableOpacity>
        </>
      )}
      <Text style={styles.small}>
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <Text onPress={() => setIsSignup(!isSignup)} style={styles.signupLink}>
          {isSignup ? "Login" : "Sign up"}
        </Text>
      </Text>

      <View style={{ height: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "sans-serif",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: "#4285F4",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitText: { color: "white", fontWeight: "700", fontSize: 16 },
  error: { 
    color: "red", 
    marginBottom: 10, 
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
  googleBtn: {
    width: "100%",
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  googleLogo: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  googleText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
  small: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },
  signupLink: {
    color: "#4285F4",
    fontWeight: "700",
  },
  loggedIn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  welcome: { 
    fontSize: 24, 
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center" 
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  logoutBtn: {
    backgroundColor: "#E63946",
    padding: 14,
    borderRadius: 8,
    minWidth: 140,
    alignItems: "center",
  },
  logoutText: { color: "white", fontWeight: "bold", fontSize: 16 },
});