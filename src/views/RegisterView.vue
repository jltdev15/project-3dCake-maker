<template>
  <ion-page>
    <ion-content>
      <div class="register-container">
        <!-- Back Button -->
        <button fill="clear" class="back-button" @click="goToHome">
          <ion-icon :icon="arrowBack"></ion-icon>
          <span>Back to Home</span>
        </button>

        <!-- Hero Section -->
        <div class="hero-section">
          <img src="/images/top-cake.png" alt="Decorative cake" class="hero-image" />
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <div class="logo-wrapper">
            <img src="/images/logo.webp" alt="PSALM Cakes Logo" class="brand-logo">
          </div>

          <div class="auth-card">
            <div class="auth-header">
              <h2 class="auth-title">Create Account</h2>
              <p class="auth-subtitle">Join our sweet community today!</p>
            </div>

            <div class="form-group">
              <ion-item class="form-input">
                <ion-input 
                  type="email" 
                  v-model="email"
                  placeholder="Enter your email"
                  :class="{ 'has-error': error }"
                ></ion-input>
              </ion-item>
              
              <ion-item class="form-input">
                <ion-input 
                  type="password" 
                  v-model="password"
                  placeholder="Create a password"
                  :class="{ 'has-error': error }"
                ></ion-input>
              </ion-item>

              <ion-item class="form-input">
                <ion-input 
                  type="password" 
                  v-model="confirmPassword"
                  placeholder="Confirm your password"
                  :class="{ 'has-error': error }"
                ></ion-input>
              </ion-item>

              <p v-if="error" class="error-message">{{ error }}</p>
            </div>

            <div class="action-buttons">
              <ion-button 
                expand="block" 
                class="primary-btn"
                :disabled="loading"
                @click="handleRegister"
              >
                <span v-if="!loading">Create Account</span>
                <ion-spinner v-else name="crescent"></ion-spinner>
              </ion-button>

              <div class="divider">
                <span>or</span>
              </div>

              <ion-button 
                expand="block" 
                class="google-btn"
                @click="loginWithGoogle"
                :disabled="loading"
              >
                <ion-icon :icon="logoGoogle"></ion-icon>
                <span>Continue with Google</span>
              </ion-button>
            </div>

            <p class="auth-footer">
              Already have an account? 
              <a @click="router.push({ name: 'Login' })" class="auth-link">Sign In</a>
            </p>
          </div>
        </div>

        <img src="/images/home-cakce.png" alt="Decorative cake" class="bottom-image" />
      </div>

      <!-- Success Modal -->
      <ion-modal :is-open="showSuccessModal" :backdrop-dismiss="false">
        <div class="success-modal">
          <div class="success-content">
            <div class="success-icon-wrapper">
              <ion-icon :icon="checkmarkCircle" class="success-icon"></ion-icon>
            </div>
            <div class="success-text">
              <h2>Welcome to PSALM Cakes!</h2>
              <p>Your account has been created successfully.</p>
              <div class="success-details">
                <p>Please check your email to verify your account:</p>
                <ul>
                  <li>Look for an email from PSALM Cakes</li>
                  <li>Click the verification link in the email</li>
                  <li>Return here to log in</li>
                </ul>
              </div>
              <p class="redirect-text">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonButton, IonItem, IonInput, IonIcon, IonSpinner, IonModal } from '@ionic/vue';
import { arrowBack, logoGoogle, checkmarkCircle } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { auth, signInWithCredential, GoogleAuthProvider, createUserWithEmailAndPassword, signOut } from "../config/firebase";
import { sendEmailVerification } from "firebase/auth";
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');
const showSuccessModal = ref(false);

const email = ref('');
const password = ref('');
const confirmPassword = ref('');

// Register components
defineOptions({
  components: {
    IonPage,
    IonContent,
    IonButton,
    IonItem,
    IonInput,
    IonIcon,
    IonSpinner,
    IonModal
  }
});

const goToHome = () => {
  router.push({ name: 'home' });
};

