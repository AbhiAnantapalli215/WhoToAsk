import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useRouter } from "expo-router";

export default function AuthPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        router.replace("/account");
      }
    });
    return unsub;
  }, []);

  // Google sign-in (web only)
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    setError("");
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <View style={styles.loggedIn}>
        <Text style={styles.welcome}>Welcome, {user.email}</Text>
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
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>{isSignup ? "Sign Up" : "Login"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
        <Text style={styles.link}>
          {isSignup ? "Already have an account? Login" : "Don’t have an account? Sign up"}
        </Text>
      </TouchableOpacity>
  <View style={{ height: 1, width: "100%", backgroundColor: "#ccc", marginVertical: 20 }} />

  {/* Google Sign-in Button */}
  <TouchableOpacity
    onPress={handleGoogleLogin}
    style={{
      width: "100%",
      padding: 10,
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    }}
  >
    <Image
      source={{ uri: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" }}
      style={{ width: 20, height: 20, marginRight: 8 }}
    />
    <Text style={{ color: "#000", fontSize: 16 }}>Sign in with Google</Text>
  </TouchableOpacity>

  {/* Switch between Login and Signup */}
  <Text style={{ marginTop: 15, textAlign: "center", fontSize: 14 }}>
    {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
    <Text
      onPress={() => setIsSignup(!isSignup)}
      style={{ color: "#4285F4", fontWeight: "bold" }}
    >
      {isSignup ? "Login" : "Sign up"}
    </Text>
  </Text>
</View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: "#4285F4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "white", fontWeight: "bold" },
  error: { color: "red", marginBottom: 10 },
  link: {
    marginTop: 16,
    textAlign: "center",
    color: "#4285F4",
    fontWeight: "500",
  },
  loggedIn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcome: { fontSize: 18, marginBottom: 20 },
  logoutBtn: {
    backgroundColor: "#E63946",
    padding: 12,
    borderRadius: 8,
  },
  logoutText: { color: "white", fontWeight: "bold" },
});
