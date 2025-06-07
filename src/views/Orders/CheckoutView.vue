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

            <!-- Order Summary Indicator -->
            <div class="mt-3 pt-3 border-t border-black/20">
              <div class="flex items-center justify-between text-xs sm:text-sm">
                <div class="flex items-center space-x-1 text-gray-700/80">
                  <ion-icon :icon="cartOutline" class="text-xs"></ion-icon>
                  <span>{{ cartStore.items.length }} Item{{ cartStore.items.length !== 1 ? 's' : '' }}</span>
                </div>
                <div class="flex items-center space-x-1 text-gray-700/80">
                  <ion-icon :icon="pricetagOutline" class="text-xs"></ion-icon>
                  <span class="font-bold">₱{{ Number(cartStore.cartTotal).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="checkout-content">
      <div class="px-2 md:px-3 pt-3 pb-64">
        <!-- Order Summary Section -->
        <div class="mb-4">
          <h2 class="text-base font-bold text-[#58091F] mb-2">Order Summary</h2>
          <div class="space-y-1">
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
          <p class="text-xl font-bold text-[#58091F] mb-2">Payment Method</p>
          <div class="space-y-2">
            <!-- Cash on Delivery Option -->
            <div class="mb-2">
              <label class="payment-option">
                <input type="radio" v-model="selectedPaymentMethod" value="cod"
                  class="absolute opacity-0 pointer-events-none">
                <div class="flex items-center gap-4 w-full">

                  <div class="flex-1">
                    <span class="block text-xl font-semibold text-[#58091F]">Cash on Delivery</span>
                    <span class="block text-xs text-gray-600">Pay when you receive your order</span>
                  </div>
                </div>
              </label>
            </div>
            <div class="border-t border-gray-300 my-2 w-2/3 mx-auto"></div>
            <div class="w-full p-1 bg-gray-100 rounded-xl">
              <div v-if="cartStore.cartTotal > 0">
                <div v-if="!paypalLoaded" class="flex flex-col items-center justify-center gap-3 py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p class="text-center text-gray-600">Loading payment options...</p>
                </div>
                <div id="paypal-button-container" class="w-full min-h-[60px]"></div>
              </div>

              <div v-else class="flex items-center justify-center py-8">
                <p class="text-center text-gray-600">Add items to cart to enable PayPal payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fixed Bottom Section -->
      <div class="fixed bottom-0 left-0 right-0 bg-white p-3 shadow-2xl border-t border-gray-200 z-999">
        <div class="max-w-4xl mx-auto">
          <div class="bg-[#F0E68D] rounded-2xl p-3 mb-3">
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
            class="flex items-center justify-center gap-2 px-4 py-1 md:py-1 bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white font-bold text-sm md:text-xs uppercase tracking-wide rounded-2xl md:rounded-xl min-h-[40px] md:min-h-[32px] shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation w-full disabled:opacity-50 disabled:cursor-not-allowed">
            <div v-if="isPlacingOrder" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span v-else>Place Order</span>
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  toastController
} from '@ionic/vue';
// @ts-ignore - These icons are used in the template
import { 
  chevronBackOutline, 
  cartOutline, 
  pricetagOutline, 
  cashOutline 
} from 'ionicons/icons';
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
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

const resetCheckoutState = () => {
  selectedPaymentMethod.value = '';
  // paypalLoaded.value = false; // Consider if this is needed or handled by navigation/re-init
  console.log('Checkout state reset');
};

// Computed properties
const canPlaceOrder = computed(() => {
  return selectedPaymentMethod.value && 
         cartStore.items.length > 0;
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
  if (!canPlaceOrder.value) return;

  isPlacingOrder.value = true;
  
  try {
    const orderId = await generateOrderId();
    const orderData = {
      id: orderId,
      userId: authStore.user?.uid,
      customerName: authStore.user?.name,
      items: cartStore.items,
      total: cartStore.cartTotal,
      paymentMethod: selectedPaymentMethod.value,
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

    // Show success message
    const toast = await toastController.create({
      message: 'Order placed successfully!',
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    // Reset local component state
    resetCheckoutState();

    // Navigate to orders page
    router.push('/orders');

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

// Helper function to wait for element
const waitForElement = (selector: string, timeout = 5000): Promise<HTMLElement> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      const element = document.getElementById(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      if (Date.now() - startTime >= timeout) {
        reject(new Error(`Element ${selector} not found after ${timeout}ms`));
        return;
      }
      
      requestAnimationFrame(checkElement);
    };
    
    checkElement();
  });
};

// Add PayPal SDK loading function
const loadPayPalSDK = () => {
  return new Promise<void>((resolve, reject) => {
    // @ts-ignore - PayPal types
    if (window.paypal && window.paypal.Buttons) {
      console.log('PayPal SDK and Buttons component already available. Resolving.');
      resolve();
      return;
    }

    console.log('PayPal SDK not fully ready or not loaded. Proceeding with dynamic load/reload attempt.');

    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existingScript) {
      console.log('Removing existing PayPal SDK script tag before attempting new load.');
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = PAYPAL_SDK_URL;
    script.async = true;
    console.log(`Attempting to dynamically load PayPal SDK from: ${PAYPAL_SDK_URL}`);

    script.onload = () => {
      console.log('PayPal SDK script.onload event triggered.');
      // Add a small delay to ensure SDK is fully initialized on the window object
      setTimeout(() => {
        // @ts-ignore - PayPal types
        if (window.paypal && window.paypal.Buttons) {
          console.log('PayPal SDK and Buttons component confirmed available after dynamic load and delay.');
          resolve();
        } else {
          console.error('PayPal SDK script loaded, but window.paypal or window.paypal.Buttons not available after delay.');
          reject(new Error('PayPal Buttons component not available after dynamic script load.'));
        }
      }, 200); // 200ms delay, can be adjusted
    };
    
    script.onerror = (error) => {
      console.error('Failed to load PayPal SDK script dynamically (script.onerror):', error);
      reject(new Error('Failed to load PayPal SDK (script.onerror).'));
    };

    document.head.appendChild(script);
    console.log('Appended new PayPal SDK script to document head.');
  });
};

const initializePayPalButtons = async () => {
  try {
    console.log('Initializing PayPal buttons...');
    // @ts-ignore - PayPal types
    const paypal = window.paypal;
    
    if (!paypal || !paypal.Buttons) {
      throw new Error('PayPal SDK not loaded or Buttons component missing');
    }

    // Remove any existing buttons
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
      
      // Enhanced Debugging: Log container state
      const styles = window.getComputedStyle(container);
      console.log('PayPal Container State before render:', {
        id: container.id,
        exists: true,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        display: styles.display,
        visibility: styles.visibility,
        innerHTML: container.innerHTML,
        // Check parent visibility too, if possible (simplified check)
        parentVisible: container.parentElement ? window.getComputedStyle(container.parentElement).display !== 'none' : 'N/A'
      });

      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('PayPal container has zero dimensions. Buttons may not render correctly or be invisible.');
      }
      if (styles.display === 'none' || styles.visibility === 'hidden') {
        console.warn('PayPal container is not visible (display: none or visibility: hidden). Buttons may not render.');
      }

    } else {
      console.error('PayPal button container #paypal-button-container not found in DOM for rendering.');
      throw new Error('PayPal button container #paypal-button-container not found in DOM for rendering.');
    }

    // Create PayPal buttons
    await paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'pay'
      },
      fundingSource: paypal.FUNDING.PAYPAL,
      createOrder: async () => {
        try {
          console.log('Creating PayPal order...');
          const order = await createPayPalOrder(
            cartStore.cartTotal.toFixed(2),
            'PHP',
            '3D Cake Maker Order'
          );
          console.log('PayPal order created:', order);
          return order.id;
        } catch (error) {
          console.error('Error creating PayPal order:', error);
          throw error;
        }
      },
      onApprove: async (data: any) => {
        try {
          console.log('Payment approved:', data);
          const captureData = await capturePayPalOrder(data.orderID);
          console.log('Payment captured:', captureData);
          
          // Handle successful payment
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
      },
      onCancel: () => {
        console.log('Payment cancelled');
      }
    }).render('#paypal-button-container');

    console.log('PayPal buttons initialized successfully');
    paypalLoaded.value = true;
  } catch (error) {
    console.error('Error initializing PayPal buttons:', error);
    paypalLoaded.value = false;
    const toast = await toastController.create({
      message: 'Failed to initialize PayPal. Please refresh the page and try again.',
      duration: 5000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }
};

const handleSuccessfulPayment = async (captureData: any) => {
  try {
    console.log('Processing successful payment:', captureData);
    
    const orderId = await generateOrderId();
    const orderData = {
      id: orderId,
      userId: authStore.user?.uid,
      items: cartStore.items,
      total: cartStore.cartTotal,
      paymentMethod: 'paypal',
      status: 'paid',
      paymentDetails: {
        transactionId: captureData.id,
        status: captureData.status,
        amount: captureData.purchase_units[0].payments.captures[0].amount.value,
        currency: captureData.purchase_units[0].payments.captures[0].amount.currency_code,
        captureTime: captureData.purchase_units[0].payments.captures[0].create_time
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save order to Firebase
    const orderRef = dbRef(database, `orders/${orderId}`);
    await set(orderRef, orderData);

    // Save admin notification
    await saveAdminNotification(orderId, `New order ${orderId} (PayPal) has been placed.`);

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

    // Show success message
    const toast = await toastController.create({
      message: 'Order placed successfully!',
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    // Reset local component state
    resetCheckoutState();

    // Navigate to orders page
    router.push('/orders');

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

// Lifecycle
onMounted(async () => {
  // Check if cart is empty, redirect to cart page
  if (cartStore.items.length === 0) {
    router.push('/cart');
    return;
  }

  // Load user data if available
  if (authStore.user) {
    // You can pre-fill delivery address and contact from user profile
    // deliveryAddress.value = authStore.user.address || '';
    // contactNumber.value = authStore.user.phone || '';
  }

  // Initialize PayPal
  try {
    await loadPayPalSDK();
    await nextTick();
    await waitForElement('paypal-button-container');
    await new Promise(resolve => setTimeout(resolve, 200));
    await initializePayPalButtons();
  } catch (error) {
    console.error('Failed to initialize PayPal setup in onMounted:', error);
    paypalLoaded.value = false;
    const toast = await toastController.create({
        message: 'Payment system could not be loaded. Please check connection and refresh.',
        duration: 5000,
        color: 'danger',
        position: 'top'
    });
    await toast.present();
  }
});

onUnmounted(() => {
  // Cleanup PayPal if needed
});

// Watch for cart changes
watch(() => cartStore.items.length, (newLength) => {
  if (newLength === 0) {
    router.push('/cart');
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
</style> 