import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const AUTH_TOKEN_KEY = "@auth_token";
const USER_DATA_KEY = "@user_data";

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

class AuthService {
  // Save user & token to AsyncStorage + Firestore
  async saveAuthData(user: User): Promise<UserData> {
    try {
      const token = await user.getIdToken();
      const userData: UserData = {
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? "",
        photoURL: user.photoURL ?? undefined,
      };

      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, token],
        [USER_DATA_KEY, JSON.stringify(userData)],
      ]);

      // Save to Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, userData, { merge: true });

      return userData;
    } catch (error) {
      console.error("Error saving auth data:", error);
      throw error;
    }
  }

  // Get user/token from AsyncStorage
  async getAuthData(): Promise<{ token: string; userData: UserData } | null> {
    try {
      const [[, token], [, userDataString]] = await AsyncStorage.multiGet([
        AUTH_TOKEN_KEY,
        USER_DATA_KEY,
      ]);

      if (token && userDataString) {
        return {
          token,
          userData: JSON.parse(userDataString),
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting auth data:", error);
      return null;
    }
  }

  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  }

  async signInWithGoogle(idToken: string, accessToken: string): Promise<UserData> {
    try {
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      const result = await signInWithCredential(auth, credential);
      const userData = await this.saveAuthData(result.user);
      return userData;
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  }

  // Firebase Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      await this.clearAuthData();
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }

  // Firebase onAuthStateChanged
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

export const authService = new AuthService();
