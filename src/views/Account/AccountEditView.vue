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


          </div>
        </ion-card>
      </div>
      <div class="absolute bottom-2 left-0 right-0 px-4">
        <ion-button expand="block" class="save-button" @click="handleSave" :disabled="!isFormValid">
          <ion-icon :icon="saveOutline" slot="start"></ion-icon>
          Save Changes
        </ion-button>
      </div>

      <!-- Custom Success Modal -->
      <div v-if="showSuccessModal" 
           class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
        <div class="w-full pb-12 max-w-md mx-4 bg-gradient-to-br from-[#FFF7D0] to-[#C8AD7E] rounded-2xl shadow-2xl transform transition-all duration-300 scale-100">
          <div class="p-6 text-center">
            <!-- Success Icon -->
            <div class="flex justify-center mb-6">
              <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
                <ion-icon :icon="checkmarkCircleOutline" class="text-4xl text-green-500"></ion-icon>
              </div>
            </div>
            
            <!-- Success Message -->
            <p class="text-xl font-semibold text-[#7A5C1E] mb-3 animate-fade-in">
              Profile Updated Successfully!
            </p>
            <p class="text-gray-600 animate-fade-in text-sm">
              Redirecting to home in {{ countdown }} seconds...
            </p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">  
// @ts-ignore - These imports are used in the template
import { IonPage, IonContent, IonBackButton, IonButtons, IonItem, IonLabel, IonInput, IonIcon, IonButton, IonHeader, IonToolbar, IonTitle, IonCard } from '@ionic/vue';
// @ts-ignore - These icons are used in the template
import { ref, computed, onUnmounted, watch, onMounted } from 'vue';
import { useAuthStore } from '../../stores/authStore';
// @ts-ignore - These icons are used in the template
import { personOutline, mailOutline, saveOutline, callOutline, locationOutline, chevronBackOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useRouter, useRoute } from 'vue-router';
import { database, ref as dbRef, update, get } from '../../config/firebase';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Form data
const userName = ref('');
const userEmail = ref('');
const userContact = ref('');
const userAddress = ref('');

// Fetch user data from Firebase
const fetchUserData = async () => {
  if (!authStore.user?.uid) return;
  
  try {
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
const countdown = ref(3);
let countdownInterval: number | null = null;

// Watch for route changes to close modal
watch(
  () => route.path,
  (newPath) => {
    if (newPath !== '/account/edit') {
      showSuccessModal.value = false;
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    }
  }
);

const startCountdown = () => {
  showSuccessModal.value = true;
  countdown.value = 3;
  
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  countdownInterval = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      showSuccessModal.value = false;
      router.push('/home');
    }
  }, 1000);
};

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
    
    // Show success modal and start countdown
    startCountdown();
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};

// Cleanup interval and modal when component is unmounted
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  showSuccessModal.value = false;
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
  --border-radius: 12px;
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
}

/* Remove old modal styles and add new animations */
@keyframes scale-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-scale-in {
  animation: scale-in 0.5s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

/* Remove old modal styles */
:deep(.success-modal) {
  display: none;
}
</style>
