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
            <div class="messages-container">
                <!-- Skeleton loader -->
                <div v-if="isLoading" class="skeleton-container">
                    <div v-for="n in 3" :key="n" class="message-card skeleton-card">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-header">
                                <div class="skeleton-text skeleton-name"></div>
                                <div class="skeleton-text skeleton-time"></div>
                            </div>
                            <div class="skeleton-text skeleton-message"></div>
                        </div>
                    </div>
                </div>

                <!-- Actual content -->
                <div v-else class="message-list">
                    <div v-for="admin in adminUsers" 
                         :key="admin.id" 
                         @click="openChat(admin)" 
                         class="message-card"
                         :class="{ 'has-unread': admin.unreadCount && admin.unreadCount > 0 }">
                        <div class="message-avatar">
                            <img src="/images/logo.webp" alt="admin avatar">
                            <div class="status-indicator" :class="admin.status"></div>
                        </div>
                        <div class="message-content">
                            <div class="message-header">
                                <h3>{{ admin.name }}</h3>
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
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
// @ts-ignore - These imports are used in the template
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBadge,
    IonIcon
} from '@ionic/vue';
import { chatbubbleEllipsesOutline } from 'ionicons/icons';
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
                        Object.entries(user.messages).forEach(([_, convo]: [string, any]) => {
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
.messages-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 8px;
}

.message-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.message-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
}

.message-card::before {
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

.message-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.message-card:hover::before {
    opacity: 1;
}

.message-card.has-unread {
    background: rgba(255, 255, 255, 0.98);
    border-left: 4px solid var(--ion-color-primary);
}

.message-avatar {
    width: 56px;
    height: 56px;
    position: relative;
    flex-shrink: 0;
}

.message-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    object-fit: cover;
}

.status-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
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
    flex-grow: 1;
    min-width: 0;
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.message-header h3 {
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
    gap: 8px;
}

.message-preview p {
    margin: 0;
    color: var(--ion-color-medium);
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
}

.unread-message {
    font-weight: 600;
    color: var(--ion-color-dark);
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
    flex-shrink: 0;
}

ion-toolbar {
    --background: #7A5C1E;
    --border-color: transparent;
}

.title-icon {
    vertical-align: middle;
    margin-right: 8px;
    font-size: 1.2em;
    color: #FFFFFF;
}

ion-title {
    font-weight: 600;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
}

/* Skeleton loader styles */
.skeleton-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.skeleton-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    animation: pulse 1.5s infinite;
}

.skeleton-avatar {
    width: 56px;
    height: 56px;
    background: var(--ion-color-medium);
    opacity: 0.2;
    border-radius: 12px;
    flex-shrink: 0;
}

.skeleton-content {
    flex-grow: 1;
    min-width: 0;
}

.skeleton-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.skeleton-text {
    height: 16px;
    background: var(--ion-color-medium);
    opacity: 0.2;
    border-radius: 4px;
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

@media (max-width: 480px) {
    .message-card {
        padding: 12px;
    }

    .message-avatar {
        width: 48px;
        height: 48px;
    }

    .message-header h3 {
        font-size: 1rem;
    }

    .message-preview p {
        font-size: 0.8rem;
    }
}
</style> 