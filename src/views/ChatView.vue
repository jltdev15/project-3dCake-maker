<template>
    <ion-page class="chat-page">
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
                             <button @click="$router.back()"
                                class="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 active:scale-95 transition-all duration-200 touch-manipulation">
                                <ion-icon :icon="chevronBackOutline" 
                                    class="text-lg sm:text-xl text-gray-800 drop-shadow-sm group-hover:scale-110 transition-transform duration-200"></ion-icon>
                            </button>
                        </div>

                        <!-- Center - Title Section -->
                        <div class="flex-1 text-center mx-4">
                            <div class="flex items-center justify-center space-x-2 sm:space-x-3">
                                <!-- Title Text -->
                                <div class="text-center">
                                    <h1 class="text-lg sm:text-xl font-bold tracking-wide drop-shadow-sm text-gray-800">
                                        Chat with Admin
                                    </h1>
                                    <p class="text-xs sm:text-sm opacity-70 font-medium tracking-wide mt-0.5 text-gray-700">
                                        PSALM Cakes Support
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Right Side - Placeholder for symmetry -->
                        <div class="flex items-center space-x-2">
                            <div class="w-10 h-10 sm:w-12 sm:h-12"></div> 
                        </div>
                    </div>
                </div>
            </div>
        </ion-header>

        <ion-content ref="contentRef" class="ion-padding chat-content">
            <div v-if="loading" class="loading-container">
                <ion-spinner name="crescent"></ion-spinner>
            </div>

            <div v-else-if="error" class="error-container">
                <ion-text color="danger">{{ error }}</ion-text>
            </div>

            <!-- Empty State -->
            <div v-else-if="messages.length === 0" class="empty-state">
                <div class="empty-state-content">
                    <div class="empty-state-icon">
                        <ion-icon :icon="chatbubblesOutline"></ion-icon>
                    </div>
                    <h2 class="empty-state-title">No Messages Yet</h2>
                    <p class="empty-state-subtitle">Start the conversation with PSALM Cakes Support!</p>
                </div>
            </div>

            <!-- Actual messages -->
            <div v-else class="messages-container">
                <div v-for="message in messages" :key="message.id" 
                     :class="['message', message.senderId === currentUserId ? 'message-sent' : 'message-received']">
                    <div class="message-content">
                        <!-- Image message -->
                        <img v-if="message.imageUrl" 
                             :src="message.imageUrl" 
                             class="message-image"
                             @click="openImage(message.imageUrl)"
                             alt="Message image" />
                        <!-- Text message -->
                        <span v-if="message.content">{{ message.content }}</span>
                    </div>
                    <div class="message-time">
                        {{ formatTime(message.timestamp) }}
                    </div>
                </div>
                <!-- Anchor element for scrolling -->
                <div ref="messagesEndRef"></div>
            </div>
        </ion-content>

        <ion-footer class="chat-footer ion-no-border">
            <ion-toolbar>
                <ion-item class="message-input-item">
                    <ion-input 
                        v-model="newMessage" 
                        placeholder="Type a message..." 
                        @keyup.enter="sendMessage"
                        class="message-input"
                    ></ion-input>
                    <ion-button slot="end" fill="clear" @click="sendMessage" class="send-button">
                        <ion-icon :icon="send" class="send-icon"></ion-icon>
                    </ion-button>
                </ion-item>
            </ion-toolbar>
        </ion-footer>

        <!-- Image Preview Modal -->
        <ion-modal :is-open="showImagePreview" @didDismiss="showImagePreview = false">
            <div class="image-preview">
                <img :src="selectedImageUrl" alt="Preview" />
            </div>
        </ion-modal>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useMessageStore } from '../stores/messageStore';
import { storeToRefs } from 'pinia';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { IonModal } from '@ionic/vue';

// @ts-ignore
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonFooter,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText
} from '@ionic/vue';
// @ts-ignore
import { send, chevronBackOutline, chatbubblesOutline } from 'ionicons/icons';

