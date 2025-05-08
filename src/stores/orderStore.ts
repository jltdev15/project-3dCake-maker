import { defineStore } from 'pinia'
import { ref } from 'vue'
import { database, ref as dbRef, onValue, off, get } from '../config/firebase'
import { useAuthStore } from './authStore'

interface Order {
  orderId: string
  userId: string
  items: any[]
  totalAmount: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: number
  type: 'non-custom'
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const authStore = useAuthStore()
  let unsubscribe: (() => void) | null = null

  const loadOrders = () => {
    if (!authStore.user?.uid) return

    try {
      const ordersRef = dbRef(database, `users/${authStore.user.uid}/orders`)
      
      // Clean up previous listener if it exists
      if (unsubscribe) {
        unsubscribe()
      }

      // Set up real-time listener
      unsubscribe = onValue(ordersRef, async (snapshot) => {
        if (snapshot.exists()) {
          const orderIds = Object.keys(snapshot.val())
          const orderPromises = orderIds.map(async (orderId) => {
            const orderRef = dbRef(database, `orders/non-custom/${orderId}`)
            const orderSnapshot = await get(orderRef)
            return orderSnapshot.val()
          })
          
          const orderData = await Promise.all(orderPromises)
          orders.value = orderData.filter(order => order !== null)
        } else {
          orders.value = []
        }
      }, (error) => {
        console.error('Error loading orders:', error)
        orders.value = []
      })
    } catch (error) {
      console.error('Error setting up orders listener:', error)
      orders.value = []
    }
  }

  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // Load orders immediately if user is authenticated
  if (authStore.user?.uid) {
    loadOrders()
  }

  return {
    orders,
    loadOrders,
    cleanup
  }
}) 