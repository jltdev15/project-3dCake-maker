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
    console.log('Loading orders...')
    console.log('Current user:', authStore.user)
    
    if (!authStore.user?.uid) {
      console.log('No user ID available, cannot load orders')
      return
    }

    try {
      const ordersRef = dbRef(database, `users/${authStore.user.uid}/orders`)
      console.log('Orders reference path:', `users/${authStore.user.uid}/orders`)
      
      // Clean up previous listener if it exists
      if (unsubscribe) {
        console.log('Cleaning up previous listener')
        unsubscribe()
      }

      // Set up real-time listener
      unsubscribe = onValue(ordersRef, async (snapshot) => {
        console.log('Orders snapshot received:', snapshot.exists() ? 'exists' : 'does not exist')
        
        if (snapshot.exists()) {
          const orderIds = Object.keys(snapshot.val())
          console.log('Found order IDs:', orderIds)
          
          const orderPromises = orderIds.map(async (orderId) => {
            const orderRef = dbRef(database, `orders/non-custom/${orderId}`)
            const orderSnapshot = await get(orderRef)
            console.log(`Order ${orderId} details:`, orderSnapshot.exists() ? 'exists' : 'does not exist')
            return orderSnapshot.val()
          })
          
          const orderData = await Promise.all(orderPromises)
          console.log('Processed order data:', orderData)
          orders.value = orderData.filter(order => order !== null)
          console.log('Final orders array:', orders.value)
        } else {
          console.log('No orders found in snapshot')
          orders.value = []
        }
      }, (error) => {
        console.error('Error in orders listener:', error)
        orders.value = []
      })
    } catch (error) {
      console.error('Error setting up orders listener:', error)
      orders.value = []
    }
  }

  const cleanup = () => {
    if (unsubscribe) {
      console.log('Cleaning up orders listener')
      unsubscribe()
      unsubscribe = null
    }
  }

  // Load orders immediately if user is authenticated
  if (authStore.user?.uid) {
    console.log('User is authenticated, loading orders immediately')
    loadOrders()
  } else {
    console.log('No authenticated user, orders will not be loaded')
  }

  return {
    orders,
    loadOrders,
    cleanup
  }
}) 