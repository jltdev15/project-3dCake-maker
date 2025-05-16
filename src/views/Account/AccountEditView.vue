<template>
  <ion-page class="account-edit-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/account" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="edit-title">Edit Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="edit-container">
        <div class="edit-card">
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

            <ion-button expand="block" class="save-button" @click="handleSave">
              <ion-icon :icon="saveOutline" slot="start"></ion-icon>
              Save Changes
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonBackButton, IonButtons, IonItem, IonLabel, IonInput, IonIcon, IonButton, IonHeader, IonToolbar, IonTitle } from '@ionic/vue';
import { ref } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { personOutline, mailOutline, saveOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { database, ref as dbRef, update } from '../../config/firebase';

const router = useRouter();
const authStore = useAuthStore();
const userName = ref(authStore.user?.name || '');
const userEmail = ref(authStore.user?.email || '');

const handleSave = async () => {
  if (!authStore.user?.uid) return;
  
  try {
    const userRef = dbRef(database, `users/${authStore.user.uid}`);
    await update(userRef, {
      name: userName.value
    });
    
    // Update local store
    await authStore.setUser({
      ...authStore.user,
      name: userName.value
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

ion-header {
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
}

.edit-container {
  padding: 16px;
  padding-top: 80px;
  max-width: 600px;
  margin: 0 auto;
}

.edit-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

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
  --background: rgba(255, 255, 255, 0.9);
  --border-radius: 12px;
  --border-width: 0;
  --padding-start: 16px;
  --inner-padding-end: 16px;
  --highlight-color: #7A5C1E;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.input-icon {
  font-size: 24px;
  color: #7A5C1E;
  margin-right: 12px;
  margin-top: 8px;
}

ion-label {
  color: #7A5C1E;
  font-weight: 500;
  margin-bottom: 8px;
}

ion-input {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 8px;
  --padding-bottom: 8px;
  font-size: 1.1rem;
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
  .edit-card {
    padding: 24px;
  }

  .form-title {
    font-size: 1.5rem;
  }
}
</style>
