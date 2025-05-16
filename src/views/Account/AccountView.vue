<template>
    <ion-page class="account-page">
        <ion-header class="ion-no-border">
            <ion-toolbar>
                <ion-title class="account-title">Account</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <div class="account-container">
                <div class="profile-section">
                    <div class="avatar-wrapper">
                        <div class="account-avatar">{{ userInitials }}</div>
                    </div>
                    <div class="account-info">
                        <h1 class="account-name">{{ user?.name || 'Anonymous User' }}</h1>
                        <div class="account-detail">
                            <ion-icon :icon="mailOutline" class="account-icon"></ion-icon>
                            <span>{{ user?.email || 'No email provided' }}</span>
                        </div>
                    </div>
                </div>

                <div class="account-actions">
                    <ion-button expand="block" class="account-action-btn" @click="router.push({ name: 'accountEdit' })">
                        <ion-icon :icon="personOutline" slot="start"></ion-icon>
                        View Profile
                    </ion-button>
                    <ion-button expand="block" class="account-action-btn" @click="router.push({ name: 'accountMessage' })">
                        <ion-icon :icon="chatbubbleOutline" slot="start"></ion-icon>
                        Message
                    </ion-button>
                    <ion-button expand="block" class="account-action-btn">
                        <ion-icon :icon="informationCircleOutline" slot="start"></ion-icon>
                        About Us
                    </ion-button>
                    <ion-button expand="block" class="account-action-btn logout-btn" @click="handleLogout">
                        <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
                        Log Out
                    </ion-button>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonIcon, IonTitle, alertController } from '@ionic/vue';
import { mailOutline, personOutline, chatbubbleOutline, informationCircleOutline, logOutOutline } from 'ionicons/icons';
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
.account-page {
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

.account-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
}

.account-container {
  padding: 16px;
  padding-top: 80px;
  max-width: 600px;
  margin: 0 auto;
}

.profile-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 32px;
  text-align: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-wrapper {
  margin-bottom: 20px;
}

.account-avatar {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #7A5C1E 0%, #C8AD7E 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 600;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(122, 92, 30, 0.2);
}

.account-info {
  text-align: center;
}

.account-name {
  font-size: 1.75rem;
  font-weight: 600;
  color: #7A5C1E;
  margin: 0 0 12px 0;
}

.account-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
  font-size: 1rem;
}

.account-icon {
  font-size: 20px;
  color: #7A5C1E;
}

.account-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-action-btn {
  --background: rgba(255, 255, 255, 0.95);
  --background-hover: rgba(255, 255, 255, 0.98);
  --background-activated: rgba(255, 255, 255, 0.98);
  --color: #7A5C1E;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 56px;
  font-weight: 500;
  font-size: 1.1rem;
}

.account-action-btn ion-icon {
  font-size: 20px;
  margin-right: 8px;
}

.logout-btn {
  --background: #dc3545;
  --background-hover: #c82333;
  --background-activated: #c82333;
  --color: white;
  margin-top: 8px;
}

@media (max-width: 480px) {
  .profile-section {
    padding: 24px;
  }

  .account-avatar {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }

  .account-name {
    font-size: 1.5rem;
  }
}
</style>