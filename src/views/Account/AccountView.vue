<template>
    <ion-page class="page-background">
        <ion-header>
            <ion-toolbar>
                <ion-title class="ion-text-center">Account</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" :fullscreen="true">
            <div class="account-avatar-container">
                <div class="account-avatar">{{ userInitials }}</div>
            </div>
            <div class="account-info">
                <div class="account-name">{{ user?.name || 'Anonymous User' }}</div>
                <div class="account-detail">
                    <ion-icon :icon="mailOutline" class="account-icon"></ion-icon>
                    <span>{{ user?.email || 'No email provided' }}</span>
                </div>

            </div>
            <div class="account-actions">
                <ion-button expand="block" fill="solid" class="account-action-btn" color="light" @click="router.push({ name: 'accountEdit' })">View
                    Profile</ion-button>
                <ion-button expand="block" fill="solid" class="account-action-btn" color="light" @click="router.push({ name: 'accountMessage' })">Message</ion-button>
                <ion-button expand="block" fill="solid" class="account-action-btn" color="light">About us</ion-button>
                <ion-button expand="block" fill="solid" class="account-action-btn" color="light"
                    @click="handleLogout">Log out</ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonButton, IonIcon, IonTitle, alertController } from '@ionic/vue';
import { mailOutline, callOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const authStore = useAuthStore();
const router = useRouter();

const user = computed(() => authStore.user);

const userInitials = computed(() => {
  if (!user.value?.name) return '?';
  return user.value.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const handleLogout = async () => {
  const alert = await alertController.create({
    header: 'Confirm Logout',
    message: 'Are you sure you want to log out?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary'
      },
      {
        text: 'Logout',
        handler: async () => {
          await authStore.logout();
          router.replace('/');
        }
      }
    ]
  });

  await alert.present();
};
</script>

<style scoped>
.account-background {
  background: linear-gradient(to bottom, #C8AD7E, #FFF7D0);
  min-height: 100vh;
}

ion-toolbar {
  --background: transparent;
  box-shadow: none;
}

.account-avatar-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.account-avatar {
  width: 90px;
  height: 90px;
  background: #6b7a2c;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 600;
  margin-bottom: 16px;
}

.account-info {
  text-align: left;
  margin: 0 auto 24px auto;
  max-width: 320px;
}

.account-name {
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 8px;
  line-height: 1.1;
}

.account-detail {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #333;
  margin-bottom: 4px;
}

.account-icon {
  font-size: 22px;
  margin-right: 8px;
}

.account-actions {
  margin: 32px auto 0 auto;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-action-btn {
  --background: #d9d2c0;
  --color: #444;
  font-size: 1.15rem;
  font-weight: 400;
  border-radius: 0;
  box-shadow: none;
  border-bottom: 1px solid #fff3;
}

.account-action-btn:last-child {
  border-bottom: none;
}
.page-background {
    background: linear-gradient(to bottom, #C8AD7E, #FFF7D0);
}

ion-toolbar {
    --background: linear-gradient(to right, #C8AD7E, #FFFFFF);
}
ion-content {
    --background: transparent;
}
</style>