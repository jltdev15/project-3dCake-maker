<template>
    <ion-page class="messages-page">
        <ion-header class="ion-no-border">
            <!-- Modern Redesigned Toolbar -->
            <div class="relative bg-gradient-to-r from-[#F0E68D] via-[#E6D77A] to-[#DCC867] text-gray-800 shadow-xl">
                <!-- Background Pattern Overlay -->
                <div class="absolute inset-0 bg-black/5 opacity-20"></div>
                <div class="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-transparent"></div>

                <!-- Main Content -->
                <div class="relative px-4 py-3 sm:px-6 sm:py-4">
                    <div class="flex items-center justify-between">
                        <!-- Left Side - Placeholder/Menu or Back Button if applicable -->
                        <!-- <div class="flex items-center">
                             <button @click="$router.back()"
                                class="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 active:scale-95 transition-all duration-200 touch-manipulation">
                                <ion-icon :icon="chevronBackOutline" 
                                    class="text-lg sm:text-xl text-gray-800 drop-shadow-sm group-hover:scale-110 transition-transform duration-200"></ion-icon>
                            </button>
                        </div> -->
                        <div class="flex items-center space-x-2">
                            <div class="w-10 h-10 sm:w-12 sm:h-12"></div> <!-- Placeholder for symmetry -->
                        </div>
                        <!-- Center - Title Section -->
                        <div class="flex-1 text-center items-center mx-4">
                            <div class="flex items-center justify-center space-x-2 sm:space-x-3">
                                <ion-icon :icon="chatbubbleEllipsesOutline"
                                    class="text-xl sm:text-2xl text-gray-800 drop-shadow-sm"></ion-icon>
                                <h1 class="text-lg sm:text-xl font-bold tracking-wide drop-shadow-sm text-gray-800">
                                    Messages
                                </h1>
                            </div>
                        </div>

                        <!-- Right Side - Action Buttons (e.g., New Message) - Placeholder -->
                        <div class="flex items-center space-x-2">
                            <div class="w-10 h-10 sm:w-12 sm:h-12"></div> <!-- Placeholder for symmetry -->
                        </div>
                    </div>
                </div>
            </div>
        </ion-header>

        <ion-content>
            <div class="messages-container">
                <!-- Skeleton loader -->
                <div v-if="isLoading" class="skeleton-container">
                    <div v-for="n in 4" :key="`skel-${n}`" class="message-card skeleton-card">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-line w-3/4 h-5 mb-2"></div>
                            <div class="skeleton-line w-1/2 h-4"></div>
                        </div>
                        <div class="skeleton-line w-10 h-4 ml-auto self-start"></div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else-if="!isLoading && adminUsers.length === 0" class="empty-state">
                    <div class="empty-state-content">
                        <div class="empty-state-icon">
                            <ion-icon :icon="chatbubblesOutline"></ion-icon>
                        </div>
                        <h2 class="empty-state-title">No Messages</h2>
                        <p class="empty-state-subtitle">You don't have any messages yet. Admins will appear here when
                            available.</p>
                    </div>
                </div>

                <!-- Actual content -->
                <div v-else class="message-list">
                    <div v-for="admin in adminUsers" :key="admin.id" @click="openChat(admin)" class="message-card"
                        :class="{ 'has-unread': admin.unreadCount && admin.unreadCount > 0 }">

                        <div class="message-avatar">
                            <img :src="admin.avatar || '/images/logo.webp'" alt="admin avatar">
                            <div class="status-indicator" :class="getOnlineStatusClass(admin.status)"></div>
                        </div>
                        <div class="message-content">
                            <div class="message-header">
                                <h3 class="font-semibold text-gray-800">{{ admin.name }}</h3>
                                <span class="time text-xs text-gray-500">{{ formatLastSeen(admin.lastLogin) }}</span>
                            </div>
                            <div class="message-preview">
                                <p :class="{ 'unread-text': admin.unreadCount && admin.unreadCount > 0, 'text-gray-600': !admin.unreadCount || admin.unreadCount === 0 }"
                                    class="text-sm truncate">
                                    {{ admin.latestUnreadMessage || admin.lastMessage || 'No recent messages' }}
                                </p>
                                <ion-badge v-if="admin.unreadCount && admin.unreadCount > 0" class="unread-badge">
                                    {{ admin.unreadCount }}
                                </ion-badge>
                            </div>
                        </div>
                        <ion-icon :icon="chevronForwardOutline" class="text-gray-400 ml-2"></ion-icon>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
