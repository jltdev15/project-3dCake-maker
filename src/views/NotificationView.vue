<template>
    <ion-page class="notification-page">
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
                            <button @click="$router.go(-1)"
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
                                        Notifications
                                    </h1>
                                    <p v-if="orderNotification.notifications.length > 0" class="text-xs sm:text-sm opacity-70 font-medium tracking-wide mt-0.5 text-gray-700">
                                        {{ orderNotification.notifications.filter(n => !n.read).length }} unread
                                    </p>
                                     <p v-else class="text-xs sm:text-sm opacity-70 font-medium tracking-wide mt-0.5 text-gray-700">
                                        No new updates
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Right Side - Action Buttons -->
                        <div class="flex items-center space-x-2">
                            <button v-if="orderNotification.notifications.length > 0 && orderNotification.notifications.filter(n => !n.read).length > 0" @click="markAllAsRead"
                                class="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 active:scale-95 transition-all duration-200 touch-manipulation overflow-hidden">
                                <div class="absolute inset-0 bg-gradient-to-r from-[#F0E68D]/30 to-[#DCC867]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                <ion-icon :icon="checkmarkDoneCircleOutline"
                                    class="relative text-lg sm:text-xl text-gray-800 drop-shadow-sm group-hover:scale-110 transition-transform duration-200"
                                    title="Mark all as read"></ion-icon>
                            </button>
                             <div v-else class="w-10 h-10 sm:w-12 sm:h-12"></div> <!-- Placeholder to maintain layout -->
                        </div>
                    </div>
                </div>
            </div>
        </ion-header>

        <ion-content>
            <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
                <ion-refresher-content
                    pulling-icon="chevron-down-circle-outline"
                    pulling-text="Pull to refresh"
                    refreshing-spinner="crescent"
                    refreshing-text="Refreshing...">
                </ion-refresher-content>
            </ion-refresher>
            <div class="notification-container">
                <div v-if="orderNotification.loading" class="loading-state">
                    <div class="notifications-grid">
                        <!-- Skeleton cards -->
                        <div v-for="n in 3" :key="n" class="notification-card w-72 bg-white rounded-xl shadow-md p-4 flex items-start gap-4 animate-pulse">
                            <div class="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                            <div class="notification-content flex-1 flex justify-between items-start gap-2">
                                <div class="notification-message w-full">
                                    <div class="h-5 bg-gray-200 rounded w-4/5 mb-2"></div>
                                    <div class="h-4 bg-gray-200 rounded w-11/12 mb-2"></div>
                                    <div class="h-3.5 bg-gray-200 rounded w-2/5"></div>
                                </div>
                                <div class="w-20 h-6 bg-gray-200 rounded flex-shrink-0"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div v-else-if="orderNotification.error" class="error-state">
                    <div class="empty-state-content">
                         <div class="empty-state-icon bg-red-100 text-red-500">
                            <ion-icon :icon="alertCircleOutline"></ion-icon>
                        </div>
                        <h2 class="empty-state-title text-red-700">Error Loading</h2>
                        <p class="empty-state-subtitle text-gray-600">{{ orderNotification.error }}</p>
                        <button @click="retryLoading"
                          class="mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white font-semibold text-base uppercase tracking-wide rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation max-w-[200px] w-full">
                            Try Again
                            <ion-icon :icon="refreshOutline" class="text-xl"></ion-icon>
                        </button>
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
                    <div class="section-header mb-6">
                        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">Recent Updates</h2>
                        <!-- <p class="text-sm text-gray-600">Stay updated with your order status</p> -->
                    </div>

                    <div class="notifications-grid">
                        <div v-for="notification in sortedNotifications" 
                             :key="notification.key || notification.orderId"
                             :class="['notification-card', { 'unread': !notification.read }]"
                             @click="handleNotificationClick(notification)">
                            
                            <div class="notification-icon-container" :class="getStatusClass(notification.status)">
                                <ion-icon :icon="getNotificationIcon(notification.status)" class="notification-status-icon"></ion-icon>
                            </div>

                            <div class="flex justify-between items-start">
                                <div class="notification-message">
                                    <h3 class="font-semibold text-gray-800">{{ notification.title || 'Order Update' }}</h3>
                                    <p class="text-xs text-gray-600">{{ notification.message }}</p>
                                    <p class="notification-time text-xs text-gray-500 mt-1">{{ formatDate(notification.timestamp) }}</p>
                                </div>
                                <ion-badge class="px-2 py-2" :class="['status-badge', notification.status.toLowerCase()]">
                                    {{ notification.status }}
                                </ion-badge>
                            </div>
                            <div v-if="!notification.read" class="unread-indicator"></div>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, 
         IonBadge, IonButton, IonSpinner, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { useOrderNotificationStore } from '@/stores/orderNotification';
