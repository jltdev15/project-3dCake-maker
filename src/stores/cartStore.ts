import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { database, ref as dbRef, set, get, remove, update, push, onValue, off } from '../config/firebase'
import { useAuthStore } from './authStore'
import { useOrderStore } from './orderStore'
import { toastController } from '@ionic/vue'

interface CartItem {
  id: string
  cakeId: string
  name: string
  size?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  imageUrl: string
}

interface Order {
  orderId: string
  userId: string
  customerName: string
  items: CartItem[]
  totalAmount: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: number
  type: 'non-custom'
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const authStore = useAuthStore()
  let userStatusUnsubscribe: (() => void) | null = null

  const checkUserStatus = async () => {
    if (!authStore.user?.uid) return false

    try {
      const userRef = dbRef(database, `users/${authStore.user.uid}`)
      const snapshot = await get(userRef)
      if (snapshot.exists()) {
        const userData = snapshot.val()
        return userData.status === 'active'
      }
      return false
    } catch (error) {
      console.error('Error checking user status:', error)
      return false
    }
  }

  const setupUserStatusListener = () => {
    if (!authStore.user?.uid) return

    const userRef = dbRef(database, `users/${authStore.user.uid}`)
    userStatusUnsubscribe = onValue(userRef, async (snapshot) => {
      if (snapshot.exists() && authStore.user?.uid) {
        const userData = snapshot.val()
        if (userData.status !== 'active' && items.value.length > 0) {
          // Clear cart if user is blocked and has items
          items.value = []
          const cartRef = dbRef(database, `users/${authStore.user.uid}/cart`)
          await remove(cartRef)
          
          const toast = await toastController.create({
            message: 'Your account has been blocked. Cart has been cleared.',
            duration: 3000,
            position: 'top',
            color: 'danger'
          })
          await toast.present()
        }
      }
    })
  }

  const loadCartItems = async () => {
    if (!authStore.user?.uid) return
    
    try {
      const cartRef = dbRef(database, `users/${authStore.user.uid}/cart`)
      const snapshot = await get(cartRef)
      if (snapshot.exists()) {
        items.value = Object.values(snapshot.val())
      } else {
        items.value = []
      }
    } catch (error) {
      console.error('Error loading cart items:', error)
      items.value = []
    }
  }

  // Load cart items immediately if user is authenticated
  if (authStore.user?.uid) {
    loadCartItems()
    setupUserStatusListener()
  }

  const generateOrderId = async () => {
    const ordersRef = dbRef(database, 'orders/non-custom')
    const snapshot = await get(ordersRef)
    const orderCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0
    const nextNumber = orderCount + 1
    return `ord${String(nextNumber).padStart(6, '0')}`
  }

  const checkout = async () => {
    if (!authStore.user?.uid || items.value.length === 0) return null

    try {
      const orderId = await generateOrderId()
      const order: Order = {
        orderId,
        userId: authStore.user.uid,
        customerName: authStore.user.name || 'Anonymous User',
        items: items.value,
        totalAmount: cartTotal.value,
        status: 'pending',
        createdAt: Date.now(),
        type: 'non-custom'
      }

      // Save order to Firebase
      const orderRef = dbRef(database, `orders/non-custom/${orderId}`)
      await set(orderRef, order)

      // Save order reference to user's orders
      const userOrderRef = dbRef(database, `users/${authStore.user.uid}/orders/${orderId}`)
      await set(userOrderRef, {
        orderId,
        type: 'non-custom',
        status: 'pending',
        createdAt: Date.now(),
        customerName: authStore.user.name || 'Anonymous User'
      })

      // Clear the cart
      const cartRef = dbRef(database, `users/${authStore.user.uid}/cart`)
      await remove(cartRef)
      items.value = []

      // Refresh orders list
      const orderStore = useOrderStore()
      await orderStore.loadOrders()

      return orderId
    } catch (error) {
      console.error('Error during checkout:', error)
      throw error
    }
  }

  const addItem = async (item: Omit<CartItem, 'id'>) => {
    if (!authStore.user?.uid) return

    // Check if the same cake (with same size) already exists in cart
    const existingItem = items.value.find(existing => 
      existing.cakeId === item.cakeId && 
      existing.size === item.size
    );

    if (existingItem) {
      // Update quantity of existing item
      const newQuantity = existingItem.quantity + item.quantity;
      const updatedItem = {
        ...existingItem,
        quantity: newQuantity,
        totalPrice: existingItem.unitPrice * newQuantity
      };
      
      try {
        const cartRef = dbRef(database, `users/${authStore.user.uid}/cart/${existingItem.id}`);
        await update(cartRef, updatedItem);
        existingItem.quantity = newQuantity;
        existingItem.totalPrice = existingItem.unitPrice * newQuantity;
      } catch (error) {
        console.error('Error updating item quantity:', error);
      }
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        ...item,
        id: Date.now().toString()
      }
      
      try {
        const cartRef = dbRef(database, `users/${authStore.user.uid}/cart/${newItem.id}`);
        await set(cartRef, newItem);
        items.value.push(newItem);
      } catch (error) {
        console.error('Error adding item to cart:', error);
      }
    }
  }

  const removeItem = async (id: string) => {
    if (!authStore.user?.uid) return

    try {
      const cartRef = dbRef(database, `users/${authStore.user.uid}/cart/${id}`)
      await remove(cartRef)
      items.value = items.value.filter(item => item.id !== id)
    } catch (error) {
      console.error('Error removing item from cart:', error)
    }
  }

  const updateItemQuantity = async (id: string, quantity: number) => {
    if (!authStore.user?.uid) return

    const item = items.value.find(item => item.id === id)
    if (item) {
      const updatedItem = {
        ...item,
        quantity,
        totalPrice: item.unitPrice * quantity
      }
      
      try {
        const cartRef = dbRef(database, `users/${authStore.user.uid}/cart/${id}`)
        await update(cartRef, updatedItem)
        item.quantity = quantity
        item.totalPrice = item.unitPrice * quantity
      } catch (error) {
        console.error('Error updating item quantity:', error)
      }
    }
  }

  const cartTotal = computed(() => {
    return items.value.reduce((total, item) => total + item.totalPrice, 0)
  })

  const itemCount = computed(() => {
    return items.value.reduce((count, item) => count + item.quantity, 0)
  })

  const cleanup = () => {
    if (userStatusUnsubscribe) {
      userStatusUnsubscribe()
      userStatusUnsubscribe = null
    }
  }

  return {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    cartTotal,
    itemCount,
    loadCartItems,
    checkout,
    cleanup,
    checkUserStatus
  }
}) 