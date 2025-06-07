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
            <div class="flex items-center space-x-2 w-10 h-10 sm:w-12 sm:h-12"> <!-- Ensured same width as back button for balance -->
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
            <ion-item class="custom-input">
              <ion-icon :icon="personOutline" slot="start" class="input-icon"></ion-icon>
              <ion-label position="stacked">Name</ion-label>
              <ion-input v-model="userName" :value="authStore.user?.name" placeholder="Enter your name"></ion-input>
            </ion-item>

            <ion-item class="custom-input">
              <ion-icon :icon="mailOutline" slot="start" class="input-icon"></ion-icon>
              <ion-label position="stacked">Email</ion-label>
              <ion-input v-model="userEmail" :value="authStore.user?.email" disabled></ion-input>
            </ion-item>

            <ion-item class="custom-input">
              <ion-icon :icon="callOutline" slot="start" class="input-icon"></ion-icon>
              <ion-label position="stacked">Contact Number</ion-label>
              <ion-input 
                v-model="userContact" 
                :value="authStore.user?.contact" 
                type="tel"
                placeholder="Enter your contact number"
              ></ion-input>
            </ion-item>

            <ion-item class="custom-input">
              <ion-icon :icon="locationOutline" slot="start" class="input-icon"></ion-icon>
              <ion-label position="stacked">Address</ion-label>
              <ion-input 
                v-model="userAddress" 
                :value="authStore.user?.address" 
                placeholder="Enter your address"
              ></ion-input>
            </ion-item>

            <ion-button expand="block" class="save-button" @click="handleSave">
              <ion-icon :icon="saveOutline" slot="start"></ion-icon>
              Save Changes
            </ion-button>
          </div>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">  
// @ts-ignore - These imports are used in the template
import { IonPage, IonContent, IonBackButton, IonButtons, IonItem, IonLabel, IonInput, IonIcon, IonButton, IonHeader, IonToolbar, IonTitle, IonCard } from '@ionic/vue';
// @ts-ignore - These icons are used in the template
import { ref } from 'vue';
import { useAuthStore } from '../../stores/authStore';
// @ts-ignore - These icons are used in the template
import { personOutline, mailOutline, saveOutline, callOutline, locationOutline, chevronBackOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { database, ref as dbRef, update } from '../../config/firebase';

const router = useRouter();
const authStore = useAuthStore();
const userName = ref(authStore.user?.name || '');
const userEmail = ref(authStore.user?.email || '');
const userContact = ref(authStore.user?.contact || '');
const userAddress = ref(authStore.user?.address || '');

const handleSave = async () => {
  if (!authStore.user?.uid) return;
  
  try {
    const userRef = dbRef(database, `users/${authStore.user.uid}`);
    await update(userRef, {
      name: userName.value,
      email: userEmail.value,
      contact: userContact.value,
      address: userAddress.value
    });
    
    // Update local store
    await authStore.setUser({
      ...authStore.user,
      name: userName.value,
      email: userEmail.value,
      contact: userContact.value,
      address: userAddress.value
    });
    
    router.push('/account');
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
</script>

<style scoped>
.account-edit-page {
  --background: linear-gradient(135deg, #FFF7D0 0%, #C8AD7E 100%);
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
  padding-top: 20px; /* Adjusted from 80px due to new header style */
  max-width: 600px;
  margin: 0 auto;
}

/* New Edit Form Card Styles */
.edit-form-card {
  --background: rgba(255, 255, 255, 0.98);
  border-radius: 20px; /* Consistent with profile-card */
  padding: 28px; /* Consistent with profile-card */
  margin: 0 0 24px 0; /* Margin within the container */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12); /* Consistent with profile-card */
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
  margin-bottom: 32px;
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
  gap: 24px;
}

.custom-input {
  --background: rgba(255, 255, 255, 0.8);
  --border-radius: 12px;
  --border-color: transparent;
  --border-width: 0;
  margin-bottom: 1rem;
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
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(122, 92, 30, 0.2);
  height: 56px;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 16px;
}

.save-button ion-icon {
  font-size: 20px;
  margin-right: 8px;
}

@media (max-width: 480px) {
  .edit-form-card {
    padding: 24px;
  }

  .form-title {
    font-size: 1.5rem;
  }
}
</style>