// @ts-ignore
import {
    IonPage,
    IonContent,
    IonBadge,
    IonIcon
} from '@ionic/vue';
// @ts-ignore
import { chevronBackOutline, chevronForwardOutline, chatbubblesOutline, chatbubbleEllipsesOutline } from 'ionicons/icons';
import { ref as dbRef, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    lastLogin?: number;
    status?: string;
    unreadCount?: number;
    lastMessage?: string;
    latestUnreadMessage?: string;
    avatar?: string;
}

interface ConversationData {
    lastMessage?: string;
    lastSenderId?: string;
    unreadCount?: number;
}

const router = useRouter();
const authStore = useAuthStore();
const adminUsers = ref<AdminUser[]>([]);
const isLoading = ref(true);

const formatLastSeen = (timestamp?: number) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getOnlineStatusClass = (status?: string) => {
    if (!status) return 'bg-gray-400';
    switch (status.toLowerCase()) {
        case 'online':
        case 'active':
            return 'bg-green-500';
        case 'away':
            return 'bg-yellow-500';
        default:
            return 'bg-gray-400';
    }
};

const fetchAdminUsersAndMessages = () => {
    const usersRef = dbRef(database, 'users');
    const currentUserId = authStore.user?.uid;

    console.log('Fetching admin users...', { currentUserId });

    if (!currentUserId) {
        isLoading.value = false;
        console.warn("User not logged in, cannot fetch messages.");
        adminUsers.value = [];
        return;
    }

    onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val();
        console.log('Received users data:', usersData);

        if (usersData) {
            const admins: AdminUser[] = Object.entries(usersData)
                .filter(([_, adminData]: [string, any]) => {
                    const isAdmin = adminData.email?.toLowerCase().includes('admin');
                    console.log('Checking user:', { email: adminData.email, isAdmin });
                    return isAdmin;
                })
                .map(([id, adminData]: [string, any]) => {
                    console.log('Processing admin user:', { id, adminData });
                    let unreadCountForCurrentUser = 0;
                    let lastMessageTextForCurrentUser = 'No recent messages';
                    let latestUnreadMessageText = '';

                    // Calculate the chatId based on the user IDs (sorted)
                    const chatId = [currentUserId, (adminData.uid || id)].sort().join('_');
                    console.log('Calculated chatId:', chatId);

                    // Check for conversation data with the current user using the calculated chatId
                    if (adminData.messages && adminData.messages[chatId]) {
                        const convoData = adminData.messages[chatId] as ConversationData;
                        console.log('Found conversation data:', convoData);

                        if (typeof convoData === 'object' && convoData !== null) {
                            unreadCountForCurrentUser = convoData.unreadCount || 0;
                            const rawLastMessage = convoData.lastMessage || '';

                            if (rawLastMessage) {
                                if (convoData.lastSenderId === (adminData.uid || id)) {
                                    lastMessageTextForCurrentUser = `Admin: ${rawLastMessage}`;
                                    if (unreadCountForCurrentUser > 0) {
                                        latestUnreadMessageText = rawLastMessage;
                                    }
                                } else if (convoData.lastSenderId === currentUserId) {
                                    lastMessageTextForCurrentUser = `You: ${rawLastMessage}`;
                                } else {
                                    lastMessageTextForCurrentUser = rawLastMessage;
                                }
                            }
                        }
                    }

                    return {
                        id: adminData.uid || id,
                        name: adminData.name || 'Admin User',
                        email: adminData.email || 'No email',
                        lastLogin: adminData.lastLogin,
                        status: adminData.status || 'offline',
                        avatar: adminData.avatar,
                        unreadCount: unreadCountForCurrentUser,
                        lastMessage: lastMessageTextForCurrentUser,
                        latestUnreadMessage: latestUnreadMessageText
                    };
                });

            console.log('Processed admin users:', admins);
            adminUsers.value = admins.sort((a, b) => {
                const unreadDiff = (b.unreadCount || 0) - (a.unreadCount || 0);
                if (unreadDiff !== 0) return unreadDiff;
                if ((b.lastLogin || 0) === (a.lastLogin || 0)) {
                    return (a.name || '').localeCompare(b.name || '');
                }
                return (b.lastLogin || 0) - (a.lastLogin || 0);
            });
        } else {
            console.log('No users data found');
            adminUsers.value = [];
        }
        isLoading.value = false;
    }, (error) => {
        console.error('Error fetching admin users and messages:', error);
        isLoading.value = false;
    });
};