import { useAuthStore } from '@/stores/authStore';
import { onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { notificationsOutline, alertCircleOutline, refreshOutline, chevronBackOutline, checkmarkDoneCircleOutline, checkmarkCircleOutline, closeCircleOutline, timeOutline as pendingIcon } from 'ionicons/icons';

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

const sortedNotifications = computed(() => {
  return [...orderNotification.notifications].sort((a, b) => {
    // Unread notifications first
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    // Then by timestamp, newest first
    return b.timestamp - a.timestamp;
  });
});

function formatDate(timestamp) {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'accepted':
        case 'confirmed':
        case 'completed':
        case 'priced':
            return 'bg-green-100 text-green-600';
        case 'declined':
        case 'cancelled':
            return 'bg-red-100 text-red-600';
        case 'pending':
        case 'processing':
        case 'shipped':
            return 'bg-yellow-100 text-yellow-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}

function getNotificationIcon(status) {
    switch (status?.toLowerCase()) {
        case 'accepted':
        case 'confirmed':
        case 'completed':
        case 'priced':
            return checkmarkCircleOutline;
        case 'declined':
        case 'cancelled':
            return closeCircleOutline;
        case 'pending':
        case 'processing':
        case 'shipped':
            return pendingIcon;
        default:
            return notificationsOutline;
    }
}

async function handleNotificationClick(notification) {
    if (auth.user && notification.orderId) { // Ensure orderId exists
        await orderNotification.markAsRead(auth.user.uid, notification.orderId, notification.key);
        router.push(`/orders/${notification.orderId}`);
    } else if (auth.user && notification.key && !notification.read) { // For generic notifications, mark as read
         await orderNotification.markAsRead(auth.user.uid, notification.orderId, notification.key); // orderId might be undefined here, handle in store
    }
}

async function markAllAsRead() {
    if (auth.user) {
        await orderNotification.markAllAsRead(auth.user.uid);
    }
}

async function retryLoading() {
    orderNotification.error = null; // Reset error state
    orderNotification.loading = true;
    if (auth.user) {
        if (cleanup) cleanup(); // Clean up previous listener if any
        cleanup = orderNotification.listenToOrderNotifications(auth.user);
    }
}

async function handleRefresh(event) {
    try {
        if (auth.user) {
            if (cleanup) cleanup(); // Clean up previous listener
            cleanup = orderNotification.listenToOrderNotifications(auth.user);
        }
    } catch (error) {
        console.error('Error refreshing notifications:', error);
    } finally {
        // Complete the refresh animation
        event.target.complete();
    }
}
</script>

<style scoped>
.notification-page {
    --background: var(--ion-color-light); /* Matching OrdersView */
}

/* Header styling is handled by Tailwind utility classes in the template */

.notification-container {
    padding: 16px;
    /* padding-top: is implicitly handled by ion-content with fixed header */
    max-width: 768px; /* Consistent max-width */
    margin: 0 auto;
}

.loading-state, .error-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 150px); /* Adjust based on actual header height */
    text-align: center;
}

/* Empty state content styling using Tailwind from OrdersView */
.empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 32px 16px;
}

.empty-state-icon {
  font-size: 48px; /* Adjusted size */
  color: #58091F; /* Primary color from OrdersView empty state */
  margin-bottom: 24px;
  background: rgba(240, 230, 141, 0.2); /* Background from OrdersView */
  padding: 20px; /* Adjusted padding */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #58091F; /* Primary color */
}

.empty-state-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0 0 24px;
  max-width: 300px;
}
/* End Empty State */


.section-header {
  margin-bottom: 16px; /* Similar to OrdersView */
}

.section-header h2 {
  font-size: 1.5rem; /* Similar to OrdersView */
  font-weight: 700;
  margin: 0 0 8px; /* Adjusted margin */
  color: var(--ion-color-dark); /* Using CSS var from OrdersView */
}


.notifications-grid {
    display: flex;
    flex-direction: column;
    gap: 12px; /* Consistent gap */
}

.notification-card {
    background: #ffffff;
    border-radius: 8px; /* Consistent rounding */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Consistent shadow */
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
    display: flex;
    align-items:center; /* Align items to the top */
    padding:12px;
    position: relative; /* For unread indicator */
    overflow: hidden; /* For unread indicator */
    
}

.notification-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.notification-card.unread {
    /* border-left: 4px solid #58091F; Using an indicator dot instead */
    background: #FFFBEB; /* Slightly different background for unread */
}

.unread-indicator {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 10px;
    height: 10px;
    background-color: #58091F; /* Accent color for unread dot */
    border-radius: 50%;
}

.notification-icon-container {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
}

.notification-status-icon {
    font-size: 20px;
}

.notification-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Align badge to top */
    gap: 8px; /* Space between message and badge */
}

.notification-message h3 {
    font-size: 1rem; /* Adjusted size */
    font-weight: 600; /* Consistent weight */
    margin: 0 0 4px 0; /* Adjusted margin */
}

/* Status badge styling similar to OrdersView */
.status-badge {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 4px; /* Adjusted for smaller badge */
  --padding-bottom: 4px; /* Adjusted for smaller badge */
  height: auto;
  border-radius: 6px;
  text-transform: capitalize;
  font-weight: 500;
  font-size: 0.75rem;
}

.status-badge.accepted, .status-badge.confirmed, .status-badge.completed, .status-badge.priced {
  --background: rgba(45, 211, 111, 0.2); /* green from OrdersView */
  --color: #157539;
}

.status-badge.declined, .status-badge.cancelled {
  --background: rgba(235, 68, 90, 0.2); /* red from OrdersView */
  --color: #a01a30;
}

.status-badge.pending, .status-badge.processing, .status-badge.shipped {
  --background: rgba(255, 196, 9, 0.2); /* yellow from OrdersView */
  --color: #b37e00;
}

.status-badge.default {
  --background: rgba(0,0,0,0.1);
  --color: #555;
}


@media (max-width: 480px) {
    .notification-content {
        /* flex-direction: column; Elements are already managed for small screens */
        align-items: flex-start; /* Ensure items start at the top */
    }

    .status-badge {
        /* align-self: flex-start;  Ensured by flex container */
        margin-top: 4px; /* Add some space if it wraps */
    }
     .unread-indicator {
        top: 8px;
        right: 8px;
        width: 8px;
        height: 8px;
    }
}

/* Remove all skeleton styles and keep only the loading-state update */
.loading-state {
    padding: 16px;
    min-height: auto;
}
</style>