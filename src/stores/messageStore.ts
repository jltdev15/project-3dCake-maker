import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { database, auth } from '../config/firebase';
import { ref as dbRef, push, set, onValue, update, get, off } from 'firebase/database';

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    type: 'text' | 'image';
    imageUrl?: string;
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
    const unreadMessagesCount = ref(0);
    let userListener: any = null;
    let adminUsersListener: any = null;

    // Computed property to check if there are any unread messages
    const hasNewMessages = computed(() => {
        return unreadMessagesCount.value > 0;
    });

    // Check for unread messages for the current user with real-time updates
    const checkUnreadMessages = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            // Remove existing listener if any
            if (userListener) {
                off(userListener);
            }

            const userRef = dbRef(database, `users/${userId}`);
            userListener = onValue(userRef, (snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    // Check if user has a top-level unreadCount
                    if (userData.unreadCount && userData.unreadCount > 0) {
                        unreadMessagesCount.value = userData.unreadCount;
                        return;
                    }
                    
                    // Check individual conversation unreadCounts
                    let totalUnread = 0;
                    if (userData.messages) {
                        Object.values(userData.messages).forEach((convo: any) => {
                            if (convo.unreadCount) {
                                totalUnread += convo.unreadCount;
                            }
                        });
                    }
                    unreadMessagesCount.value = totalUnread;
                } else {
                    unreadMessagesCount.value = 0;
                }
            });
        } catch (err) {
            console.error('Error checking unread messages:', err);
            unreadMessagesCount.value = 0;
        }
    };

    // Listen for new messages from admin users
    const listenForNewMessages = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            // Remove existing listener if any
            if (adminUsersListener) {
                off(adminUsersListener);
            }

            const usersRef = dbRef(database, 'users');
            adminUsersListener = onValue(usersRef, (snapshot) => {
                const usersData = snapshot.val();
                if (usersData) {
                    let totalUnread = 0;
                    
                    // Check all admin users for unread messages to current user
                    Object.entries(usersData).forEach(([adminId, adminData]: [string, any]) => {
                        const isAdmin = adminData.email?.toLowerCase().includes('admin');
                        if (isAdmin && adminData.messages) {
                            const chatId = [userId, (adminData.uid || adminId)].sort().join('_');
                            const convoData = adminData.messages[chatId];
                            if (convoData && convoData.unreadCount) {
                                totalUnread += convoData.unreadCount;
                            }
                        }
                    });
                    
                    unreadMessagesCount.value = totalUnread;
                } else {
                    unreadMessagesCount.value = 0;
                }
            });
        } catch (err) {
            console.error('Error listening for new messages:', err);
        }
    };

    // Clean up listeners
    const cleanupListeners = () => {
        if (userListener) {
            off(userListener);
            userListener = null;
        }
        if (adminUsersListener) {
            off(adminUsersListener);
            adminUsersListener = null;
        }
    };



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

    const sendMessage = async (adminId: string, content: string, type: 'text' | 'image' = 'text', imageUrl?: string) => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('User not authenticated');

            const chatId = [userId, adminId].sort().join('_');
            const timestamp = Date.now();
            const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Create message data
            const messageData: any = {
                content: type === 'image' ? 'Image' : content,
                type,
                conversationId: chatId,
                senderId: userId,
                timestamp,
                isRead: false
            };

            // Only add imageUrl if it's an image message and URL is provided
            if (type === 'image' && imageUrl) {
                messageData.imageUrl = imageUrl;
            }

            // Save message under the conversation ID in messages node
            const conversationRef = dbRef(database, `messages/${chatId}`);
            const newMessageRef = push(conversationRef);
            await set(newMessageRef, messageData);

            // Update user's chat metadata
            const userChatRef = dbRef(database, `users/${userId}/messages/${chatId}`);
            await update(userChatRef, {
                lastMessage: type === 'image' ? '📷 Image' : content,
                lastMessageTime: formattedTime,
                unreadCount: 0
            });

            // Update admin's chat metadata
            const adminChatRef = dbRef(database, `users/${adminId}/messages/${chatId}`);
            await update(adminChatRef, {
                lastMessage: type === 'image' ? '📷 Image' : content,
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

            // Reset unread count in the user's messages
            const userMessageRef = dbRef(database, `users/${userId}/messages/${chatId}/unreadCount`);
            await set(userMessageRef, 0);

            // Update the local unreadMessagesCount to reflect the change immediately
            checkUnreadMessages();

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
        unreadMessagesCount,
        hasNewMessages,
        checkUnreadMessages,
        listenForNewMessages,
        cleanupListeners,
        fetchAdminUsers,
        fetchMessages,
        sendMessage,
        markMessagesAsRead
    };
}); 