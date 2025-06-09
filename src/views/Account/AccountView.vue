<template>
    <ion-page class="account-page">
        <ion-header class="ion-no-border">
            <ion-toolbar class="toolbar-custom">
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
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <div class="account-container">
                <!-- Profile Section -->
                <div class="profile-section">
                    <div class="profile-card">
                        <div class="profile-card-content">
                            <div class="avatar-wrapper">
                                <div class="account-avatar">{{ userInitials }}</div>
                                <div class="avatar-ring"></div>
                            </div>
                            <div class="account-info">
                                <h1 class="account-name">{{ user?.name || 'Anonymous User' }}</h1>
                                <div class="account-detail">
                                    <ion-icon :icon="mailOutline" class="account-detail-icon"></ion-icon>
                                    <span>{{ user?.email || 'No email provided' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions Section -->
                <div class="actions-section">
                    <h2 class="section-title">Account Settings</h2>
                    <div class="account-actions">
                        <ion-card class="account-action-card" @click="router.push({ name: 'accountEdit' })" button="true">
                            <div class="action-card-inner">
                                <div class="action-icon-container">
                                    <ion-icon :icon="personOutline" class="action-icon-svg"></ion-icon>
                                </div>
                                <div class="action-text-container">
                                    <h3 class="action-title">Edit Profile</h3>
                                    <p class="action-description">Update your personal information</p>
                                </div>
                                <ion-icon :icon="chevronForward" class="action-arrow-indicator"></ion-icon>
                            </div>
                        </ion-card>
                    </div>
                </div>

                <!-- Logout Section -->
                <div class="logout-section absolute bottom-0 left-0 right-0">
                    <button class="account-logout-button" @click="handleLogout">
                        <div class="action-card-inner">
                            <div class="action-icon-container logout-icon">
                                <ion-icon :icon="logOutOutline" class="action-icon-svg"></ion-icon>
                            </div>
                            <div class="action-text-container text-left">
                                <h3 class="action-title">Log Out</h3>
                                <p class="action-description">Sign out of your account</p>
                            </div>
                            <ion-icon :icon="chevronForward" class="action-arrow-indicator"></ion-icon>
                        </div>
                    </button>
                </div>
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
    --background: #F8F9FA;
}

/* Toolbar Custom Styles */
.toolbar-custom {
    --background: transparent !important;
    --border-color: transparent !important;
    --color: #374151 !important;
    margin: 0 !important;
    padding: 0 !important;
    z-index: 0 !important;
}

.toolbar-custom ion-toolbar {
    --background: transparent !important;
    --border-color: transparent !important;
    --color: #374151 !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* Ensure toolbar takes full width and has no default ionic padding */
ion-header ion-toolbar {
    --padding-start: 0px !important;
    --padding-end: 0px !important;
    --min-height: auto !important;
}

/* Override any default ionic header styles */
ion-header.ion-no-border {
    box-shadow: none !important;
    border: none !important;
}

/* Additional responsive styles for very small screens */
@media (max-width: 350px) {
    .toolbar-custom h1 {
        font-size: 1rem !important;
    }

    .toolbar-custom p {
        font-size: 0.7rem !important;
    }
}

/* Container Styles */
.account-container {
    padding: 1.5rem;
    max-width: 680px;
    margin: 0 auto;
}

/* Profile Section */
.profile-section {
    margin-bottom: 2rem;
}

.profile-card {
    background: #FFFFFF;
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 2rem;
    transition: transform 0.3s ease;
}

.profile-card:hover {
    transform: translateY(-2px);
}

.profile-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.avatar-wrapper {
    position: relative;
    margin-bottom: 1.5rem;
}

.account-avatar {
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, #7A5C1E 0%, #C8AD7E 100%);
    color: #FFFFFF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 600;
    position: relative;
    z-index: 1;
}

.avatar-ring {
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 2px solid rgba(122, 92, 30, 0.2);
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 0.5;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.3;
    }
    100% {
        transform: scale(1);
        opacity: 0.5;
    }
}

.account-name {
    font-size: 1.75rem;
    font-weight: 700;
    color: #2D3748;
    margin: 0 0 0.75rem;
}

.account-detail {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #4A5568;
    font-size: 1rem;
    background: #F7FAFC;
    padding: 0.5rem 1rem;
    border-radius: 12px;
}

.account-detail-icon {
    color: #7A5C1E;
    font-size: 1.25rem;
}

/* Actions Section */
.actions-section {
    margin-bottom: 2rem;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2D3748;
    margin: 0 0 1rem 0.5rem;
}

.account-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.account-action-card {
    --background: #FFFFFF;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    margin: 0;
    transition: all 0.3s ease;
}

.account-action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-card-inner {
    display: flex;
    align-items: center;
    padding: 1.25rem;
    gap: 1rem;
}

.action-icon-container {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #7A5C1E 0%, #C8AD7E 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.action-icon-svg {
    font-size: 1.5rem;
    color: #FFFFFF;
}

.action-text-container {
    flex-grow: 1;
}

.action-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2D3748;
    margin: 0;
}

.action-description {
    font-size: 0.875rem;
    color: #718096;
    margin: 0.25rem 0 0;
}

.action-arrow-indicator {
    color: #A0AEC0;
    font-size: 1.25rem;
    transition: transform 0.2s ease;
}

.account-action-card:hover .action-arrow-indicator {
    transform: translateX(4px);
    color: #7A5C1E;
}

/* Logout Section */
.logout-section {
    margin-top: 2rem;
}

.account-logout-button {
    width: 100%;
    background: #FFFFFF;
    border: none;
    border-radius: 16px;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.account-logout-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.logout-icon {
    background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%);
}

.account-logout-button .action-title {
    color: #DC2626;
}

.account-logout-button .action-description {
    color: #EF4444;
}

.account-logout-button .action-arrow-indicator {
    color: #DC2626;
}

/* Responsive Adjustments */
@media (max-width: 480px) {
    .header-container {
        padding: 1.25rem 1rem;
    }

    .header-title {
        font-size: 1.5rem;
    }

    .header-subtitle {
        font-size: 0.875rem;
    }

    .account-container {
        padding: 1rem;
    }

    .profile-card {
        padding: 1.5rem;
    }

    .account-avatar {
        width: 100px;
        height: 100px;
        font-size: 2rem;
    }

    .account-name {
        font-size: 1.5rem;
    }

    .action-card-inner {
        padding: 1rem;
    }

    .action-icon-container {
        width: 40px;
        height: 40px;
    }

    .action-title {
        font-size: 1rem;
    }

    .action-description {
        font-size: 0.8125rem;
    }
}
</style>