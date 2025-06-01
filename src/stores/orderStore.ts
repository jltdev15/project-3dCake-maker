import { defineStore } from 'pinia'
import { ref } from 'vue'
import { database, ref as dbRef, onValue, get } from '../config/firebase'
import { useAuthStore } from './authStore'

interface OrderItem {
  cakeId: string
  id: string
  imageUrl: string
  name: string
  quantity: number
  totalPrice: number
  unitPrice: number
}

interface PaymentDetails {
  amount: number
  createdAt: string
  currency: string
  status: 'pending' | 'completed' | 'failed'
  paymentMethod: string
}

interface Order {
  id: string
  orderId: string
  userId: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  items: OrderItem[]
  paymentDetails: PaymentDetails
  total: number
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const authStore = useAuthStore()
  let unsubscribe: (() => void) | null = null

  const loadOrders = () => {
    console.log('Loading orders...')
    console.log('Current user:', JSON.stringify(authStore.user, null, 2))
    
    if (!authStore.user?.uid) {
      console.log('No user ID available, cannot load orders')
      return Promise.resolve([])
    }

    // Store uid in a local variable to prevent TypeScript null check errors
    const uid = authStore.user.uid
    
    return new Promise((resolve) => {
      try {
        const ordersRef = dbRef(database, `users/${uid}/orders`)
        console.log('Orders reference path:', `users/${uid}/orders`)
        
        // Clean up previous listener if it exists
        if (unsubscribe) {
          console.log('Cleaning up previous listener')
          unsubscribe()
        }

        // Set up real-time listener
        unsubscribe = onValue(ordersRef, async (snapshot) => {
          console.log('Orders snapshot received:', snapshot.exists() ? 'exists' : 'does not exist')
          
          if (snapshot.exists()) {
            try {
              const orderIds = snapshot.val() as string[]
              console.log('Found order IDs:', orderIds)
              
              if (!Array.isArray(orderIds)) {
                console.error('Orders data is not an array')
                orders.value = []
                resolve([])
                return
              }
              
              const orderPromises = orderIds.map(async (orderId) => {
                try {
                  const orderRef = dbRef(database, `orders/${orderId}`)
                  const orderSnapshot = await get(orderRef)
                  
                  if (orderSnapshot.exists()) {
                    const orderData = orderSnapshot.val()
                    console.log(`Found order ${orderId}:`, orderData)
                    return orderData
                  } else {
                    console.warn(`Order ${orderId} not found`)
                    return null
                  }
                } catch (error) {
                  console.error(`Error fetching order ${orderId}:`, error)
                  return null
                }
              })
              
              try {
                const orderData = await Promise.all(orderPromises)
                console.log('All orders data retrieved:', orderData)
                const validOrders = orderData.filter(order => order !== null)
                console.log('Valid orders count:', validOrders.length)
                // Sort orders by createdAt in descending order (newest first)
                orders.value = validOrders.sort((a, b) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                console.log('Final orders array:', orders.value)
                resolve(orders.value)
              } catch (error) {
                console.error('Error processing order promises:', error)
                orders.value = []
                resolve([])
              }
            } catch (error) {
              console.error('Error processing snapshot:', error)
              orders.value = []
              resolve([])
            }
          } else {
            console.log('No orders found in snapshot')
            orders.value = []
            resolve([])
          }
        }, (error) => {
          console.error('Error in orders listener:', error)
          orders.value = []
          resolve([])
        })
      } catch (error) {
        console.error('Error setting up orders listener:', error)
        orders.value = []
        resolve([])
      }
    })
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