const handleRegister = async () => {
  if (!email.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters';
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    
    // Create the user
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email.value, password.value);
    
    if (firebaseUser) {
      try {
        // Send email verification
        await sendEmailVerification(firebaseUser);
        
        // Register user data while still authenticated
        await authStore.registerUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoUrl: firebaseUser.photoURL,
          status: 'pending', // Changed to pending until email is verified
          contact: firebaseUser.phoneNumber,
          address: null,
          isProfileCompleted: false
        });
        
        // Clear the auth store
        await authStore.logout();
        
        // Sign out from Firebase
        await signOut(auth);
        
        // Show success modal
        showSuccessModal.value = true;
        
        // Wait for 3 seconds before redirecting
        setTimeout(async () => {
          showSuccessModal.value = false;
          await router.replace({ name: 'Login' });
        }, 3000);
        
      } catch (dbError) {
        // If database write fails, delete the created user
        await firebaseUser.delete();
        throw dbError;
      }
    }
  } catch (err: any) {
    console.error("Registration Error:", err);
    if (err.code === 'auth/email-already-in-use') {
      error.value = 'This email is already registered. Please use a different email or try logging in.';
    } else if (err.code === 'auth/invalid-email') {
      error.value = 'Please enter a valid email address.';
    } else if (err.code === 'auth/weak-password') {
      error.value = 'Password is too weak. Please use a stronger password.';
    } else {
      error.value = `Registration failed: ${err.message || 'Please try again.'}`;
    }
  } finally {
    loading.value = false;
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
        contact: firebaseUser.phoneNumber,
        address: null,
        isProfileCompleted: false,
      });
      await authStore.registerUser();
      router.replace({ name: 'Login' });
    }
  } catch (err) {
    console.error("Google Sign-In Error:", err);
    error.value = 'Failed to sign in. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
ion-content {
  --background: linear-gradient(135deg, #F0E68D 0%, #CAD08E 100%);
}

.register-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.back-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #58091F;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: rgba(88, 9, 31, 0.1);
}

.hero-section {
  padding: 2rem 1.5rem;
  position: relative;
  z-index: 1;
}

.hero-image {
  position: absolute;
  right: -10%;
  top: 0;
  width: 300px;
  transform: rotate(-15deg);
  opacity: 0.8;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1.5rem;
  position: relative;
  z-index: 2;
}

.logo-wrapper {
  margin-bottom: 2rem;
}

.brand-logo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.auth-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-input {
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
  transition: box-shadow 0.3s ease;
}

.form-input:focus-within {
  box-shadow: 0 4px 12px rgba(88, 9, 31, 0.15);
}

.form-input ion-input {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  font-size: 1rem;
  color: #333;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.primary-btn {
  --background: #58091F;
  --background-hover: #7a0c2a;
  --background-activated: #7a0c2a;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(88, 9, 31, 0.2);
  height: 56px;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.google-btn {
  --background: #fff;
  --color: #757575;
  --border-color: #ddd;
  --border-width: 1px;
  --border-style: solid;
  --border-radius: 12px;
  height: 56px;
  font-weight: 500;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.google-btn ion-icon {
  font-size: 1.5rem;
  background: linear-gradient(45deg, #4285F4 0%, #4285F4 33%, #EA4335 33%, #EA4335 66%, #FBBC05 66%, #FBBC05 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
  color: #666;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.divider span {
  padding: 0 1rem;
  font-size: 0.875rem;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.875rem;
}

.auth-link {
  color: #58091F;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;
}

.auth-link:hover {
  color: #7a0c2a;
}

.bottom-image {
  position: absolute;
  left: -5%;
  bottom: -5%;
  width: 250px;
  transform: rotate(15deg);
  opacity: 0.8;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  z-index: 0;
}

@media (max-width: 768px) {
  .hero-image {
    width: 200px;
    right: -15%;
  }
  
  .bottom-image {
    width: 180px;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
  
  .brand-logo {
    width: 100px;
    height: 100px;
  }
}

.success-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  padding: 0;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.success-content {
  padding: 2rem;
}

.success-icon-wrapper {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
}

.success-icon {
  font-size: 48px;
  color: white;
}

.success-text h2 {
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.success-text p {
  color: #666;
  margin: 0.5rem 0;
  font-size: 1rem;
  line-height: 1.5;
}

.success-details {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  padding: 1rem;
  margin: 1.5rem 0;
  text-align: left;
}

.success-details p {
  color: #4CAF50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.success-details ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.success-details li {
  color: #666;
  padding: 0.25rem 0;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

.success-details li::before {
  content: "•";
  color: #4CAF50;
  font-weight: bold;
  margin-right: 0.5rem;
}

.redirect-text {
  color: #999;
  font-size: 0.9rem;
  margin-top: 1.5rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .success-modal {
    width: 95%;
    max-width: 350px;
  }
  
  .success-icon-wrapper {
    width: 70px;
    height: 70px;
  }
  
  .success-icon {
    font-size: 40px;
  }
  
  .success-text h2 {
    font-size: 1.3rem;
  }
}
</style>
