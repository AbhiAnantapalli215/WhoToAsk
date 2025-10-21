import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Platform } from "react-native";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    expoClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  async function signIn() {
    if (Platform.OS === "web") {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } else {
      await promptAsync();
    }
  }

  return { signIn, request };
}