const route = useRoute();
const messageStore = useMessageStore();
const { messages, loading, error } = storeToRefs(messageStore);
const newMessage = ref('');
const contentRef = ref();
const messagesEndRef = ref();

const adminId = computed(() => route.params.id as string);

const formatTime = (timestamp: number | string) => {
    if (typeof timestamp === 'string') {
        return timestamp; // Return as is if it's already a formatted string
    } else if (timestamp) {
         return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        return ''; // Handle cases where timestamp might be null or undefined
    }
};

const scrollToBottom = async () => {
    await nextTick();
    // Use a slight delay to ensure content is fully rendered before scrolling
    setTimeout(() => {
       if (contentRef.value && contentRef.value.$el) {
            contentRef.value.$el.scrollToBottom(300); // Use Ionic's scroll method
        } else if (messagesEndRef.value) {
            // Fallback to native scroll if Ionic method is not available
            messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
        }
    }, 50);
};

const sendMessage = async () => {
    if (!newMessage.value.trim()) return;
    
    try {
        await messageStore.sendMessage(adminId.value, newMessage.value);
        newMessage.value = '';
        // Scrolling is now handled by the watch effect on messages and the markAsRead promise
    } catch (err) {
        console.error('Error sending message:', err);
        // Optionally show an error message to the user
    }
};

const currentUserId = ref<string | null>(null);

const markAsRead = async () => {
    if (!adminId.value || !currentUserId.value) return;
    
    // Delay marking as read slightly to allow scroll to finish and avoid race conditions
    setTimeout(async () => {
        try {
            await messageStore.markMessagesAsRead(adminId.value);
            // Scroll to bottom after marking as read, in case new unread messages came in
             await scrollToBottom();
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }, 100);
};

// Add new refs for image preview
const showImagePreview = ref(false);
const selectedImageUrl = ref('');

// Add function to handle image click
const openImage = (imageUrl: string) => {
    selectedImageUrl.value = imageUrl;
    showImagePreview.value = true;
};

onMounted(async () => {
    // Wait for authentication state to be confirmed
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId.value = user.uid;
            try {
                // Only fetch messages for the specific chat
                await messageStore.fetchMessages(adminId.value);
                // Mark messages as read when conversation opens
                 await markAsRead(); // markAsRead will handle scrolling
            } catch (error) {
                console.error('Error initializing chat:', error);
                // Handle error, maybe show a message
            }
        } else {
            // User is not logged in, handle accordingly (e.g., redirect)
            console.warn("User not authenticated, cannot load chat.");
            // router.replace('/login'); // Example redirect
        }
    });
});

// Watch for new messages and mark them as read, then scroll
watch(messages, async (newMessages, oldMessages) => {
     // Check if new messages were added and the last message is from the current user
     // or if there are unread messages from the other user
     const userId = auth.currentUser?.uid;
     const hasNewMessages = newMessages && oldMessages && newMessages.length > oldMessages.length;

     if (hasNewMessages) {
        const lastMessage = newMessages[newMessages.length - 1];
        const isLastMessageFromCurrentUser = lastMessage.senderId === userId;
        // If the last message is from the current user, scroll immediately
        if (isLastMessageFromCurrentUser) {
             await scrollToBottom();
        } else {
            // If the last message is from the other user, mark as read and then scroll
            await markAsRead(); // markAsRead will handle scrolling after a short delay
        }
     } else if (Array.isArray(newMessages) && newMessages.length > 0) {
        // Initial load or other updates, ensure view is correct
        // This handles cases where messages might be updated without length change (e.g., read status)
        // Only scroll if the very last message is from the current user OR if there were new messages added (handled above)
         const lastMessage = newMessages[newMessages.length - 1];
         if (lastMessage && lastMessage.senderId === userId) {
             await scrollToBottom();
         }
     }
}, { deep: true });

</script>

<style scoped>
.chat-page {
    --background: var(--ion-color-light);
}

.chat-content {
    --padding-top: 16px;
    --padding-bottom: 16px;
    --padding-start: 16px;
    --padding-end: 16px;
}

