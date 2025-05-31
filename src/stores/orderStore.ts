import { defineStore } from 'pinia'
import { ref } from 'vue'
import { database, ref as dbRef, onValue, off, get } from '../config/firebase'
import { useAuthStore } from './authStore'

interface OrderItem {
  cakeId: string
  id: string
  imageUrl: string
  name: string
  quantity: number
  size?: string
  totalPrice: number
  unitPrice: number
}

interface BaseOrder {
  orderId: string
  userId: string
  customerName: string
  customerEmail: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: number
}

interface NonCustomOrder extends BaseOrder {
  items: OrderItem[]
  totalAmount: number
  type: 'non-custom'
}

interface CustomOrder extends BaseOrder {
  items: {
    needsPricing: boolean
  }
  orderType: 'custom'
  pricingStatus: 'pending' | 'priced' | 'accepted'
  updatedAt: number
}

type Order = NonCustomOrder | CustomOrder

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
              const snapshotData = snapshot.val()
              console.log('Snapshot data:', snapshotData)
              
              const orderIds = Object.keys(snapshotData)
              console.log('Found order IDs:', orderIds)
              
              const orderPromises = orderIds.map(async (orderId) => {
                try {
                  // Get the order reference info to determine the type
                  const orderRefInfo = snapshotData[orderId]
                  console.log(`Order reference info for ${orderId}:`, orderRefInfo)
                  
                  // Determine order type - default to non-custom if not specified
                  const orderType = orderRefInfo.type || orderRefInfo.orderType || 'non-custom'
                  console.log(`Order ${orderId} type:`, orderType)
                  
                  const orderRef = dbRef(database, `orders/${orderId}`)
                  console.log('Fetching order from path:', `orders/${orderId}`)
                  
                  const orderSnapshot = await get(orderRef)
                  
                  if (orderSnapshot.exists()) {
                    const orderData = orderSnapshot.val()
                    console.log(`Order ${orderId} data:`, orderData)
                    return orderData
                  } else {
                    console.warn(`Order ${orderId} not found in ${orderType} orders`)
                    
                    // Try the opposite type as a fallback
                    const fallbackType = orderType === 'non-custom' ? 'custom' : 'non-custom'
                    console.log(`Trying fallback type: ${fallbackType}`)
                    
                    const fallbackRef = dbRef(database, `orders/${fallbackType}/${orderId}`)
                    const fallbackSnapshot = await get(fallbackRef)
                    
                    if (fallbackSnapshot.exists()) {
                      const fallbackData = fallbackSnapshot.val()
                      console.log(`Found order in fallback location: ${fallbackType}`)
                      return fallbackData
                    }
                    
                    console.error(`Order ${orderId} does not exist in any known location`)
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
                orders.value = validOrders
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