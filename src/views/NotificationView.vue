<template>
    <ion-page class="notification-page">
        <ion-header class="ion-no-border">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/" class="back-button"></ion-back-button>
                </ion-buttons>
                <ion-title class="notification-title">Notifications</ion-title>
                <ion-buttons slot="end" v-if="orderNotification.notifications.length > 0">
                    <ion-button @click="markAllAsRead" class="mark-read-btn">
                        Mark all as read
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="notification-container">
                <div v-if="orderNotification.loading" class="loading-state">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>Loading notifications...</p>
                </div>
                
                <div v-else-if="orderNotification.error" class="error-state">
                    <div class="error-content">
                        <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
                        <h2>Error Loading Notifications</h2>
                        <p>{{ orderNotification.error }}</p>
                        <ion-button @click="retryLoading" class="retry-btn" fill="solid">
                            Try Again
                            <ion-icon :icon="refreshOutline" slot="end"></ion-icon>
                        </ion-button>
                    </div>
                </div>

                <div v-else-if="orderNotification.notifications.length === 0" class="empty-state">
                    <div class="empty-state-content">
                        <div class="empty-state-icon">
                            <ion-icon :icon="notificationsOutline"></ion-icon>
                        </div>
                        <h2 class="empty-state-title">No Notifications</h2>
                        <p class="empty-state-subtitle">You're all caught up! Check back later for updates.</p>
                    </div>
                </div>

                <div v-else class="notifications-list">
                    <div class="notifications-header">
                        <h2 class="notifications-title">Recent Notifications</h2>
                        <p class="notifications-subtitle">Stay updated with your order status</p>
                    </div>

                    <div class="notifications-grid">
                        <div v-for="notification in orderNotification.notifications" 
                             :key="notification.orderId"
                             :class="['notification-card', { 'unread': !notification.read }]"
                             @click="handleNotificationClick(notification)">
                            <div class="notification-content">
                                <div class="notification-message">
                                    <h3>{{ notification.message }}</h3>
                                    <p class="notification-time">{{ formatDate(notification.timestamp) }}</p>
                                </div>
                                <ion-badge :class="['status-badge', notification.status.toLowerCase()]">
                                    {{ notification.status }}
                                </ion-badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, 
         IonBadge, IonButton, IonSpinner, IonIcon } from '@ionic/vue';
import { useOrderNotificationStore } from '@/stores/orderNotification';
import { useAuthStore } from '@/stores/authStore';
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { notificationsOutline, alertCircleOutline, refreshOutline } from 'ionicons/icons';

const orderNotification = useOrderNotificationStore();
const auth = useAuthStore();
const router = useRouter();
let cleanup;

onMounted(() => {
    if (auth.user) {
        cleanup = orderNotification.listenToOrderNotifications(auth.user);
    }
});

onUnmounted(() => {
    if (cleanup) {
        cleanup();
    }
});

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString([], { weekday: 'short' });
    }
    // Otherwise
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'accepted':
            return 'success';
        case 'declined':
            return 'danger';
        case 'pending':
            return 'warning';
        default:
            return 'medium';
    }
}

async function handleNotificationClick(notification) {
    if (auth.user) {
        await orderNotification.markAsRead(auth.user.uid, notification.orderId);
        router.push(`/orders/${notification.orderId}`);
    }
}

async function markAllAsRead() {
    if (auth.user) {
        await orderNotification.markAllAsRead(auth.user.uid);
    }
}

async function retryLoading() {
    if (auth.user) {
        cleanup = orderNotification.listenToOrderNotifications(auth.user);
    }
}
</script>

<style scoped>
.notification-page {
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

.notification-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #FFFFFF;
    letter-spacing: 0.5px;
}

.mark-read-btn {
    --color: #FFFFFF;
    font-weight: 500;
}

.notification-container {
    padding: 16px;
    padding-top: 80px;
    max-width: 800px;
    margin: 0 auto;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 80px);
    gap: 16px;
}

.loading-state p {
    color: #666;
    font-size: 1.1rem;
}

.error-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 80px);
}

.error-content {
    text-align: center;
    background: rgba(255, 255, 255, 0.95);
    padding: 32px;
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
}

.error-icon {
    font-size: 48px;
    color: #dc3545;
    margin-bottom: 16px;
}

.error-state h2 {
    color: #333;
    font-size: 1.5rem;
    margin: 0 0 8px 0;
}

.error-state p {
    color: #666;
    font-size: 1.1rem;
    margin: 0 0 24px 0;
}

.retry-btn {
    --background: #7A5C1E;
    --background-hover: #8B6B2F;
    --background-activated: #8B6B2F;
    --border-radius: 12px;
    --box-shadow: 0 4px 12px rgba(122, 92, 30, 0.2);
    height: 48px;
    font-weight: 600;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 80px);
}

.empty-state-content {
    text-align: center;
    background: rgba(255, 255, 255, 0.95);
    padding: 32px;
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
}

.empty-state-icon {
    background: rgba(255, 255, 255, 0.9);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-state-icon ion-icon {
    font-size: 40px;
    color: #7A5C1E;
}

.empty-state-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #7A5C1E;
    margin: 0 0 8px 0;
}

.empty-state-subtitle {
    color: #666;
    margin: 0;
    font-size: 1.1rem;
}

.notifications-header {
    text-align: center;
    margin-bottom: 32px;
}

.notifications-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #7A5C1E;
    margin: 0 0 8px 0;
}

.notifications-subtitle {
    color: #666;
    margin: 0;
}

.notifications-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.notification-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
}

.notification-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.notification-card.unread {
    border-left: 4px solid #7A5C1E;
}

.notification-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
}

.notification-message {
    flex: 1;
}

.notification-message h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #7A5C1E;
    margin: 0 0 8px 0;
}

.notification-time {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
}

.status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: capitalize;
}

.status-badge.accepted {
    background: #D4EDDA;
    color: #155724;
}

.status-badge.declined {
    background: #F8D7DA;
    color: #721C24;
}

.status-badge.pending {
    background: #FFF3CD;
    color: #856404;
}

@media (max-width: 768px) {
    .notifications-title {
        font-size: 1.5rem;
    }

    .notification-card {
        padding: 16px;
    }
}

@media (max-width: 480px) {
    .empty-state-content,
    .error-content {
        padding: 24px;
    }

    .notification-content {
        flex-direction: column;
        gap: 12px;
    }

    .status-badge {
        align-self: flex-start;
    }
}
</style>