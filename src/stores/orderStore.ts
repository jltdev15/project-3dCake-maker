import { defineStore } from 'pinia'
import { ref } from 'vue'
import { database, ref as dbRef, onValue, get } from '../config/firebase'
import { useAuthStore } from './authStore'

// Type definitions from OrdersView.vue (or compatible versions)
interface BaseOrder {
  orderId: string;
  userId: string;
  customerName?: string; // Made optional
  customerEmail?: string; // Made optional
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number; 
  updatedAt?: number; // Added, as it's in Firebase data
}

interface NonCustomOrderItems {
  cakeId?: string;
  id?: string; // Item's own ID
  imageUrl: string;
  name?: string;
  quantity?: number;
  totalPrice?: number;
  unitPrice?: number;
  isCustomCake?: boolean; // From Firebase item
  [key: string]: any; 
}

interface NonCustomOrder extends BaseOrder {
  orderType: 'non-custom';
  totalAmount: number; 
  items: NonCustomOrderItems[];
}

// Define structure for items within a CustomOrder in Firebase
interface CustomOrderItem {
  cakeId?: string;
  id?: string;
  customDetails?: { // Based on your Firebase data example
    id?: string;
    imageUrl?: string;
    [key: string]: any; // To allow other custom details
  };
  imageUrl?: string; // Assuming image might be on the item level too
  isCustomCake?: boolean;
  name?: string;
  quantity?: number;
  size?: string; // Added based on your example
  totalPrice?: number;
  unitPrice?: number;
  [key: string]: any; // To allow other potential fields on custom order items
}

interface CustomOrder extends BaseOrder {
  orderType: 'custom';
  totalAmount?: number; 
  // updatedAt is in BaseOrder now
  designUrl?: string; 
  imageUrl?: string;   // Order-level image for custom designs
  items: CustomOrderItem[]; // Changed to array of CustomOrderItem
}

type Order = NonCustomOrder | CustomOrder;

