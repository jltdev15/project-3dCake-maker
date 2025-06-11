<template>
  <ion-page class="account-edit-page">
    <ion-header class="ion-no-border">
      <!-- Modern Redesigned Toolbar -->
      <div class="relative bg-gradient-to-r from-[#F0E68D] via-[#E6D77A] to-[#DCC867] text-gray-800 shadow-xl">
        <!-- Background Pattern Overlay -->
        <div class="absolute inset-0 bg-black/5 opacity-20"></div>
        <div class="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-transparent"></div>

        <!-- Main Content -->
        <div class="relative px-4 py-3 sm:px-6 sm:py-4">
          <div class="flex items-center justify-between">
            <!-- Left Side - Back Button -->
            <div class="flex items-center">
              <button @click="router.back()"
                class="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 active:scale-95 transition-all duration-200 touch-manipulation">
                <ion-icon :icon="chevronBackOutline"
                  class="text-lg sm:text-xl text-gray-800 drop-shadow-sm group-hover:scale-110 transition-transform duration-200"></ion-icon>
              </button>
            </div>

            <!-- Center - Title Section -->
            <div class="flex-1 text-center mx-4">
              <div class="flex items-center justify-center space-x-2 sm:space-x-3">
                <div class="text-center">
                  <h1 class="text-lg sm:text-xl font-bold tracking-wide drop-shadow-sm text-gray-800">
                    Edit Profile
                  </h1>
                  <p class="text-xs sm:text-sm opacity-70 font-medium tracking-wide mt-0.5 text-gray-700">
                    Update your personal information
                  </p>
                </div>
              </div>
            </div>

            <!-- Right Side - Placeholder for potential actions -->
            <div class="flex items-center space-x-2 w-10 h-10 sm:w-12 sm:h-12">
              <!-- Ensured same width as back button for balance -->
              <!-- e.g., a refresh or help button if needed -->
            </div>
          </div>
        </div>
      </div>
    </ion-header>

    <ion-content>
      <div class="edit-container">
        <ion-card class="edit-form-card">
          <div class="form-header">
            <h2 class="form-title">Update Your Information</h2>
            <p class="form-subtitle">Make changes to your profile details</p>
          </div>

          <div class="form-content">
            <!-- Skeleton Loading UI -->
            <template v-if="isLoading">
              <div v-for="n in 4" :key="n" class="skeleton-item">
                <div class="skeleton-icon"></div>
                <div class="skeleton-content">
                  <div class="skeleton-label"></div>
                  <div class="skeleton-input"></div>
                </div>
              </div>
            </template>

            <!-- Actual Form Content -->
            <template v-else>
              <ion-item class="custom-input" :class="{ 'ion-invalid': errors.name }">
                <ion-icon :icon="personOutline" slot="start" class="input-icon"></ion-icon>
                <ion-label position="stacked">Name</ion-label>
                <ion-input v-model="userName" :value="authStore.user?.name" placeholder="Enter your name"
                  @ionBlur="validateName"></ion-input>
                <ion-note slot="error" color="danger">{{ errors.name }}</ion-note>
              </ion-item>

              <ion-item class="custom-input">
                <ion-icon :icon="mailOutline" slot="start" class="input-icon"></ion-icon>
                <ion-label position="stacked">Email</ion-label>
                <ion-input v-model="userEmail" :value="authStore.user?.email" disabled></ion-input>
              </ion-item>

              <ion-item class="custom-input" :class="{ 'ion-invalid': errors.contact }">
                <ion-icon :icon="callOutline" slot="start" class="input-icon"></ion-icon>
                <ion-label position="stacked">Contact Number</ion-label>
                <ion-input 
                  v-model="userContact"
                  type="tel"
                  placeholder="Enter your contact number"
                  @ionBlur="validateContact"
                ></ion-input>
                <ion-note slot="error" color="danger">{{ errors.contact }}</ion-note>
              </ion-item>

              <ion-item class="custom-input" :class="{ 'ion-invalid': errors.address }">
                <ion-icon :icon="locationOutline" slot="start" class="input-icon"></ion-icon>
                <ion-label position="stacked">Address</ion-label>
                <ion-input 
                  v-model="userAddress"
                  placeholder="Enter your address"
                  @ionBlur="validateAddress"
                ></ion-input>
                <ion-note slot="error" color="danger">{{ errors.address }}</ion-note>
              </ion-item>
            </template>
          </div>
        </ion-card>
      </div>
      <div class="absolute bottom-2 left-0 right-0 px-4">
        <ion-button 
          expand="block" 
          class="save-button capitalize" 
          @click="handleSave" 
          :disabled="!isFormValid || isSaving || isLoading"
        >
          <template v-if="isSaving">
            <div class="flex items-center justify-center w-full">
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Saving...</span>
            </div>
          </template>
          <template v-else>
            <ion-icon :icon="saveOutline" slot="start"></ion-icon>
            Save Changes
          </template>
        </ion-button>
      </div>

      <!-- Custom Success Modal -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showSuccessModal" 
             class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs"
             @click.self="closeSuccessModal">
          <!-- Confetti Container -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div v-for="n in 20" :key="n" 
                 class="confetti"
                 :style="{
                   '--delay': `${n * 0.1}s`,
                   '--x': `${Math.random() * 100}%`,
                   '--rotation': `${Math.random() * 360}deg`,
                   '--size': `${Math.random() * 10 + 5}px`,
                   '--color': `hsl(${Math.random() * 60 + 30}, 100%, 50%)`
                 }">
            </div>
          </div>

          <div class="w-full max-w-md mx-4">
            <!-- Modal Card -->
            <div class="relative overflow-hidden bg-gradient-to-br from-[#FFF9E6] to-[#E6D5A7] rounded-3xl shadow-2xl transform transition-all duration-300">
              <!-- Decorative Elements -->
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700]"></div>
              <div class="absolute -top-24 -right-24 w-48 h-48 bg-[#FFD700]/10 rounded-full blur-2xl"></div>
              <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-[#FFA500]/10 rounded-full blur-2xl"></div>

              <div class="relative p-8">
                <!-- Success Icon Container -->
                <div class="flex justify-center mb-6">
                  <div class="relative">
                    <!-- Outer Ring Animation -->
                    <div class="absolute inset-0 rounded-full border-4 border-green-200 animate-ping-slow"></div>
                    <!-- Icon Container -->
                    <div class="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110">
                      <ion-icon :icon="checkmarkCircleOutline" class="text-4xl text-white drop-shadow-md"></ion-icon>
                    </div>
                  </div>
                </div>
                
                <!-- Success Message -->
                <div class="text-center space-y-3">
                  <h3 class="text-2xl font-bold text-[#7A5C1E] ">
                    Success!
                  </h3>
                  <p class="text-[#5A4A2E] text-lg ">
                    Your profile has been updated successfully
                  </p>
                </div>

                <!-- Action Buttons -->
                <div class="mt-8 flex flex-col gap-3 justify-center ">
                  <button 
                    @click="closeSuccessModal"
                    class="px-6 h-10 py-3 bg-[#58091F] text-white rounded-xl font-semibold hover:bg-[#7A0C29] transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                    Continue
                  </button>
                  <button 
                    @click="() => {router.push('/account'); showSuccessModal = false;}"
                    class="h-10 px-6 py-3 text-[#58091F] rounded-xl font-semibold border border-[#58091F]/20 hover:bg-white transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">  
// @ts-ignore - These imports are used in the template
import { IonPage, IonContent, IonBackButton, IonButtons, IonItem, IonLabel, IonInput, IonIcon, IonButton, IonHeader, IonToolbar, IonTitle, IonCard } from '@ionic/vue';
// @ts-ignore - These icons are used in the template
import { ref, computed, onUnmounted, watch, onMounted, isProxy } from 'vue';
import { useAuthStore } from '../../stores/authStore';
// @ts-ignore - These icons are used in the template
import { personOutline, mailOutline, saveOutline, callOutline, locationOutline, chevronBackOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { database, ref as dbRef, update, get } from '../../config/firebase';

const router = useRouter();

const authStore = useAuthStore();

// Form data
const userName = ref('');
const userEmail = ref('');
const userContact = ref('');
const userAddress = ref('');

// Add loading state for initial data fetch
const isLoading = ref(true);

// Fetch user data from Firebase
const fetchUserData = async () => {
  if (!authStore.user?.uid) return;
  
  try {
    isLoading.value = true; // Start loading
    const userRef = dbRef(database, `users/${authStore.user.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      userName.value = userData.name || '';
      userEmail.value = userData.email || '';
      userContact.value = userData.contact || '';
      userAddress.value = userData.address || '';
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  } finally {
    // Add a small delay to prevent flickering
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
};

// Fetch user data when component is mounted
onMounted(() => {
  fetchUserData();
});

// Watch for auth store changes
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser?.uid) {
      fetchUserData();
    }
  }
);

// Error states
const errors = ref({
  name: '',
  contact: '',
  address: ''
});

// Success modal state
const showSuccessModal = ref(false);

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  router.replace('/account');
};

// Add loading state
const isSaving = ref(false);

const handleSave = async () => {
  // Validate all fields
  const isNameValid = validateName();
  const isContactValid = validateContact();
  const isAddressValid = validateAddress();

  if (!isNameValid || !isContactValid || !isAddressValid) {
    return; // Stop if validation fails
  }

  if (!authStore.user?.uid) return;
  
  try {
    isSaving.value = true; // Start loading state
    const userRef = dbRef(database, `users/${authStore.user.uid}`);
    const updatedData = {
      name: userName.value.trim(),
      email: userEmail.value,
      contact: userContact.value.trim(),
      address: userAddress.value.trim(),
      isProfileCompleted: true
    };
    
    await update(userRef, updatedData);
    
    // Update local store
    await authStore.setUser({
      ...authStore.user,
      ...updatedData
    });
    
    // Add a 2-second delay before showing the success modal
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success modal
    showSuccessModal.value = true;
  } catch (error) {
    console.error('Error updating profile:', error);
  } finally {
    isSaving.value = false; // End loading state
  }
};

// Cleanup modal when component is unmounted
onUnmounted(() => {
  showSuccessModal.value = false;
});

// Validation rules
const validateName = () => {
  if (!userName.value.trim()) {
    errors.value.name = 'Name is required';
    return false;
  }
  if (userName.value.length < 2) {
    errors.value.name = 'Name must be at least 2 characters long';
    return false;
  }
  errors.value.name = '';
  return true;
};

const validateContact = () => {
  if (!userContact.value.trim()) {
    errors.value.contact = 'Contact number is required';
    return false;
  }
  errors.value.contact = '';
  return true;
};

const validateAddress = () => {
  if (!userAddress.value.trim()) {
    errors.value.address = 'Address is required';
    return false;
  }
  if (userAddress.value.length < 5) {
    errors.value.address = 'Address must be at least 5 characters long';
    return false;
  }
  errors.value.address = '';
  return true;
};

const isFormValid = computed(() => {
  return !errors.value.name && !errors.value.contact && !errors.value.address;
});
</script>

<style scoped>
.account-edit-page {
  --background: linear-gradient(135deg, #FFF7D0 0%, #C8AD7E 100%);
  height: 100%;
}

/* ion-header {
  --background: #FFFFFF;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

ion-toolbar {
  --background: #7A5C1E;
  --border-width: 0;
  padding: 8px 16px;
}

.back-button {
  --color: #FFFFFF;
}

.edit-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
} */

.edit-container {
  padding: 16px;
  padding-top: 20px;
  max-width: 600px;
  margin: 0 auto;
  height: calc(100% - 20px); /* Subtract the top padding */
  overflow-y: auto;
}

/* New Edit Form Card Styles */
.edit-form-card {
  --background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  padding: 28px;
  margin: 0 0 24px 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
  height: fit-content; /* Only take the height it needs */
}

/* Commenting out old .edit-card styles */
/*
.edit-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
*/

.form-header {
  text-align: center;
  margin-bottom: 24px; /* Reduced from 32px */
}

.form-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #7A5C1E;
  margin: 0 0 8px 0;
}

.form-subtitle {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Reduced from 24px to save space */
}

.custom-input {
  --background: rgba(255, 255, 255, 0.8);
  --border-radius: 12px;
  --border-color: transparent;
  --border-width: 0;
  margin-bottom: 0.5rem; /* Reduced from 1rem */
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  align-items: flex-start;
}

.custom-input:focus-within {
  box-shadow: 0 4px 12px rgba(88, 9, 31, 0.15);
}

.input-icon {
  color: #58091F;
  font-size: 1.5rem;
  margin-top: 18px;
  margin-right: 12px;
  align-self: flex-start;
}

ion-label {
  color: #222;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 4px;
  margin-left: 0;
  margin-top: 12px;
}

ion-input {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  font-size: 1.1rem;
  color: #888;
  margin-left: 0;
  margin-top: 0;
  width: 100%;
  font-weight: 400;
}

.save-button {
  --background: #58091F;
  --background-hover: #7a0c2a;
  --background-activated: #7a0c2a;

  --box-shadow: 0 4px 12px rgba(88, 9, 31, 0.2);
  height: 56px;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 8px; /* Reduced from 16px */
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.save-button:hover {
  --background: #7a0c2a;
  transform: translateY(-2px);
  --box-shadow: 0 6px 16px rgba(88, 9, 31, 0.25);
}

.save-button:active {
  transform: translateY(0);
  --box-shadow: 0 2px 8px rgba(88, 9, 31, 0.2);
}

.save-button ion-icon {
  font-size: 20px;
  margin-right: 8px;
}

@media (max-width: 480px) {
  .edit-container {
    padding: 12px;
    padding-top: 16px;
  }

  .edit-form-card {
    padding: 20px;
  }

  .form-content {
    gap: 12px;
  }

  .form-header {
    margin-bottom: 20px;
  }
}

.custom-input.ion-invalid {
  --highlight-background: var(--ion-color-danger);
  --border-color: var(--ion-color-danger);
}

ion-note[slot="error"] {
  font-size: 0.8rem;
  margin-top: 4px;
  margin-left: 16px;
}

.save-button:disabled {
  --background: #cccccc;
  --background-hover: #cccccc;
  --background-activated: #cccccc;
  cursor: not-allowed;
  transform: none;
  --box-shadow: none;
  opacity: 0.8;
}

.save-button:not(:disabled) {
  --background: #58091F;
  --background-hover: #7a0c2a;
  --background-activated: #7a0c2a;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* New Modal Animations and Styles */
@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  75%, 100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

/* Confetti Animation */
@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(var(--rotation));
    opacity: 0;
  }
}

.confetti {
  position: absolute;
  top: -10px;
  left: var(--x);
  width: var(--size);
  height: var(--size);
  background-color: var(--color);
  opacity: 0.8;
  animation: confetti-fall 3s ease-in-out infinite;
  animation-delay: var(--delay);
}

/* Remove old modal styles */
:deep(.success-modal) {
  display: none;
}

/* Update modal animations */
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

/* Add transition classes for the backdrop */
.transition {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.duration-300 {
  transition-duration: 300ms;
}

.duration-200 {
  transition-duration: 200ms;
}

.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

.ease-in {
  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
}

/* Scale utilities */
.scale-95 {
  transform: scale(0.95);
}

.scale-100 {
  transform: scale(1);
}

/* Skeleton Loading Styles */
.skeleton-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.skeleton-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-top: 18px;
  margin-right: 12px;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-label {
  width: 80px;
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-top: 12px;
}

.skeleton-input {
  width: 100%;
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

