<template>
    <ion-page>
        <ion-header class="ion-no-border">
            <ion-toolbar>
                <ion-title class="ion-text-center">
                    <ion-icon :icon="chatbubbleEllipsesOutline" class="title-icon"></ion-icon>
                    Messages
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-list lines="none" class="message-list">
                <!-- Skeleton loader -->
                <ion-item v-if="isLoading" v-for="n in 3" :key="n" class="message-item skeleton-item">
                    <ion-avatar slot="start" class="avatar skeleton-avatar"></ion-avatar>
                    <ion-label class="message-content">
                        <div class="message-header">
                            <div class="skeleton-text skeleton-name"></div>
                            <div class="skeleton-text skeleton-time"></div>
                        </div>
                        <div class="message-preview">
                            <div class="skeleton-text skeleton-message"></div>
                        </div>
                    </ion-label>
                </ion-item>

                <!-- Actual content -->
                <ion-item v-else v-for="admin in adminUsers" :key="admin.id" @click="openChat(admin)" class="message-item">
                    <ion-avatar slot="start" class="avatar">
                        <img src="/images/logo.webp" alt="admin avatar">
                        <div class="status-indicator" :class="admin.status"></div>
                    </ion-avatar>
                    <ion-label class="message-content">
                        <div class="message-header">
                            <h2>{{ admin.name }}</h2>
                            <span class="time">{{ formatLastSeen(admin.lastLogin) }}</span>
                        </div>
                        <div class="message-preview">
                            <p :class="{ 'unread-message': admin.unreadCount && admin.unreadCount > 0 }">
                                {{ admin.latestUnreadMessage || admin.lastMessage || '' }}
                            </p>
                            <ion-badge v-if="admin.unreadCount" color="primary" class="unread-badge">
                                {{ admin.unreadCount }}
                            </ion-badge>
                        </div>
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonBadge,
    IonButtons,
    IonButton,
    IonIcon
} from '@ionic/vue';
import { searchOutline, chatbubbleEllipsesOutline } from 'ionicons/icons';
import { database, ref as dbRef, onValue, off } from '../config/firebase';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    lastLogin: number;
    status: string;
    unreadCount?: number;
    lastMessage?: string;
    latestUnreadMessage?: string;
    avatar?: string;
}

const router = useRouter();
const adminUsers = ref<AdminUser[]>([]);
const isLoading = ref(true);

const formatLastSeen = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
};

const fetchAdminUsers = () => {
    const usersRef = dbRef(database, 'users');
    console.log(usersRef);
    
    onValue(usersRef, (snapshot) => {
        const users = snapshot.val();
        console.log(users);
        if (users) {
            // Filter only admin users based on email and transform the data
            adminUsers.value = Object.entries(users)
                .filter(([_, user]: [string, any]) => user.email?.toLowerCase().includes('admin'))
                .map(([id, user]: [string, any]) => {
                    // Get latest message data
                    let lastMessage = '';
                    let latestUnreadMessage = '';
                    
                    // Check if user has message conversations
                    if (user.messages) {
                        // Iterate through all conversations to find last messages
                        Object.entries(user.messages).forEach(([convId, convo]: [string, any]) => {
                            // Only process if it's a conversation object with lastMessage
                            if (typeof convo === 'object' && convo.lastMessage) {
                                // Update last message if this is a more recent one
                                if (!lastMessage || (convo.lastMessageTime && !lastMessage)) {
                                    lastMessage = convo.lastMessage;
                                }
                                
                                // If there are unread messages, capture this as the latest unread
                                if (convo.unreadCount && convo.unreadCount > 0) {
                                    latestUnreadMessage = convo.lastMessage;
                                }
                            }
                        });
                    }
                    
                    return {
                        id: user.uid || id,
                        name: user.name,
                        email: user.email,
                        lastLogin: user.lastLogin,
                        status: user.status || 'active',
                        unreadCount: user.messages?.unreadCount || 0,
                        lastMessage: lastMessage,
                        latestUnreadMessage: latestUnreadMessage || lastMessage,
                        avatar: user.avatar
                    };
                });
        } else {
            adminUsers.value = [];
        }
        isLoading.value = false;
    }, (error) => {
        console.error('Error fetching admin users:', error);
        isLoading.value = false;
    });
};

const openChat = (admin: AdminUser) => {
    router.push(`/chat/${admin.id}`);
};

onMounted(() => {
    fetchAdminUsers();
});

onUnmounted(() => {
    // Clean up the real-time listener when component is unmounted
    const usersRef = dbRef(database, 'users');
    off(usersRef);
});
</script>

<style scoped>
.message-list {
    background: transparent;
}

.message-item {
    --background: transparent;
    --padding-start: 0;
    --inner-padding-end: 0;
    margin-bottom: 16px;
    border-radius: 12px;
    background: var(--ion-color-light);
}

.avatar {
    width: 56px;
    height: 56px;
    margin-right: 12px;
    position: relative;
}

.status-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--ion-color-light);
}

.status-indicator.active {
    background-color: #4CAF50;
}

.status-indicator.away {
    background-color: #FFC107;
}

.status-indicator.offline {
    background-color: #9E9E9E;
}

.message-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.message-header h2 {
    font-weight: 600;
    font-size: 1.1rem;
    margin: 0;
    color: var(--ion-color-dark);
}

.time {
    font-size: 0.8rem;
    color: var(--ion-color-medium);
}

.message-preview {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.message-preview p {
    margin: 0;
    color: var(--ion-color-medium);
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
}

.unread-badge {
    --padding-start: 6px;
    --padding-end: 6px;
    --padding-top: 4px;
    --padding-bottom: 4px;
    font-size: 0.8rem;
    border-radius: 10px;
    min-width: 20px;
    height: 20px;
}

ion-toolbar {
    --background: var(--ion-color-light);
    --border-color: transparent;
}

.title-icon {
    vertical-align: middle;
    margin-right: 8px;
    font-size: 1.2em;
    color: var(--ion-color-primary);
}

ion-title {
    font-weight: 600;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Skeleton loader styles */
.skeleton-item {
    --background: transparent;
    animation: pulse 1.5s infinite;
}

.skeleton-avatar {
    background: var(--ion-color-medium);
    opacity: 0.2;
}

.skeleton-text {
    height: 16px;
    background: var(--ion-color-medium);
    opacity: 0.2;
    border-radius: 4px;
    margin: 4px 0;
}

.skeleton-name {
    width: 120px;
}

.skeleton-time {
    width: 60px;
}

.skeleton-message {
    width: 200px;
}

@keyframes pulse {
    0% {
        opacity: 0.6;
    }
    50% {
        opacity: 0.3;
    }
    100% {
        opacity: 0.6;
    }
}

.unread-message {
    font-weight: 600;
    color: var(--ion-color-dark);
}
</style> 