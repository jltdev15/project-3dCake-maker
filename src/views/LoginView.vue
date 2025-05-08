<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <button fill="clear" class="flex items-center mt-3 ml-3" @click="goToHome">
        <ion-icon :icon="arrowBack" slot="start"></ion-icon>
        Back to Home
      </button>
      <img src="/images/top-cake.png" alt="Cake at top" class="cake-top" />
      <div class="container flex flex-col items-center justify-center">
        <div class="logo-container">
          <img src="/images/logo.webp" alt="Cake Logo" class="rounded-full h-54 mb-9 w-auto mx-auto">
        </div>
        <div class="auth-panel ">
        <div class="border-white border-8 rounded-4xl p-4">
          <h2>LOGIN</h2>
          <h3>Welcome Back!</h3>
          <div class="input-group">
            <ion-item class="custom-input">
              <ion-input type="email" placeholder="Enter your email"></ion-input>
            </ion-item>
            
            <ion-item class="custom-input">
              <ion-input type="password" placeholder="Enter your password"></ion-input>
            </ion-item>
          </div>

          <div class="button-group">
            <ion-button expand="block">Login</ion-button>
            <ion-button @click="loginWithGoogle" expand="block" class="google-btn">
              <ion-icon :icon="logoGoogle" slot="start"></ion-icon>
              Login with Google
            </ion-button>
            <p>Don't have an account? <a @click="router.push({ name: 'Register' })" style="cursor: pointer;">Register</a></p>
          </div>

        </div>
          
        </div>
      </div>
      <img src="/images/home-cakce.png" alt="Cake at bottom" class="cake-bottom" />
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonButton, IonItem, IonInput, IonIcon } from '@ionic/vue';
import { arrowBack, logoGoogle } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { auth, signInWithCredential, GoogleAuthProvider, signInWithEmailAndPassword } from "../config/firebase";
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');

const email = ref('');
const password = ref('');

const goToHome = async () => {
  try {
    await router.replace('/');
  } catch (error) {
    console.error('Navigation error:', error);
  }
};
const loginWithGoogle = async () => {
  try {
    loading.value = true;
    error.value = '';

    const { authentication: { idToken } } = await GoogleAuth.signIn();
    const { user: firebaseUser } = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));

    if (firebaseUser) {
      await authStore.setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoUrl: firebaseUser.photoURL,
        status: 'active',
        contact: firebaseUser.phoneNumber
      });
      await authStore.registerUser();
      router.replace({ name: 'home' });
    }
  } catch (err) {
    console.error("Google Sign-In Error:", err);
    error.value = 'Failed to sign in. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
ion-content {
  --background: linear-gradient(to bottom, #F0E68D, #CAD08E);
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  z-index: 9999;
}

.auth-panel {
  background: rgba(239, 239, 239, 0.708);
  padding: 1.2rem;
  border-radius: 24px;
  box-shadow: none;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.auth-panel h2 {
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.auth-panel h3 {
  margin-bottom: 2rem;
  color: #666;
  font-size: 0.9rem;
  font-weight: normal;
}

.button-group {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;

}

ion-button {
  --background: transparent;
  --background-hover: transparent;
  --background-focused: transparent;
  --background-activated: transparent;
  --color: #010000;
  --border-radius: 999px;
  --border-width: 8px;
  --border-style: solid;
  --border-color: rgb(255, 255, 255);
  --box-shadow: none;
  height: 56px;
  font-weight: 500;
  font-size: 1.3rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0.5rem 0;
}

.cake-bottom {
  position: absolute;
  left: 15%;
  bottom: 0;
  transform: translateX(-50%);
  width: 250px; /* Adjust as needed */
  z-index: -999;
  pointer-events: none; /* Allows clicks to pass through */
  opacity: 0.7; /* Added opacity */
}
.cake-top {
  position: absolute;
  right: 10%;
  top: 0;
  transform: translateX(50%);
  width: 300px; /* Adjust as needed */
  z-index: -999;
  pointer-events: none; /* Allows clicks to pass through */
  opacity: 0.7; /* Added opacity */
}

.input-group {
  margin: 1rem 0;
  width: 100%;
}

.custom-input {
  --background: rgba(255, 255, 255, 0.8);
  --border-radius: 12px;
  --border-color: transparent;
  --border-width: 0;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  margin-bottom: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.custom-input ion-label {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.custom-input ion-input {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  font-size: 1rem;
  color: #333;
}

.custom-input::part(native) {
  padding: 0;
}

.google-btn {
  --background: #fff;
  --color: #757575;
  --border-color: #ddd;
  --border-width: 1px;
  --border-style: solid;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.google-btn ion-icon {
  margin-right: 8px;
  background: linear-gradient(45deg, #4285F4 0%, #4285F4 33%, #EA4335 33%, #EA4335 66%, #FBBC05 66%, #FBBC05 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
