import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { database } from '@/config/firebase'
import { ref as dbRef, onValue, off, push, set, update, get } from 'firebase/database'
import type { User } from 'firebase/auth'

interface OrderNotification {
  message: string
  orderId: string
  read: boolean
  status: 'pending' | 'accepted' | 'declined' | 'priced'
  timestamp: number
  key?: string // Add key to store the Firebase key
}

export const useOrderNotificationStore = defineStore('orderNotification', () => {
  const notifications = ref<OrderNotification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Listen to order notifications for a specific user
  function listenToOrderNotifications(user: User) {
    loading.value = true
    error.value = null

    const notificationsRef = dbRef(database, `users/${user.uid}/ordernotification`)
    
    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Convert object to array and include Firebase key
        notifications.value = Object.entries(data).map(([key, value]) => ({
          ...(value as any),
          key // Store the Firebase key for later use
        })).sort((a: any, b: any) => 
          b.timestamp - a.timestamp
        ) as OrderNotification[]
      } else {
        notifications.value = []
      }
      loading.value = false
    }, (err) => {
      error.value = err instanceof Error ? err.message : 'Failed to fetch notifications'
      loading.value = false
    })

    // Return cleanup function
    return () => {
      off(notificationsRef)
    }
  }

  // Add a new order notification
  async function addOrderNotification(userId: string, notification: Omit<OrderNotification, 'read'>) {
    try {
      const notificationsRef = dbRef(database, `users/${userId}/ordernotification`)
      const newNotificationRef = push(notificationsRef)
      
      await set(newNotificationRef, {
        ...notification,
        read: false
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add notification'
      throw err
    }
  }

  // Mark notification as read
  async function markAsRead(userId: string, orderId: string, notificationKey?: string) {
    try {
      // If the key is provided directly, use it
      if (notificationKey) {
        const notificationRef = dbRef(database, `users/${userId}/ordernotification/${notificationKey}`)
        await update(notificationRef, {
          read: true
        })
        
        // Update local state
        const notificationIndex = notifications.value.findIndex(n => n.key === notificationKey)
        if (notificationIndex !== -1) {
          notifications.value[notificationIndex].read = true
        }
        return
      }

      // Fallback to finding by orderId (for backward compatibility)
      const notification = notifications.value.find(n => n.orderId === orderId)
      
      if (!notification || !notification.key) {
        console.error('Notification not found or missing key')
        return
      }
      
      // Use the key from the notification object to update the correct entry
      const notificationRef = dbRef(database, `users/${userId}/ordernotification/${notification.key}`)
      await update(notificationRef, {
        read: true
      })
      
      // Update local state
      notification.read = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark notification as read'
      throw err
    }
  }

  // Mark all notifications as read
  async function markAllAsRead(userId: string) {
    try {
      const notificationsRef = dbRef(database, `users/${userId}/ordernotification`)
      const updates: { [key: string]: boolean } = {}
      
      notifications.value.forEach(notification => {
        if (!notification.read && notification.key) {
          updates[`${notification.key}/read`] = true
        }
      })

      if (Object.keys(updates).length > 0) {
        await update(notificationsRef, updates)
        
        // Update local state
        notifications.value.forEach(notification => {
          notification.read = true
        })
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark all notifications as read'
      throw err
    }
  }

  // Get unread notifications count
  const unreadCount = computed(() => 
    notifications.value.filter(notification => !notification.read).length
  )

  return {
    notifications,
    loading,
    error,
    unreadCount,
    listenToOrderNotifications,
    addOrderNotification,
    markAsRead,
    markAllAsRead
  }
}) 