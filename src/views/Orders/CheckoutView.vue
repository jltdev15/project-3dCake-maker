<template>
  <ion-page class="checkout-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="toolbar-custom">
        <!-- Modern Redesigned Checkout Header -->
        <div class="relative bg-gradient-to-r from-[#F0E68D] via-[#E6D77A] to-[#DCC867] text-gray-800 shadow-xl py-2">
          <!-- Background Pattern Overlay -->
          <div class="absolute inset-0 bg-black/5 opacity-20"></div>
          <div class="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-transparent"></div>

          <!-- Main Content -->
          <div class="relative px-4 py-3 sm:px-6 sm:py-4">
            <div class="flex items-center justify-between">
              <!-- Left Side - Back Button -->
              <div class="flex items-center">
                <button @click="goBack"
                  class="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 active:scale-95 transition-all duration-200 touch-manipulation">
                  <ion-icon :icon="chevronBackOutline"
                    class="text-lg sm:text-xl text-gray-800 drop-shadow-sm group-hover:scale-110 transition-transform duration-200"></ion-icon>
                </button>
              </div>

              <!-- Center - Title Section -->
              <div class="flex-1 text-center mx-4">
                <div class="flex items-center justify-center space-x-2 sm:space-x-3">
                  <!-- Title Text -->
                  <div class="text-center">
                    <h1 class="text-lg sm:text-xl font-bold tracking-wide drop-shadow-sm text-gray-800">
                      Checkout
                    </h1>
                    <p class="text-xs sm:text-sm opacity-70 font-medium tracking-wide mt-0.5 text-gray-700">
                      Complete your order
                    </p>
                  </div>
                </div>
              </div>

              <!-- Right Side - Spacer for symmetry -->
              <div class="w-10 h-10 sm:w-12 sm:h-12"></div>
            </div>

          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="checkout-content">
      <div class="px-2 md:px-3 pt-3 pb-64">
        <!-- Order Summary Section -->
        <div class="mb-4">
          <p class="text- font-bold text-[#58091F] mb-2">Order Summary</p>
          <div class="bg-white space-y-1 border-2 border-gray-200 rounded-xl p-1">
            <div v-for="item in cartStore.items" :key="item.id"
              class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
              <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0" v-if="item.imageUrl">
                <img :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover">
              </div>
              <div class="flex-1 min-w-0">
                <h5 class="font-semibold text-gray-900 text-xs truncate">{{ item.name }}</h5>
                <p v-if="item.size" class="text-xs text-gray-600">Size: {{ item.size }}</p>
                <p v-if="item.isCustomCake" class="text-xs text-[#58091F] font-medium">Custom Design</p>
              </div>
              <div class="text-right flex-shrink-0">
                <span class="text-sm font-bold text-gray-900">x{{ item.quantity }}</span>
                <p class="text-sm text-[#58091F] font-semibold">₱{{ (item.unitPrice! * item.quantity).toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Method Section -->
        <div class="mb-4">
          <p class="text-lg font-bold text-[#58091F] mb-2">Payment Method</p>
          <div class="space-y-3">
            <!-- Cash on Delivery Option -->
            <label
              class="relative flex items-center p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#F0E68D] transition-colors group">
              <input type="radio" v-model="selectedPaymentMethod" value="cod" class="sr-only peer">
              <div class="flex-1">
                <span class="block text-lg font-semibold text-[#58091F]">Cash on Delivery</span>
                <span class="block text-sm text-gray-600">Pay when you receive your order</span>
              </div>
              <div
                class="hidden peer-checked:flex items-center justify-center w-6 h-6 bg-[#58091F] text-white rounded-full">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </label>

            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="px-2 bg-gray-100 text-sm text-gray-500">or</span>
              </div>
            </div>

            <!-- PayPal Section -->
            <div class="bg-white rounded-xl p-4 border-2 border-gray-200">
              <div v-if="cartStore.cartTotal > 0">
                <div v-if="!paypalLoaded" class="flex flex-col items-center justify-center gap-3 py-6">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p class="text-sm text-gray-600">Loading payment options...</p>
                </div>
                <div v-show="paypalLoaded">
                  <div id="paypal-button-container" class="w-full min-h-[60px]"></div>
                  <p class="text-xs text-gray-600">PayPal is a secure and convenient way to pay for your order. </p>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- Fixed Bottom Section -->
      <div class="fixed bottom-0 left-0 right-0 bg-white p-3 shadow-2xl border-t border-gray-200 z-999">
        <div class="max-w-4xl mx-auto">
          <div class="rounded-2xl p-3 mb-3">
            <div class="flex justify-between items-center py-0.5 text-sm text-[#58091F]">
              <span>Subtotal</span>
              <span class="font-semibold">₱{{ Number(cartStore.cartTotal).toFixed(2) }}</span>
            </div>
            <div
              class="flex justify-between items-center pt-1 mt-1.5 border-t border-[#58091F]/20 text-base font-bold text-[#58091F]">
              <span>Total Amount</span>
              <span>₱{{ Number(cartStore.cartTotal).toFixed(2) }}</span>
            </div>
          </div>
          <button @click="placeOrder" :disabled="!canPlaceOrder || isPlacingOrder"
            class="flex items-center justify-center gap-2 px-4 py-3 md:py-1 bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white font-bold text-lg md:text-xs uppercase tracking-wide rounded-2xl md:rounded-xl min-h-[60px] md:min-h-[32px] shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation w-full disabled:opacity-50 disabled:cursor-not-allowed">
            <div v-if="isPlacingOrder" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span v-else>Place Order</span>
          </button>
        </div>
      </div>
    </ion-content>

    <!-- Success Modal -->
    <ion-modal :is-open="showSuccessModal" :breakpoints="[0, 0.5]" :initial-breakpoint="0.5" class="success-modal">
      <div class="p-6">
        <div class="flex flex-col items-center justify-center text-center">
          <!-- Success Icon -->
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center my-4">
            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <!-- Success Message -->
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p class="text-gray-600 mb-6 text-sm">Thank you for your order. We'll process it right away.</p>

          <!-- Action Buttons -->
          <div class="flex flex-col gap-3 w-full max-w-sm">
            <button @click="goToOrders"
              class="h-12 py-3 px-4 bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white font-bold text-lg uppercase tracking-wide rounded-xl hover:shadow-lg transition-all duration-200 touch-manipulation">
              View My Orders
            </button>
            <button @click="goToHome"
              class="h-12 py-3 px-4  text-[#58091F] font-bold text-lg uppercase tracking-wide rounded-xl hover:shadow-lg transition-all duration-200 touch-manipulation">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonModal,
  toastController
} from '@ionic/vue';
// @ts-ignore - These icons are used in the template
import { 
  chevronBackOutline, 
} from 'ionicons/icons';
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { database, ref as dbRef, set, get, remove } from '../../config/firebase';
import { createPayPalOrder, capturePayPalOrder } from '@/api/paypal';

// PayPal configuration
const PAYPAL_CLIENT_ID = 'AbnTUyrjf9HNGPd041AS7o7BI1jxhhQVB6pZG6cKJvUCgUciUjH-NHGVE-4fB9OZUTEamm_vdP_p49y2';
const PAYPAL_SDK_URL = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=PHP&intent=capture&components=buttons&enable-funding=paylater,venmo&disable-funding=paylater,card`;

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

// Form data
const selectedPaymentMethod = ref('');
const isPlacingOrder = ref(false);
const paypalLoaded = ref(false);
const showSuccessModal = ref(false);

// Add new ref for PayPal instance
const paypalInstance = ref<any>(null);

// Add resetCheckoutState function after the canPlaceOrder computed property
const resetCheckoutState = () => {
  selectedPaymentMethod.value = '';
  paypalLoaded.value = false;
  if (paypalInstance.value) {
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }
    paypalInstance.value = null;
  }
};

// Computed properties
const canPlaceOrder = computed(() => {
  const conditions = {
    hasPaymentMethod: !!selectedPaymentMethod.value,
    hasItems: cartStore.items.length > 0,
    hasAddress: !!authStore.user?.address,
    hasContact: !!authStore.user?.contact
  };
  
  console.log('Place Order Button Conditions:', conditions);
  console.log('Selected Payment Method:', selectedPaymentMethod.value);
  console.log('User Address:', authStore.user?.address);
  console.log('User Contact:', authStore.user?.contact);
  
  return conditions.hasPaymentMethod && 
         conditions.hasItems && 
         conditions.hasAddress && 
         conditions.hasContact;
});

// Methods
const goBack = () => {
  router.back();
};

const generateOrderId = async () => {
  try {
    const ordersRef = dbRef(database, 'orders');
    const snapshot = await get(ordersRef);
    const orderCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    const nextNumber = orderCount + 1;
    return `ord${String(nextNumber).padStart(5, '0')}`;
  } catch (error) {
    console.error('Error generating order ID:', error);
    throw error;
  }
};

const saveAdminNotification = async (orderId: string, message: string) => {
  try {
    const notificationId = `notif_${new Date().getTime()}_${orderId}`;
    const notificationRef = dbRef(database, `admin_notifications/${notificationId}`);
    const notificationData = {
      id: notificationId,
      orderId: orderId,
      type: 'new_order',
      message: message,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    await set(notificationRef, notificationData);
    console.log('Admin notification saved for order:', orderId);
  } catch (error) {
    console.error('Error saving admin notification:', error);
    // Optionally, show a toast or log this error more formally
    // but don't let it block the main order flow
  }
};

const placeOrder = async () => {
  if (!canPlaceOrder.value || isPlacingOrder.value) return;
  
  // Validate required user information
  if (!authStore.user?.address || !authStore.user?.contact) {
    const toast = await toastController.create({
      message: 'Please update your address and contact information in your profile before placing an order.',
      duration: 3000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
    return;
  }
  
  isPlacingOrder.value = true;
  try {
    // Simulate a 2-second delay for better UX
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const orderId = await generateOrderId();
    const orderData = {
      id: orderId,
      userId: authStore.user?.uid,
      customerName: authStore.user?.name,
      customerAddress: authStore.user.address, // Ensure we use the validated address
      customerContact: authStore.user.contact, // Ensure we use the validated contact
      items: cartStore.items,
      total: cartStore.cartTotal,
      paymentMethod: selectedPaymentMethod.value,
      paymentStatus:'unpaid',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save order to Firebase
    const orderRef = dbRef(database, `orders/${orderId}`);
    await set(orderRef, orderData);

    // Save admin notification
    await saveAdminNotification(orderId, `New order ${orderId} (COD) has been placed.`);

    // Save order reference to user's data
    if (authStore.user?.uid) {
      const userOrderRef = dbRef(database, `users/${authStore.user.uid}/orders/${orderId}`);
      await set(userOrderRef, true);
      console.log(`Order reference ${orderId} saved for user ${authStore.user.uid}`);
    }

    // Clear cart in Pinia store
    cartStore.$patch({ items: [] });

    // Clear cart in Firebase
    if (authStore.user?.uid) {
      const cartRef = dbRef(database, `users/${authStore.user.uid}/cart`);
      await remove(cartRef); // Use remove() to delete the cart node
      console.log('User cart cleared from Firebase for COD order.');
    }

    // Reset checkout state
    resetCheckoutState();

    // Show success modal instead of redirecting
    showSuccessModal.value = true;

  } catch (error) {
    console.error('Error placing order:', error);
    const toast = await toastController.create({
      message: 'Error placing order. Please try again.',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  } finally {
    isPlacingOrder.value = false;
  }
};

// // Helper function to wait for element
// const waitForElement = (selector: string, timeout = 5000): Promise<HTMLElement> => {
//   return new Promise((resolve, reject) => {
//     const startTime = Date.now();
    
//     const checkElement = () => {
//       const element = document.getElementById(selector);
//       if (element) {
//         resolve(element);
//         return;
//       }
      
//       if (Date.now() - startTime >= timeout) {
//         reject(new Error(`Element ${selector} not found after ${timeout}ms`));
//         return;
//       }
      
//       requestAnimationFrame(checkElement);
//     };
    
//     checkElement();
//   });
// };

// Modify loadPayPalSDK function
const loadPayPalSDK = () => {
  return new Promise<void>((resolve, reject) => {
    // @ts-ignore - PayPal types
    if (window.paypal && window.paypal.Buttons) {
      console.log('PayPal SDK already loaded');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = PAYPAL_SDK_URL;
    script.async = true;

    script.onload = () => {
      setTimeout(() => {
        // @ts-ignore - PayPal types
        if (window.paypal && window.paypal.Buttons) {
          resolve();
        } else {
          reject(new Error('PayPal SDK not properly initialized'));
        }
      }, 200);
    };
    
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.head.appendChild(script);
  });
};

// Modify initializePayPalButtons function
const initializePayPalButtons = async () => {
  try {
    // Cleanup existing buttons if any
    if (paypalInstance.value) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
      }
    }

    // @ts-ignore - PayPal types
    const paypal = window.paypal;
    if (!paypal || !paypal.Buttons) {
      throw new Error('PayPal SDK not loaded');
    }

    paypalInstance.value = await paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'pay'
      },
      fundingSource: paypal.FUNDING.PAYPAL,
      createOrder: async () => {
        try {
          const order = await createPayPalOrder(
            cartStore.cartTotal.toFixed(2),
            'PHP',
            '3D Cake Maker Order'
          );
          return order.id;
        } catch (error) {
          console.error('Error creating PayPal order:', error);
          throw error;
        }
      },
      onApprove: async (data: any) => {
        try {
          const captureData = await capturePayPalOrder(data.orderID);
          await handleSuccessfulPayment(captureData);
        } catch (error) {
          console.error('Error capturing payment:', error);
          throw error;
        }
      },
      onError: async (err: any) => {
        console.error('PayPal error:', err);
        const toast = await toastController.create({
          message: 'An error occurred with PayPal. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });

    await paypalInstance.value.render('#paypal-button-container'); 
    paypalLoaded.value = true;
  } catch (error) {
    console.error('Error initializing PayPal buttons:', error);
    paypalLoaded.value = false;
    const toast = await toastController.create({
      message: 'Failed to initialize PayPal. Please refresh the page.',
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }
};

const handleSuccessfulPayment = async (captureData: any) => {
  try {
    // Validate required user information
    if (!authStore.user?.address || !authStore.user?.contact) {
      const toast = await toastController.create({
        message: 'Please update your address and contact information in your profile before placing an order.',
        duration: 3000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    console.log('Processing successful payment:', captureData);
    
    const orderId = await generateOrderId();
    const orderData = {
      id: orderId,
      userId: authStore.user?.uid,
      customerName: authStore.user?.name,
      customerAddress: authStore.user.address, // Use validated address
      customerContact: authStore.user.contact, // Use validated contact
      items: cartStore.items,
      total: cartStore.cartTotal,
      paymentMethod: 'paypal',
      status: 'pending',
      paymentDetails: {
        transactionId: captureData.id,
        status: captureData.status,
        amount: captureData.purchase_units[0].payments.captures[0].amount.value,
        currency: captureData.purchase_units[0].payments.captures[0].amount.currency_code,
        captureTime: captureData.purchase_units[0].payments.captures[0].create_time
      },
      paymentStatus:'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save order to Firebase
    const orderRef = dbRef(database, `orders/${orderId}`);
    await set(orderRef, orderData);

    // Save admin notification
    await saveAdminNotification(orderId, `New order ${orderId}  has been placed.`);

    // Save order reference to user's data
    if (authStore.user?.uid) {
      const userOrderRef = dbRef(database, `users/${authStore.user.uid}/orders/${orderId}`);
      await set(userOrderRef, true);
      console.log(`Order reference ${orderId} saved for user ${authStore.user.uid}`);
    }

    // Clear cart in Pinia store
    cartStore.$patch({ items: [] });

    // Clear cart in Firebase
    if (authStore.user?.uid) {
      const cartRef = dbRef(database, `users/${authStore.user.uid}/cart`);
      await remove(cartRef); // Use remove() to delete the cart node
      console.log('User cart cleared from Firebase for PayPal order.');
    }

    // Reset checkout state
    resetCheckoutState();

    // Show success modal instead of redirecting
    showSuccessModal.value = true;

  } catch (error) {
    console.error('Error processing successful payment:', error);
    const toast = await toastController.create({
      message: 'Error processing payment. Please contact support.',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

// Add navigation functions
const goToOrders = () => {
  showSuccessModal.value = false;
  router.push('/orders');
};

const goToHome = () => {
  showSuccessModal.value = false;
  router.push('/');
};

// Lifecycle
onMounted(async () => {
  if (cartStore.items.length === 0) {
    router.push('/cart');
    return;
  }

  try {
    await loadPayPalSDK();
    await initializePayPalButtons();
  } catch (error) {
    console.error('Failed to initialize PayPal:', error);
    paypalLoaded.value = false;
  }
});

onUnmounted(() => {
  // Cleanup PayPal instance
  if (paypalInstance.value) {
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }
    paypalInstance.value = null;
  }
  paypalLoaded.value = false;
});

// Add watch for cart changes
watch(() => cartStore.items.length, async (newLength) => {
  if (newLength === 0) {
    router.push('/cart');
  } else {
    // Reinitialize PayPal when cart has items
    try {
      await loadPayPalSDK();
      await initializePayPalButtons();
    } catch (error) {
      console.error('Failed to reinitialize PayPal:', error);
    }
  }
});
</script>

<style scoped>
.checkout-page {
  --background: #f8f9fa;
}

.checkout-content {
  --background: #f8f9fa;
}

.toolbar-custom {
  --background: transparent;
  --border-width: 0;
}

.payment-option {
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-option:hover {
  border-color: #F0E68D;
  background: #fefefe;
}

.payment-option:has(input:checked) {
  border-color: #58091F;
  background: rgba(240, 230, 141, 0.1);
  box-shadow: 0 4px 12px rgba(88, 9, 31, 0.1);
}

.payment-option:has(input:checked)::after {
  content: '✓';
  position: absolute;
  top: 12px;
  right: 12px;
  background: #58091F;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.success-modal {
  --border-radius: 16px;
  --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style> 