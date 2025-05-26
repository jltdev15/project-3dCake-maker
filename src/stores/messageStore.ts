import { defineStore } from 'pinia';
import { ref } from 'vue';
import { database, auth } from '../config/firebase';
import { ref as dbRef, push, set, onValue, update, serverTimestamp, get } from 'firebase/database';

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: number;
    isRead: boolean;
}

export interface AdminUser {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    unreadCount: number;
}

export const useMessageStore = defineStore('message', () => {
    const adminUsers = ref<AdminUser[]>([]);
    const messages = ref<Message[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchAdminUsers = async () => {
        loading.value = true;
        error.value = null;
        try {
            const adminsRef = dbRef(database, 'admin_users');
            onValue(adminsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    adminUsers.value = Object.entries(data).map(([id, user]: [string, any]) => ({
                        id,
                        name: user.name || 'Admin',
                        role: user.role || 'Support',
                        avatar: user.avatar,
                        unreadCount: user.unreadCount || 0
                    }));
                } else {
                    adminUsers.value = [];
                }
            });
        } catch (err) {
            error.value = 'Failed to fetch admin users';
            console.error('Error fetching admin users:', err);
        } finally {
            loading.value = false;
        }
    };

    const fetchMessages = async (adminId: string) => {
        loading.value = true;
        error.value = null;
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('User not authenticated');

            const chatId = [userId, adminId].sort().join('_');
            const conversationRef = dbRef(database, `messages/${chatId}`);

            onValue(conversationRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    // Convert messages to array and sort by timestamp
                    const messageArray = Object.entries(data)
                        .map(([id, message]: [string, any]) => ({
                            id,
                            ...message
                        }))
                        .sort((a, b) => a.timestamp - b.timestamp);
                    messages.value = messageArray;
                } else {
                    messages.value = [];
                }
            });
        } catch (err) {
            error.value = 'Failed to fetch messages';
            console.error('Error fetching messages:', err);
        } finally {
            loading.value = false;
        }
    };

    const sendMessage = async (adminId: string, content: string) => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('User not authenticated');

            const chatId = [userId, adminId].sort().join('_');
            const timestamp = Date.now();
            const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Create message data
            const messageData = {
                content,
                conversationId: chatId,
                senderId: userId,
                timestamp,
                isRead: false
            };

            // Save message under the conversation ID in messages node
            const conversationRef = dbRef(database, `messages/${chatId}`);
            const newMessageRef = push(conversationRef);
            await set(newMessageRef, messageData);

            // Update user's chat metadata
            const userChatRef = dbRef(database, `users/${userId}/messages/${chatId}`);
            await update(userChatRef, {
                lastMessage: content,
                lastMessageTime: formattedTime,
                unreadCount: 0
            });

            // Update admin's chat metadata
            const adminChatRef = dbRef(database, `users/${adminId}/messages/${chatId}`);
            await update(adminChatRef, {
                lastMessage: content,
                lastMessageTime: formattedTime,
                unreadCount: 1
            });

        } catch (err) {
            error.value = 'Failed to send message';
            console.error('Error sending message:', err);
            throw err;
        }
    };

    const markMessagesAsRead = async (adminId: string) => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('User not authenticated');

            const chatId = [userId, adminId].sort().join('_');
            const conversationRef = dbRef(database, `messages/${chatId}`);
            
            // Get current messages
            const snapshot = await get(conversationRef);
            const data = snapshot.val();
            
            if (data) {
                // Create an object with all updates
                const updates: { [key: string]: any } = {};
                
                // Add message updates
                Object.entries(data).forEach(([id, message]: [string, any]) => {
                    if (message.senderId === adminId && !message.isRead) {
                        updates[`${id}/isRead`] = true;
                    }
                });
                
                // Apply all updates at once if there are any
                if (Object.keys(updates).length > 0) {
                    await update(conversationRef, updates);
                }
            }

        } catch (err) {
            error.value = 'Failed to mark messages as read';
            console.error('Error marking messages as read:', err);
            throw err;
        }
    };

    return {
        adminUsers,
        messages,
        loading,
        error,
        fetchAdminUsers,
        fetchMessages,
        sendMessage,
        markMessagesAsRead
    };
}); 