// Original PaymentDetails, if needed elsewhere or as part of a richer Order type not fully used by OrdersView
interface PaymentDetails {
  amount: number;
  createdAt: string; // Consider if this should be number too
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
}
// If PaymentDetails are part of the Firebase data for an order, 
// they should be added to BaseOrder, CustomOrder, or NonCustomOrder interfaces if used.
// For now, it's not in OrdersView.vue's Order type.

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const authStore = useAuthStore()
  let unsubscribe: (() => void) | null = null

  const loadOrders = () => {
    console.log('Loading orders...')
    console.log('Current user:', JSON.stringify(authStore.user, null, 2))
    
    if (!authStore.user?.uid) {
      console.log('No user ID available, cannot load orders')
      orders.value = [];
      return Promise.resolve([])
    }

    const uid = authStore.user.uid
    
    return new Promise((resolve) => {
      try {
        const userOrdersRef = dbRef(database, `users/${uid}/orders`)
        console.log('User orders reference path:', `users/${uid}/orders`)
        
        if (unsubscribe) {
          console.log('Cleaning up previous listener')
          unsubscribe()
        }

        unsubscribe = onValue(userOrdersRef, async (snapshot) => {
          console.log('User orders snapshot received:', snapshot.exists() ? 'exists' : 'does not exist')
          
          if (snapshot.exists()) {
            try {
              const userOrdersData = snapshot.val()
              console.log('Raw userOrdersData from Firebase:', userOrdersData, 'Is Array:', Array.isArray(userOrdersData));
              const orderIds = Object.keys(userOrdersData);
              console.log('Processed orderIds (should be an array of strings):', orderIds, 'Is Array:', Array.isArray(orderIds));
              
              if (!orderIds || orderIds.length === 0) {
                console.log('No order IDs found for the user.')
                orders.value = []
                resolve([])
                return
              }
              
              const orderPromises = orderIds.map(async (orderId) => {
                try {
                  const orderRef = dbRef(database, `orders/${orderId}`)
                  const orderSnapshot = await get(orderRef)
                  
                  if (orderSnapshot.exists()) {
                    const rawOrderData = orderSnapshot.val()
                    console.log(`Raw data for order ${orderId}:`, rawOrderData)

                    // Transform rawOrderData to the Order type
                    let transformedOrder: Order | null = null;

                    // Common properties
                    const baseData: Omit<BaseOrder, 'orderId' | 'createdAt' | 'status' | 'userId' | 'orderType'> & { // Omit properties that will be specifically set or are part of discriminated union
                        orderId: string;
                        userId: string;
                        status: 'pending' | 'accepted' | 'declined';
                        createdAt: number;
                        updatedAt?: number;
                        customerName?: string; // Not in firebase data
                        customerEmail?: string; // Not in firebase data
                    } = {
                        orderId: rawOrderData.id || orderId, // Use rawOrderData.id if present, else fallback to key
                        userId: rawOrderData.userId,
                        status: rawOrderData.status,
                        createdAt: new Date(rawOrderData.createdAt).getTime(),
                        updatedAt: rawOrderData.updatedAt ? new Date(rawOrderData.updatedAt).getTime() : undefined,
                        // customerName and customerEmail are not in the provided Firebase order structure
                    };

                    const totalAmount = rawOrderData.total;
                    const firebaseItems = rawOrderData.items;

                    // Determine orderType, defaulting to non-custom
                    // This logic might need to be more robust based on your data rules.
                    let isOrderCustom = false;
                    if (Array.isArray(firebaseItems) && firebaseItems.length > 0 && firebaseItems[0].isCustomCake === true) {
                        isOrderCustom = true;
                    }
                    // Add other conditions if 'isCustomCake' isn't the sole determinant or is on the order root.

                    if (isOrderCustom) {
                        // Logic for CustomOrder
                        // Assuming firebaseItems for custom orders is also an array
                        let customItemsArray: CustomOrderItem[] = [];
                        if (Array.isArray(firebaseItems)) {
                             customItemsArray = firebaseItems.map((item: any) => ({
                                cakeId: item.cakeId,
                                id: item.id,
                                customDetails: item.customDetails, // Map customDetails object
                                imageUrl: item.imageUrl, // Map item-level imageUrl
                                isCustomCake: item.isCustomCake,
                                name: item.name,
                                quantity: item.quantity,
                                size: item.size, // Map size
                                totalPrice: item.totalPrice,
                                unitPrice: item.unitPrice,
                                // Spread any other properties from the firebase item
                                ...Object.keys(item).reduce((acc: { [key: string]: any }, key) => {
                                  if (!['cakeId', 'id', 'customDetails', 'imageUrl', 'isCustomCake', 'name', 'quantity', 'size', 'totalPrice', 'unitPrice'].includes(key)) {
                                    acc[key] = item[key];
                                  }
                                  return acc;
                                }, {}),
                            }));
                        }
                        
                        transformedOrder = {
                            ...baseData,
                            orderType: 'custom',
                            totalAmount: totalAmount, 
                            designUrl: rawOrderData.designUrl, 
                            imageUrl: rawOrderData.imageUrl,   
                            items: customItemsArray, // Assign the mapped array
                        } as CustomOrder; // Type assertion
                    } else {
                        // Logic for NonCustomOrder
                        transformedOrder = {
                            ...baseData,
                            orderType: 'non-custom',
                            totalAmount: totalAmount,
                            items: firebaseItems.map((item: any) => ({ // Map Firebase items to NonCustomOrderItems
                                cakeId: item.cakeId,
                                id: item.id,
                                imageUrl: item.imageUrl,
                                name: item.name,
                                quantity: item.quantity,
                                totalPrice: item.totalPrice,
                                unitPrice: item.unitPrice,
                                isCustomCake: item.isCustomCake,
                            })),
                        } as NonCustomOrder; // Type assertion
                    }
                    console.log(`Transformed order ${orderId}:`, transformedOrder);
                    return transformedOrder;
                  } else {
                    console.warn(`Order ${orderId} not found in 'orders' collection`)
                    return null
                  }
                } catch (error) {
                  console.error(`Error fetching or transforming order ${orderId}:`, error)
                  return null
                }
              })
              
              try {
                const resolvedOrders = await Promise.all(orderPromises)
                const validOrders = resolvedOrders.filter(order => order !== null) as Order[]
                console.log('Valid orders count:', validOrders.length)
                
                orders.value = validOrders.sort((a, b) => b.createdAt - a.createdAt)
                console.log('Final orders array (sorted):', JSON.parse(JSON.stringify(orders.value))) // Deep copy for logging
                resolve(orders.value)
              } catch (error) {
                console.error('Error processing order promises:', error)
                orders.value = []
                resolve([])
              }
            } catch (error) {
              console.error('Error processing user orders snapshot:', error)
              orders.value = []
              resolve([])
            }
          } else {
            console.log('No orders found for this user in snapshot')
            orders.value = []
            resolve([])
          }
        }, (error) => {
          console.error('Error in user orders listener:', error)
          orders.value = []
          resolve([])
        })
      } catch (error) {
        console.error('Error setting up user orders listener:', error)
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