<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/messages"></ion-back-button>
                </ion-buttons>
                <ion-title class="ion-text-center pr-12">PSALM Cakes</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content ref="contentRef" class="ion-padding">
            <div v-if="loading" class="loading-container">
                <ion-spinner></ion-spinner>
            </div>

            <div v-else-if="error" class="error-container">
                <ion-text color="danger">{{ error }}</ion-text>
            </div>

            <div v-else-if="messages.length === 0" class="empty-container">
                <ion-text>No messages yet. Start the conversation!</ion-text>
            </div>

            <div v-else class="messages-container">
                <div v-for="message in messages" :key="message.id" 
                     :class="['message', message.senderId === currentUserId ? 'message-sent' : 'message-received']">
                    <div class="message-content">
                        {{ message.content }}
                    </div>
                    <div class="message-time">
                        {{ formatTime(message.timestamp) }}
                    </div>
                </div>
                <!-- Anchor element for scrolling -->
                <div ref="messagesEndRef"></div>
            </div>
        </ion-content>

        <ion-footer>
            <ion-toolbar>
                <ion-item>
                    <ion-input v-model="newMessage" placeholder="Type a message..." @keyup.enter="sendMessage"></ion-input>
                    <ion-button slot="end" fill="clear" @click="sendMessage">
                        <ion-icon :icon="send"></ion-icon>
                    </ion-button>
                </ion-item>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useMessageStore } from '../stores/messageStore';
import { storeToRefs } from 'pinia';
import type { AdminUser } from '../stores/messageStore';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    IonButtons,
    IonBackButton,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText,
    useIonRouter
} from '@ionic/vue';
import { send } from 'ionicons/icons';

const route = useRoute();
const messageStore = useMessageStore();
const { adminUsers, messages, loading, error } = storeToRefs(messageStore);
const newMessage = ref('');
const contentRef = ref();
const messagesEndRef = ref();

const adminId = computed(() => route.params.id as string);
const currentAdmin = computed(() => {
    const admins = (adminUsers.value || []) as AdminUser[];
    return admins.find(admin => admin.id === adminId.value);
});

const formatTime = (timestamp: number | string) => {
    if (typeof timestamp === 'string') {
        return timestamp; // Return as is if it's already a formatted string
    }
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = async () => {
    await nextTick();
    if (messagesEndRef.value) {
        messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
    }
};

const sendMessage = async () => {
    if (!newMessage.value.trim()) return;
    
    await messageStore.sendMessage(adminId.value, newMessage.value);
    newMessage.value = '';
    await scrollToBottom();
};

const currentUserId = ref<string | null>(null);

const markAsRead = async () => {
    if (!adminId.value || !currentUserId.value) return;
    
    try {
        await messageStore.markMessagesAsRead(adminId.value);
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
};

onMounted(async () => {
    // Wait for authentication state to be confirmed
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId.value = user.uid;
            try {
                await messageStore.fetchAdminUsers();
                await messageStore.fetchMessages(adminId.value);
                // Mark messages as read when conversation opens
                await markAsRead();
                await scrollToBottom();
            } catch (error) {
                console.error('Error initializing chat:', error);
            }
        }
    });
});

// Watch for new messages and mark them as read
watch(messages, async () => {
    if (Array.isArray(messages.value) && messages.value.length > 0) {
        await markAsRead();
        await scrollToBottom();
    }
}, { deep: true });
</script>

<style scoped>
.messages-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 16px;
    width: 100%;
}

.message {
    max-width: 70%;
    padding: 12px;
    border-radius: 12px;
    position: relative;
}

.message-sent {
    align-self: flex-end;
    background: var(--ion-color-primary);
    color: white;
    border-bottom-right-radius: 4px;
    margin-left: auto;
    text-align: left;
}

.message-received {
    align-self: flex-start;
    background: var(--ion-color-light);
    color: var(--ion-color-dark);
    border-bottom-left-radius: 4px;
    margin-right: auto;
    text-align: right;
}

.message-content {
    margin-bottom: 4px;
    word-break: break-word;
}

.message-time {
    font-size: 0.8em;
    opacity: 0.7;
    text-align: right;
}

.loading-container,
.error-container,
.empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

ion-footer {
    padding: 8px;
}

ion-item {
    --background: transparent;
    --border-color: var(--ion-color-light);
}
</style> 