.messages-container {
    display: flex;
    flex-direction: column;
    gap: 12px; /* Reduced gap */
    max-width: 768px; /* Consistent max width */
    margin: 0 auto; /* Center the messages */
    width: 100%;
}

.message {
    max-width: 80%; /* Adjusted max width for better fit */
    padding: 10px 14px; /* Adjusted padding */
    border-radius: 18px; /* More rounded corners */
    position: relative;
    font-size: 0.95rem; /* Slightly smaller font */
    line-height: 1.4; /* Improved readability */
    word-break: break-word;
}

.message-sent {
    align-self: flex-end;
    background: #58091F; /* Primary brand color */
    color: white;
    border-bottom-right-radius: 6px; /* Asymmetrical border radius */
    margin-left: auto;
    text-align: left;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */
}

.message-received {
    align-self: flex-start;
    background: #FFFFFF; /* White background for received */
    color: var(--ion-color-dark); /* Dark text */
    border-bottom-left-radius: 6px; /* Asymmetrical border radius */
    margin-right: auto;
    text-align: left; /* Align received text left */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08); /* Subtle shadow */
    border: 1px solid rgba(0, 0, 0, 0.05); /* Light border */
}

.message-content {
    margin-bottom: 4px;
}

.message-time {
    font-size: 0.7em; /* Smaller time font */
    color: rgba(255, 255, 255, 0.8); /* Lighter color for sent time */
    text-align: right;
    margin-top: 4px; /* Space above time */
}

.message-received .message-time {
     color: rgba(0, 0, 0, 0.5); /* Darker color for received time */
}

/* Loading, Error, Empty states */
.loading-container,
.error-container,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 32px 16px;
    min-height: 60vh; /* Ensure they take up sufficient space */
    width: 100%;
}

.loading-container ion-spinner {
    color: #58091F; /* Spinner color */
    width: 40px;
    height: 40px;
}

.error-container ion-text {
    font-size: 1rem;
    font-weight: 500;
}

/* Empty state specific styles */
.empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.empty-state-icon {
    font-size: 64px;
    color: #58091F;
    margin-bottom: 24px;
    background: rgba(240, 230, 141, 0.2); /* Background color from Orders/Messages */
    padding: 24px;
    border-radius: 50%;
}

.empty-state-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 8px;
    color: #58091F;
}

.empty-state-subtitle {
    font-size: 1rem;
    color: #666; /* Consistent text color */
    margin: 0 0 24px;
    max-width: 300px;
}

/* Footer Input Area */
.chat-footer {
    padding: 8px 16px;
    background: var(--ion-color-light); /* Consistent background */
    border-top: 1px solid rgba(0, 0, 0, 0.05); /* Subtle top border */
}

.chat-footer ion-toolbar {
    --background: transparent;
    --padding-start: 0;
    --padding-end: 0;
    --min-height: 56px; /* Ensure sufficient height */
}

.message-input-item {
    --background: #FFFFFF; /* White background for the input container */
    --border-radius: 24px; /* Rounded corners for the whole item */
    --padding-start: 12px;
    --inner-padding-end: 0;
    --inner-border-width: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* Subtle shadow */
    overflow: hidden; /* Hide overflow if needed */
}

.message-input {
     --padding-start: 8px; /* Inner padding for text */
     --padding-end: 8px;
     font-size: 1rem;
}

.send-button {
    --padding-start: 12px;
    --padding-end: 12px;
    --ripple-color: rgba(0, 0, 0, 0.1); /* Subtle ripple */
}

.send-icon {
    font-size: 1.5rem;
    color: #58091F; /* Primary brand color */
}

/* Ensure content padding matches input item padding */
ion-content {
    --padding-bottom: calc(16px + 56px + 8px); /* Bottom padding + footer height + footer padding */
}

.message-image {
    max-width: 100%;
    max-height: 200px;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.message-image:hover {
    transform: scale(1.02);
}

/* Image Preview Modal */
ion-modal {
    --width: 100%;
    --height: 100%;
    --background: rgba(0, 0, 0, 0.9);
}

.image-preview {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.image-preview img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

</style> 