const openChat = (admin: AdminUser) => {
    router.push(`/chat/${admin.id}`);
};

onMounted(() => {
    fetchAdminUsersAndMessages();
});

onUnmounted(() => {
    const usersRefPath = dbRef(database, 'users');
    off(usersRefPath);
});
</script>

<style scoped>
.messages-page {
    --background: var(--ion-color-light);
}

/* Header styling is handled by Tailwind utility classes */

.messages-container {
    padding: 16px;
    max-width: 768px;
    margin: 0 auto;
}

.message-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.message-card {
    background: #FFFFFF;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    position: relative;
}

.message-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.message-card.has-unread {
    background-color: #FFFBEB;
}

.message-avatar {
    width: 48px;
    height: 48px;
    position: relative;
    flex-shrink: 0;
}

.message-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #F0E68D;
}

.status-indicator {
    position: absolute;
    bottom: 0px;
    right: 0px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
}

/* Online status colors are handled by getOnlineStatusClass with Tailwind */

.message-content {
    flex-grow: 1;
    min-width: 0;
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
}

.message-header h3 {
    margin: 0;
}

.message-preview {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}

.message-preview p {
    margin: 0;
}

.unread-text {
    font-weight: 600;
    color: #374151;
}

.unread-badge {
    background-color: #58091F;
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 8px;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
}

/* Skeleton loader styles, adapted for new card design */
.skeleton-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.skeleton-card {
    background: #FFFFFF;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    opacity: 0.7;
}

.skeleton-avatar {
    width: 48px;
    height: 48px;
    background-color: #E5E7EB;
    border-radius: 50%;
    flex-shrink: 0;
}

.skeleton-content {
    flex-grow: 1;
}

.skeleton-line {
    background-color: #E5E7EB;
    border-radius: 4px;
    height: 10px;
}

/* Empty state styling, consistent with NotificationView */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 150px);
    text-align: center;
}

.empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 32px 16px;
}

.empty-state-icon {
  font-size: 48px;
  color: #58091F;
  margin-bottom: 24px;
  background: rgba(240, 230, 141, 0.2);
  padding: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #58091F;
}

.empty-state-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0 0 24px;
  max-width: 300px;
}


@media (max-width: 480px) {
    .message-card {
        padding: 12px;
        gap: 12px;
    }

    .message-avatar {
        width: 40px;
        height: 40px;
    }
    .status-indicator {
        width: 10px;
        height: 10px;
        bottom: -1px;
        right: -1px;
    }

    .message-header h3 {
        font-size: 0.95rem;
    }

    .message-preview p {
        font-size: 0.85rem;
    }
    .unread-badge {
        font-size: 0.65rem;
        padding: 1px 5px;
    }
}
</style> 