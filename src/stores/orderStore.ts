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

// Update interfaces to match the actual data structure
interface Topping {
  name: string;
  count: number;
  totalPrice: number;
  unitPrice: number;
}

interface DesignData {
  flavor?: string;
  layers?: number;
  message?: string;
}

interface CustomDetails {
  baseCakePrice: number;
  designData: DesignData;
}

interface CustomOrderItem {
  cakeId: string;
  id?: string;
  customDetails: CustomDetails;
  imageUrl?: string;
  isCustomCake: boolean;
  name: string;
  quantity: number;
  size?: string;
  totalPrice?: number;
  unitPrice?: number;
}

interface CustomOrder extends BaseOrder {
  orderType: 'custom';
  totalAmount?: number;
  designUrl?: string;
  imageUrl?: string;
  items: CustomOrderItem[];
}

type Order = NonCustomOrder | CustomOrder;

// Original PaymentDetails, if needed elsewhere or as part of a richer Order type not fully used by OrdersView
// interface PaymentDetails {
//   amount: number;
//   createdAt: string; // Consider if this should be number too
//   currency: string;
//   status: 'pending' | 'completed' | 'failed';
//   paymentMethod: string;
// }
// If PaymentDetails are part of the Firebase data for an order, 
// they should be added to BaseOrder, CustomOrder, or NonCustomOrder interfaces if used.
// For now, it's not in OrdersView.vue's Order type.

// Add new interface for topping list
// interface OrderTopping {
//   name: string;
//   count: number;
//   totalPrice: number;
//   unitPrice: number;
// }

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const authStore = useAuthStore()
  let unsubscribe: (() => void) | null = null

  const loadOrders = () => {
    if (!authStore.user?.uid) {
      orders.value = [];
      return Promise.resolve([])
    }

    const uid = authStore.user.uid
    
    return new Promise((resolve) => {
      try {
        const userOrdersRef = dbRef(database, `users/${uid}/orders`)
        
        if (unsubscribe) {
          unsubscribe()
        }

        unsubscribe = onValue(userOrdersRef, async (snapshot) => {
          if (snapshot.exists()) {
            try {
              const userOrdersData = snapshot.val()
              const orderIds = Object.keys(userOrdersData);
              
              if (!orderIds || orderIds.length === 0) {
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

                    // Transform rawOrderData to the Order type
                    let transformedOrder: Order | null = null;

                    // Common properties
                    const baseData: Omit<BaseOrder, 'orderId' | 'createdAt' | 'status' | 'userId' | 'orderType'> & {
                        orderId: string;
                        userId: string;
                        status: 'pending' | 'accepted' | 'declined';
                        createdAt: number;
                        updatedAt?: number;
                        customerName?: string;
                        customerEmail?: string;
                    } = {
                        orderId: rawOrderData.id || orderId,
                        userId: rawOrderData.userId,
                        status: rawOrderData.status,
                        createdAt: new Date(rawOrderData.createdAt).getTime(),
                        updatedAt: rawOrderData.updatedAt ? new Date(rawOrderData.updatedAt).getTime() : undefined,
                    };

                    const totalAmount = rawOrderData.total;
                    const firebaseItems = rawOrderData.items;

                    let isOrderCustom = false;
                    if (Array.isArray(firebaseItems) && firebaseItems.length > 0 && firebaseItems[0].isCustomCake === true) {
                        isOrderCustom = true;
                    }

                    if (isOrderCustom) {
                        let customItemsArray: CustomOrderItem[] = [];
                        if (Array.isArray(firebaseItems)) {
                            customItemsArray = firebaseItems.map((item: any) => {
                                const customDetails = {
                                    baseCakePrice: item.customDetails?.baseCakePrice || 0,
                                    designData: {
                                        flavor: item.customDetails?.designData?.flavor,
                                        layers: item.customDetails?.designData?.layers || 1,
                                        message: item.customDetails?.designData?.message || ''
                                    }
                                };
                                
                                return {
                                    cakeId: item.cakeId,
                                    id: item.id,
                                    customDetails: customDetails,
                                    imageUrl: item.imageUrl,
                                    isCustomCake: item.isCustomCake,
                                    name: item.name,
                                    quantity: item.quantity,
                                    size: item.size,
                                    totalPrice: item.totalPrice,
                                    unitPrice: item.unitPrice
                                };
                            });
                        }
                        
                        transformedOrder = {
                            ...baseData,
                            orderType: 'custom',
                            totalAmount: totalAmount, 
                            designUrl: rawOrderData.designUrl, 
                            imageUrl: rawOrderData.imageUrl,   
                            items: customItemsArray,
                        } as CustomOrder;
                    } else {
                        transformedOrder = {
                            ...baseData,
                            orderType: 'non-custom',
                            totalAmount: totalAmount,
                            items: firebaseItems.map((item: any) => ({
                                cakeId: item.cakeId,
                                id: item.id,
                                imageUrl: item.imageUrl,
                                name: item.name,
                                quantity: item.quantity,
                                totalPrice: item.totalPrice,
                                unitPrice: item.unitPrice,
                                isCustomCake: item.isCustomCake,
                                customDetails: item.customDetails
                            })),
                        } as NonCustomOrder;
                    }
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
                orders.value = validOrders.sort((a, b) => b.createdAt - a.createdAt)
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
      unsubscribe()
      unsubscribe = null
    }
  }

  // Load orders immediately if user is authenticated
  if (authStore.user?.uid) {
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