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
                    <div class="action-card" @click="router.push({ name: 'accountEdit' })">
                        <div class="action-icon">
                            <ion-icon :icon="personOutline"></ion-icon>
                        </div>
                        <div class="action-content">
                            <h3>View Profile</h3>
                            <p>Manage your personal information</p>
                        </div>
                        <ion-icon :icon="chevronForward" class="action-arrow"></ion-icon>
                    </div>

                    <div class="action-card">
                        <div class="action-icon">
                            <ion-icon :icon="informationCircleOutline"></ion-icon>
                        </div>
                        <div class="action-content">
                            <h3>About Us</h3>
                            <p>Learn more about our service</p>
                        </div>
                        <ion-icon :icon="chevronForward" class="action-arrow"></ion-icon>
                    </div>

                    <div class="action-card logout" @click="handleLogout">
                        <div class="action-icon">
                            <ion-icon :icon="logOutOutline"></ion-icon>
                        </div>
                        <div class="action-content">
                            <h3>Log Out</h3>
                            <p>Sign out of your account</p>
                        </div>
                        <ion-icon :icon="chevronForward" class="action-arrow"></ion-icon>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonIcon, IonTitle, alertController } from '@ionic/vue';
import { mailOutline, personOutline, chatbubbleOutline, informationCircleOutline, logOutOutline, chevronForward } from 'ionicons/icons';
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
    gap: 16px;
    padding: 8px;
}

.action-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
}

.action-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(122, 92, 30, 0.1) 0%, rgba(200, 173, 126, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.action-card:hover::before {
    opacity: 1;
}

.action-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #7A5C1E 0%, #C8AD7E 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.action-icon ion-icon {
    font-size: 24px;
    color: white;
}

.action-content {
    flex-grow: 1;
}

.action-content h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #7A5C1E;
}

.action-content p {
    margin: 4px 0 0;
    font-size: 0.9rem;
    color: #666;
}

.action-arrow {
    color: #7A5C1E;
    font-size: 20px;
    opacity: 0.5;
    transition: transform 0.3s ease;
}

.action-card:hover .action-arrow {
    transform: translateX(4px);
    opacity: 1;
}

.logout {
    border: 1px solid rgba(220, 53, 69, 0.2);
}

.logout .action-icon {
    background: linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%);
}

.logout .action-content h3 {
    color: #dc3545;
}

@media (max-width: 480px) {
    .action-card {
        padding: 16px;
    }

    .action-icon {
        width: 40px;
        height: 40px;
    }

    .action-content h3 {
        font-size: 1rem;
    }

    .action-content p {
        font-size: 0.8rem;
    }
}
</style>