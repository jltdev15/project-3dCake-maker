<template>
    <ion-page class="page-background">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/account"></ion-back-button>
        </ion-buttons>
        <ion-title class="ion-text-center pr-16">Edit Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
    <div class="edit-profile-container">
      <ion-item class="custom-input">
        <ion-icon :icon="personOutline" slot="start" class="input-icon"></ion-icon>
        <ion-label position="stacked">Name</ion-label>
        <ion-input v-model="userName" :value="authStore.user?.name"></ion-input>
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
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { IonPage, IonContent, IonText, IonBackButton, IonButtons, IonItem, IonLabel, IonInput, IonIcon, IonButton, IonHeader, IonToolbar, IonTitle } from '@ionic/vue';
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
.page-background {
  background: linear-gradient(to bottom, #C8AD7E, #FFF7D0);
}
ion-toolbar {
  --background: linear-gradient(to right, #C8AD7E, #FFFFFF);
}

ion-content {
  --background: transparent;
}

.edit-profile-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 90%;
}

.custom-input {
  --background: rgba(255, 255, 255, 0.9);
  --border-radius: 8px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 600px;
  --padding-start: 16px;
  --inner-padding-end: 16px;
}

.input-icon {
  font-size: 24px;
  color: #C8AD7E;
  margin-right: 8px;
  margin-top: 8px;
  align-self: flex-start;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-label {
  margin-left: 8px;
}

ion-input {
  margin-left: 8px;
}

.save-button {
  --background: #C8AD7E;
  --background-hover: #b89d6e;
  --background-activated: #b89d6e;
  --color: white;
  margin-top: 24px;
  max-width: 600px;
  width: 100%;
  height: 48px;
  font-weight: 500;
}

.save-button ion-icon {
  margin-right: 8px;
}
</style>
