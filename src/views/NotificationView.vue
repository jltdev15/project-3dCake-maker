<template>
    <ion-page class="page-background">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/" text=""></ion-back-button>
                </ion-buttons>
                <ion-title class="ion-text-center pr-12">Notifications</ion-title>
                <ion-buttons slot="end" v-if="orderNotification.notifications.length > 0">
                    <ion-button @click="markAllAsRead">
                        Mark all as read
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <div v-if="orderNotification.loading" class="loading-container">
                <ion-spinner name="crescent"></ion-spinner>
            </div>
            
            <div v-else-if="orderNotification.error" class="error-container">
                <ion-text color="danger">
                    <p>{{ orderNotification.error }}</p>
                </ion-text>
            </div>

            <div v-else-if="orderNotification.notifications.length === 0" class="notification-container">
                <h1>Notifications</h1>
                <ion-text color="medium" class="no-notifications">
                    <p>No notifications at the moment</p>
                </ion-text>
            </div>

            <div v-else class="notifications-list">
                <ion-list>
                    <ion-item v-for="notification in orderNotification.notifications" 
                             :key="notification.orderId"
                             :class="{ 'unread': !notification.read }"
                             @click="handleNotificationClick(notification)">
                        <ion-label>
                            <h2>{{ notification.message }}</h2>
                            <p>{{ formatDate(notification.timestamp) }}</p>
                        </ion-label>
                        <ion-badge slot="end" :color="getStatusColor(notification.status)">
                            {{ notification.status }}
                        </ion-badge>
                    </ion-item>
                </ion-list>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonText, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, 
         IonList, IonItem, IonLabel, IonBadge, IonButton, IonSpinner } from '@ionic/vue';
import { useOrderNotificationStore } from '@/stores/orderNotification';
import { useAuthStore } from '@/stores/authStore';
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

// Register components
defineOptions({
  components: {
    IonPage,
    IonContent,
    IonText,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonSpinner
  }
});

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
    return new Date(timestamp).toLocaleString();
}

function getStatusColor(status) {
    switch (status) {
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
        // Mark as read
        await orderNotification.markAsRead(auth.user.uid, notification.orderId);
        // Navigate to order details
        router.push(`/orders/${notification.orderId}`);
    }
}

async function markAllAsRead() {
    if (auth.user) {
        await orderNotification.markAllAsRead(auth.user.uid);
    }
}
</script>

<style scoped>
.page-background {
    background: linear-gradient(to bottom, #C8AD7E, #FFF7D0);
}

ion-toolbar {
    --background: linear-gradient(to right, #C8AD7E, #FFFFFF);
}

.notification-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
}

.notification-container h1 {
    margin-bottom: 1rem;
}

.notification-container .no-notifications {
    font-size: 1.1rem;
}

ion-content {
    --background: transparent;
}

.loading-container,
.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.notifications-list {
    padding: 10px;
}

ion-item {
    --background: rgba(255, 255, 255, 0.9);
    margin-bottom: 8px;
    border-radius: 8px;
    --padding-start: 16px;
    --padding-end: 16px;
    --padding-top: 12px;
    --padding-bottom: 12px;
}

ion-item.unread {
    --background: rgba(255, 255, 255, 0.95);
    border-left: 4px solid var(--ion-color-primary);
}

ion-item h2 {
    font-weight: 500;
    margin-bottom: 4px;
}

ion-item p {
    color: var(--ion-color-medium);
    font-size: 0.9em;
}

ion-badge {
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 12px;
}
</style>