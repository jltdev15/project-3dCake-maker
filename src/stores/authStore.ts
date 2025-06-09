import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth, database, ref as dbRef, set, get, onValue } from '../config/firebase';
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Preferences } from '@capacitor/preferences';

export interface UserData {
  uid: string;
  email: string | null;
  name: string | null;
  photoUrl: string | null;
  status: string | null;
  contact: string | null;
  address: string | null;
  isProfileCompleted: boolean;
}

// Extend Firebase User type
interface CustomUser extends User {
    address?: string | null;
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<UserData | null>(null);
    const isProfileCompleted = ref(false);
    let profileListener: (() => void) | null = null;

    const setUser = async (userData: UserData) => {
        user.value = userData;
        await Preferences.set({ key: "user", value: JSON.stringify(userData) }); // Store user in Capacitor Preferences
    };

    const loadUser = async () => {
        const storedUser = await Preferences.get({ key: "user" });
        if (storedUser.value) {
            user.value = JSON.parse(storedUser.value);
        }
    };

    const logout = async () => {
        await signOut(auth);
        user.value = null;
        isProfileCompleted.value = false;
        if (profileListener) {
            profileListener();
            profileListener = null;
        }
        await Preferences.remove({ key: "user" }); // Clear storage
    };

    const initAuth = async () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // First, get the user's profile data from Firebase
                    const userProfileRef = dbRef(database, `users/${firebaseUser.uid}`);
                    const profileSnapshot = await get(userProfileRef);
                    const profileData = profileSnapshot.exists() ? profileSnapshot.val() : null;

                    const customUser = firebaseUser as CustomUser;
                    const userData: UserData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: profileData?.name || firebaseUser.displayName,
                        photoUrl: firebaseUser.photoURL,
                        contact: profileData?.contact || null,
                        status: 'active',
                        address: profileData?.address || null,
                        isProfileCompleted: profileData?.isProfileCompleted || false
                    };
                    await setUser(userData);
                    
                    // Set up real-time listener for profile updates
                    profileListener = onValue(userProfileRef, (snapshot) => {
                        const data = snapshot.val();
                        if (data) {
                            isProfileCompleted.value = data.isProfileCompleted || false;
                            // Update user data with latest profile info
                            user.value = {
                                ...userData,
                                ...data,
                                isProfileCompleted: data.isProfileCompleted || false
                            };
                        }
                    });

                    // If user profile doesn't exist, create it
                    if (!profileSnapshot.exists()) {
                        await registerUser(userData);
                    }
                } catch (error) {
                    console.error('Error initializing auth:', error);
                }
            } else {
                await logout();
            }
        });
    };
    const registerUser = async (userData?: UserData) => {
        const uid = userData?.uid || user.value?.uid;
        if (!uid) {
            throw new Error("User ID is required for registration");
        }

        try {
            const userRef = dbRef(database, `users/${uid}`);

            const userSnapshot = await get(userRef);

            const operations: Promise<void>[] = [];

            if (!userSnapshot.exists()) {
                const newUserData: UserData = userData || {
                    uid: user.value!.uid,
                    email: user.value!.email || null,
                    name: user.value!.name || 'Anonymous User',
                    photoUrl: user.value!.photoUrl || null,
                    status: 'active',
                    contact: null,
                    address: null,
                    isProfileCompleted: false
                };
                operations.push(set(userRef, newUserData));
            }

            if (operations.length > 0) {
                await Promise.all(operations);
                console.log("User registration completed successfully");
            }
        } catch (err) {
            console.error("Error during user registration:", err instanceof Error ? err.message : "Unknown error");
            throw err;
        }
    };

  return {
    user,
    isProfileCompleted,
    registerUser,
    initAuth,
    loadUser,
    setUser,
    logout
  };
}); 