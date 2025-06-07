<template>
    <ion-page class="account-page">
        <ion-header class="ion-no-border">
            <!-- Modern Redesigned Toolbar -->
            <div class="relative bg-gradient-to-r from-[#F0E68D] via-[#E6D77A] to-[#DCC867] text-gray-800 shadow-xl">
                <!-- Background Pattern Overlay -->
                <div class="absolute inset-0 bg-black/5 opacity-20"></div>
                <div class="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-transparent"></div>

                <!-- Main Content -->
                <div class="relative px-4 py-3 sm:px-6 sm:py-4">
                    <div class="flex items-center justify-center">
                        <!-- Center - Title Section -->
                        <div class="flex-1 text-center mx-4">
                            <div class="flex items-center justify-center space-x-2 sm:space-x-3">
                                <!-- Title Text -->
                                <div class="text-center">
                                    <h1 class="text-lg sm:text-xl font-bold tracking-wide drop-shadow-sm text-gray-800">
                                        Account
                                    </h1>
                                    <p class="text-xs sm:text-sm opacity-70 font-medium tracking-wide mt-0.5 text-gray-700">
                                        Manage your profile and settings
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ion-header>
        <ion-content>
            <div class="account-container">
                <ion-card class="profile-card">
                    <div class="profile-card-content">
                        <div class="avatar-wrapper">
                            <div class="account-avatar">{{ userInitials }}</div>
                        </div>
                        <div class="account-info">
                            <h1 class="account-name">{{ user?.name || 'Anonymous User' }}</h1>
                            <div class="account-detail">
                                <ion-icon :icon="mailOutline" class="account-detail-icon"></ion-icon>
                                <span>{{ user?.email || 'No email provided' }}</span>
                            </div>
                        </div>
                    </div>
                </ion-card>

                <div class="account-actions">
                    <ion-card class="account-action-card" @click="router.push({ name: 'accountEdit' })" button="true">
                        <div class="action-card-inner">
                            <div class="action-icon-container">
                                <ion-icon :icon="personOutline" class="action-icon-svg"></ion-icon>
                            </div>
                            <div class="action-text-container">
                                <h3 class="action-title">View Profile</h3>
                                <p class="action-description">Manage your personal information</p>
                            </div>
                            <ion-icon :icon="chevronForward" class="action-arrow-indicator"></ion-icon>
                        </div>
                    </ion-card>

                    <!-- About Us card will be removed as per user selection if this was the intent, or kept if it was an accidental omission in selection -->
                    <!-- For now, assuming About Us card was intentionally deselected for removal or modification -->

                </div>

                <!-- Log Out button converted to standard HTML/Vue element -->
                <button class="account-logout-button account-logout-button-bottom" @click="handleLogout">
                    <div class="action-card-inner">
                        <div class="action-icon-container">
                            <ion-icon :icon="logOutOutline" class="action-icon-svg"></ion-icon>
                        </div>
                        <div class="action-text-container">
                            <h3 class="action-title">Log Out</h3>
                            <p class="action-description">Sign out of your account</p>
                        </div>
                        <ion-icon :icon="chevronForward" class="action-arrow-indicator"></ion-icon>
                    </div>
                </button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonIcon, IonTitle, alertController, IonCard } from '@ionic/vue';
import { mailOutline, personOutline, chatbubbleOutline, informationCircleOutline, chevronForward, chevronBackOutline, refreshOutline, logOutOutline } from 'ionicons/icons';
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

.account-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
} */

.account-container {
  padding: 16px;
  padding-top: 20px;
  max-width: 600px;
  margin: 0 auto;
}

/* New Profile Card Styles */
.profile-card {
  --background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  margin: 0 8px 24px 8px; /* Adjusted margin to fit within container padding */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
  padding: 28px; /* Inner padding for the card content */
}

.profile-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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
  box-shadow: 0 4px 12px rgba(122, 92, 30, 0.25);
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
  color: #555; /* Darkened for better contrast */
  font-size: 1rem;
}

.account-detail-icon { /* Renamed from .account-icon for specificity */
  font-size: 20px;
  color: #7A5C1E;
}

.account-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px;
    margin-bottom: 24px;
}

/* New Action Card Styles */
.account-action-card {
  --background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-left: 0;
  margin-right: 0;
  margin-top: 0;
  margin-bottom: 0;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.account-action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.action-card-inner {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  gap: 18px;
}

.action-icon-container {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #8A6C3A 0%, #D0B08E 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(122, 92, 30, 0.2);
}

.action-icon-svg {
  font-size: 26px;
  color: white;
}

.action-text-container {
  flex-grow: 1;
  text-align: left;
}

.action-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #6A4C1E;
}

.action-description {
  margin: 5px 0 0;
  font-size: 0.9rem;
  color: #555;
}

.action-arrow-indicator {
  color: #7A5C1E;
  font-size: 22px;
  opacity: 0.6;
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}

.account-action-card:hover .action-arrow-indicator {
  transform: translateX(4px);
  opacity: 1;
}

.logout-card .action-icon-container {
    /* Keep the red gradient for the icon container */
    background: linear-gradient(135deg, #c02c3a 0%, #e85260 100%);
    box-shadow: 0 2px 6px rgba(220, 53, 69, 0.2);
}

/* Override the specific logout-card text colors if they conflict */
.logout-card .action-title {
  color: white; /* Ensure title is white on red background */
}

.logout-card .action-arrow-indicator {
  color: white; /* Ensure arrow is white on red background */
}

/* Specific style for the logout button when at the bottom */
.account-logout-button-bottom {
  margin-top: 24px; /* Add space above the logout button */
  margin-left: 8px; /* Align with container padding if necessary */
  margin-right: 8px; /* Align with container padding if necessary */
  margin-bottom: 0; 
}

/* New styles for the standard HTML logout button */
.account-logout-button {
    /* Reset default button styles */
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;

    /* Apply card-like styles */
    /* Updated background to a red gradient */
    background: linear-gradient(135deg, #dc3545 0%, #e85260 100%); /* Red gradient */
    color: white; /* Set text color to white for contrast */
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    width: calc(100% - 16px);
    display: block;
    text-align: left;
}

.account-logout-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* Ensure text and icons within the button are visible on the red background */
.account-logout-button .action-text-container h3.action-title, /* Target the title */
.account-logout-button .action-text-container p.action-description { /* Target the description */
    color: white; /* Set color to white */
}

/* Remove or comment out styles for the span icons as we are using ion-icon again */
/*
.action-icon-svg,
.action-arrow-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
}

.action-arrow-indicator {
    width: 20px;
    height: 20px;
}

.account-logout-button .action-icon-container span.action-icon-svg svg,
.account-logout-button span.action-arrow-indicator svg {
    fill: currentColor;
    width: 100%;
    height: 100%;
    display: block;
}
*/

@media (max-width: 480px) {
    .action-card-inner {
        padding: 14px 16px;
        gap: 14px;
    }
    .action-icon-container {
        width: 44px;
        height: 44px;
        border-radius: 12px;
    }
    .action-icon-svg {
        font-size: 22px;
    }
    .action-title {
        font-size: 1.05rem;
    }
    .action-description {
        font-size: 0.85rem;
    }
    .action-arrow-indicator {
        font-size: 20px;
    }
}
</style>