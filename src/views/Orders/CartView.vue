<template>
  <ion-page class="cart-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="cart-title">Cake Cart</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="cart-container px-2">
        <div v-if="cartStore.items.length === 0" class="empty-cart">
          <div class="empty-cart-content">
            <ion-icon :icon="cartOutline" class="empty-cart-icon"></ion-icon>
            <h2 class="empty-cart-title">Your cart is empty</h2>
            <p class="empty-cart-subtitle">Start adding some delicious cakes to your cart</p>
            <ion-button router-link="/home" class="start-shopping-btn" fill="solid">
              Start Shopping
              <ion-icon :icon="arrowForward" slot="end"></ion-icon>
            </ion-button>
          </div>
        </div>

        <template v-else>
          <!-- <div class="cart-header">
            <h2 class="cart-items-title">Cart Items</h2>
            <p class="cart-items-subtitle">{{ cartStore.itemCount }} items in your cart</p>
          </div> -->

          <div class="cart-items">
            <ion-item-sliding v-for="item in cartStore.items" :key="item.id">
              <ion-item class="cart-item">
                <div v-if="item.imageUrl" class="item-image p-2 rounded-lg mr-3">
                  <img :src="item.imageUrl" :alt="item.name" class="w-full p-1 rounded-lg">
              </div>
                <div class="item-details ">
                <h3 class="item-name">{{ item.name }}</h3>
                <p v-if="item.size" class="item-size">Size: {{ item.size }}</p>
                <p v-if="(item as CartItem).isCustomCake" class="item-custom-badge">Custom Design</p>
                <p v-if="!(item as CartItem).isCustomCake" class="item-price">₱{{ item.unitPrice?.toFixed(2) || '0.00' }} each</p>
                <p v-if="!(item as CartItem).isCustomCake" class="item-price-pending">Price to be determined</p>
              </div>
              <div class="item-controls">
                <div class="quantity-controls">
                  <ion-button fill="outline" @click="updateItemQuantity(item.id, item.quantity - 1)"
                    :disabled="item.quantity <= 1">
                    <ion-icon :icon="removeOutline"></ion-icon>
                  </ion-button>
                  <span class="quantity-value">{{ item.quantity }}</span>
                  <ion-button fill="outline" @click="updateItemQuantity(item.id, item.quantity + 1)">
                    <ion-icon :icon="addOutline"></ion-icon>
                  </ion-button>
                </div>
              </div>
              </ion-item>

              <ion-item-options side="end">
                <ion-item-option color="danger" @click="confirmRemoveItem(item.id)">
                  <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          </div>

          <div class="cart-summary">
            <div class="summary-header">
              <h3>Order Summary</h3>
            </div>
            <div class="summary-content">
              <div class="summary-item">
                <span>Total Items</span>
                <span class="summary-value">{{ cartStore.itemCount }}</span>
              </div>
              <div class="summary-item total">
                <span>Sub Total</span>
                <span class="total-price">
                  <template v-if="hasCustomItemsOnly">Price to be determined</template>
                  <template v-else>₱{{ cartStore.cartTotal?.toFixed(2) || '0.00' }}</template>
                </span>
              </div>
            </div>
            <ion-button expand="block" class="checkout-btn" @click="handleCheckout" :disabled="isCheckingOut">
              <ion-spinner v-if="isCheckingOut" name="dots"></ion-spinner>
              <span v-else>Proceed to Checkout</span>
            </ion-button>
          </div>
        </template>
      </div>

      <ion-alert :is-open="showDeleteAlert" header="Remove Item"
        message="Are you sure you want to remove this item from your cart?" :cssClass="'custom-alert'" :buttons="[
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'alert-button-cancel'
          },
          {
            text: 'Remove',
            role: 'destructive',
            cssClass: 'bg-red-700',
            handler: removeItem
          }
        ]" @didDismiss="showDeleteAlert = false"></ion-alert>

      <!-- Success Modal -->
      <div v-if="showSuccessModal" class="custom-success-modal">
        <div class="custom-modal-overlay" @click="handleSuccessModalDismiss"></div>
        <div class="custom-modal-content">
          <div class="custom-modal-body">
            <div class="success-icon-container">
              <ion-icon :icon="checkmarkCircle" class="success-icon"></ion-icon>
            </div>
            <h2 class="success-title">Order Placed Successfully!</h2>
            <p class="success-message">
              <template v-if="hasCustomItemsOnly">
                Thank you for your custom cake order. We'll review your design and provide pricing soon.
              </template>
              <template v-else-if="cartStore.items.some(item => (item as CartItem).isCustomCake)">
                Thank you for your order. We'll process standard items right away and provide pricing for your custom cake(s) soon.
              </template>
              <template v-else>
                Thank you for your order. We'll process it right away.
              </template>
            </p>
            <button class="custom-success-button" @click="handleSuccessModalDismiss">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <!-- Checkout Modal -->
      <ion-modal :is-open="showCheckoutModal" @didDismiss="showCheckoutModal = false" class="checkout-modal">
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-title>Checkout</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showCheckoutModal = false">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <div class="pt-24">
            <!-- Order Summary Section -->
            <div class="checkout-section">
              <h2 class="section-title">Order Summary</h2>
              <div class="order-items">
                <div v-for="item in cartStore.items" :key="item.id" class="order-item">
                  <div class="order-item-image" v-if="item.imageUrl">
                    <img :src="item.imageUrl" :alt="item.name">
                  </div>
                  <div class="order-item-details">
                    <h3 class="order-item-name">{{ item.name }}</h3>
                    <p v-if="item.size" class="order-item-size">Size: {{ item.size }}</p>
                    <p v-if="(item as CartItem).isCustomCake" class="order-item-custom">Custom Design</p>
                  </div>
                  <div class="order-item-quantity">
                    <span class="quantity">x{{ item.quantity }}</span>
                    <span v-if="!(item as CartItem).isCustomCake" class="price">
                      ₱{{ ((item.unitPrice || 0) * item.quantity).toFixed(2) }}
                    </span>
                    <span v-else class="price-pending">Price pending</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Method Section -->
            <div class="checkout-section">
              <h2 class="section-title">Payment Method</h2>
              <div class="payment-options">
                <ion-radio-group v-model="selectedPaymentMethod">
                  <ion-item class="payment-option">
                    <ion-radio value="cod" label-placement="end" justify="start">
                      <div class="payment-option-content">
                        <ion-icon :icon="cashOutline" class="payment-icon"></ion-icon>
                        <div class="payment-details">
                          <span class="payment-title">Cash on Delivery</span>
                          <span class="payment-description">Pay when you receive your order</span>
                        </div>
                      </div>
                    </ion-radio>
                  </ion-item>

                  <ion-item class="payment-option paypal-option">
                    <div class="paypal-container">
                      <div v-if="showCheckoutModal && cartStore.cartTotal > 0" id="paypal-button-container" class="w-full" style="min-height: 150px;">
                        <div v-if="!paypalLoaded" class="paypal-loading">
                          <ion-spinner name="dots"></ion-spinner>
                          <p>Loading payment options...</p>
                        </div>
                      </div>
                      <div v-else-if="showCheckoutModal && cartStore.cartTotal <= 0" class="paypal-disabled">
                        <p>Add items to cart to enable PayPal payment</p>
                      </div>
                    </div>
                  </ion-item>
                </ion-radio-group>
              </div>
            </div>

            <!-- Bottom Spacer -->
            <div class="bottom-spacer"></div>
          </div>

          <!-- Fixed Bottom Section -->
          <div class="checkout-bottom-section">
            <div class="total-section">
              <div class="total-row">
                <span>Subtotal</span>
                <span class="total-amount">
                  <template v-if="hasCustomItemsOnly">Price to be determined</template>
                  <template v-else>₱{{ cartStore.cartTotal?.toFixed(2) || '0.00' }}</template>
                </span>
              </div>
              <div class="total-row grand-total">
                <span>Total Amount</span>
                <span class="grand-total-amount">
                  <template v-if="hasCustomItemsOnly">Price to be determined</template>
                  <template v-else>₱{{ cartStore.cartTotal?.toFixed(2) || '0.00' }}</template>
                </span>
              </div>
            </div>
            <ion-button expand="block" class="place-order-btn" @click="placeOrder" :disabled="!selectedPaymentMethod || isPlacingOrder">
              <ion-spinner v-if="isPlacingOrder" name="dots"></ion-spinner>
              <span v-else>Place Order</span>
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// @ts-ignore - These imports are used in the template
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonAlert,
  IonModal,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonRadioGroup,
  IonRadio,
  IonButtons
} from '@ionic/vue';

// @ts-ignore - These icons are used in the template
import { cartOutline, addOutline, removeOutline, trashOutline, arrowForward, checkmarkCircle, closeOutline, cashOutline, logoPaypal } from 'ionicons/icons';

import { useCartStore } from '../../stores/cartStore';
import { onMounted, ref, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { toastController } from '@ionic/vue';
import { useAuthStore } from '../../stores/authStore';
import type { UserData } from '../../stores/authStore';
import { database, ref as dbRef, push, set } from '../../config/firebase';
import { storeToRefs } from 'pinia';
import { createPayPalOrder, capturePayPalOrder } from '@/api/paypal';

// PayPal configuration
const PAYPAL_CLIENT_ID = 'AbnTUyrjf9HNGPd041AS7o7BI1jxhhQVB6pZG6cKJvUCgUciUjH-NHGVE-4fB9OZUTEamm_vdP_p49y2';
const PAYPAL_SDK_URL = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=PHP&intent=capture&components=buttons&enable-funding=paylater,venmo&disable-funding=paylater,card`;

// Define interface for cart items including custom cake properties
interface CartItem {
  id: string;
  cakeId?: string; // Make cakeId optional since we're using unified order structure
  name: string;
  size?: string;
  quantity: number;
  unitPrice: number | undefined;
  totalPrice: number | undefined;
  imageUrl: string;
  isCustomCake?: boolean;
  needsPricing?: boolean;
  customDetails?: {
    designData?: {
      cakeLayers: any[];
      layerIdCounter: number;
    };
    layers: number;
    flavor: any;
    cakeLayers?: any[];
    greeting: any;
    customerInfo: any;
    message?: string;
  };
}

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const isCheckingOut = ref(false);
const showDeleteAlert = ref(false);
const itemToDelete = ref<string | null>(null);
const showSuccessModal = ref(false);
const showCheckoutModal = ref(false);
const selectedPaymentMethod = ref('paypal');
const isPlacingOrder = ref(false);

// PayPal Integration
const paypalLoaded = ref(false);
const isProcessingPayment = ref(false);

// Add PayPal SDK loading function
const loadPayPalSDK = () => {
  return new Promise<void>((resolve, reject) => {
    // Check if PayPal SDK is already loaded
    // @ts-ignore - PayPal types
    if (window.paypal) {
      console.log('PayPal SDK already loaded');
      // Verify that required components are available
      // @ts-ignore - PayPal types
      if (window.paypal.Buttons) {
        resolve();
      } else {
        // If SDK is loaded but buttons component is missing, reload it
        console.log('PayPal SDK loaded but buttons component missing, reloading...');
        const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
        if (existingScript) {
          existingScript.remove();
        }
        // Continue with loading new script
      }
    }

    // Remove any existing PayPal script
    const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = PAYPAL_SDK_URL;
    script.async = true;
    
    script.onload = () => {
      console.log('PayPal SDK loaded successfully');
      // Add a small delay to ensure SDK is fully initialized
      setTimeout(() => {
        // @ts-ignore - PayPal types
        if (window.paypal && window.paypal.Buttons) {
          console.log('PayPal SDK and buttons component initialized successfully');
          resolve();
        } else {
          console.error('PayPal SDK loaded but buttons component not available');
          reject(new Error('PayPal buttons component not available'));
        }
      }, 500); // Increased delay to ensure full initialization
    };
    
    script.onerror = (error) => {
      console.error('Failed to load PayPal SDK:', error);
      reject(new Error('Failed to load PayPal SDK'));
    };

    document.head.appendChild(script);
  });
};

// Add a helper function to wait for element
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

// Update onMounted to load PayPal SDK
onMounted(async () => {
  console.log('Component mounted, loading cart items...');
  await cartStore.loadCartItems();
  try {
    await loadPayPalSDK();
    console.log('PayPal SDK loaded during component mount');
  } catch (error) {
    console.error('Failed to load PayPal SDK during mount:', error);
  }
});

onUnmounted(() => {
  cartStore.cleanup();
  // Only reset PayPal state if we're actually unloading the component
  if (!showCheckoutModal.value) {
    paypalLoaded.value = false;
  }
});

// Update the watcher for checkout modal
watch(showCheckoutModal, async (isOpen) => {
  if (isOpen) {
    console.log('Checkout modal opened');
    paypalLoaded.value = false; // Reset the loaded state
    
    try {
      // Ensure PayPal SDK is loaded
      await loadPayPalSDK();
      
      // Wait for next tick to ensure DOM is updated
      await nextTick();
      
      // Wait for the PayPal container to be available
      console.log('Waiting for PayPal container...');
      await waitForElement('paypal-button-container');
      console.log('PayPal container found, initializing buttons...');
      
      // Add a small delay to ensure the container is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await initializePayPalButtons();
    } catch (error) {
      console.error('Failed to initialize PayPal:', error);
      const toast = await toastController.create({
        message: 'Failed to initialize payment system. Please try again.',
        duration: 5000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    }
  } else {
    console.log('Checkout modal closed');
    // Clear PayPal container when modal is closed
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }
    paypalLoaded.value = false;
  }
});

const initializePayPalButtons = async () => {
  try {
    console.log('Initializing PayPal buttons...');
    const paypal = window.paypal;
    
    if (!paypal) {
      throw new Error('PayPal SDK not loaded');
    }

    // Remove any existing buttons
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
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
      onError: (err: any) => {
        console.error('PayPal error:', err);
        alert('An error occurred with PayPal. Please try again.');
      },
      onCancel: () => {
        console.log('Payment cancelled');
      }
    }).render('#paypal-button-container');

    console.log('PayPal buttons initialized successfully');
  } catch (error) {
    console.error('Error initializing PayPal buttons:', error);
    alert('Failed to initialize PayPal. Please refresh the page and try again.');
  }
};

const updateItemQuantity = async (id: string, newQuantity: number) => {
  if (newQuantity >= 1) {
    await cartStore.updateItemQuantity(id, newQuantity);
  }
};

const confirmRemoveItem = (itemId: string) => {
  itemToDelete.value = itemId;
  showDeleteAlert.value = true;
};

const removeItem = () => {
  if (itemToDelete.value) {
    cartStore.removeItem(itemToDelete.value);
    itemToDelete.value = null;
  }
  showDeleteAlert.value = false;
};

const handleSuccessModalDismiss = () => {
  showSuccessModal.value = false;
  router.replace('/');
};

const handleCheckout = () => {
  showCheckoutModal.value = true;
};

const processOrderWithPayPal = async (paypalOrder: any) => {
  console.log('Starting order processing...');
  if (isPlacingOrder.value) {
    console.log('Order already being placed, ignoring request');
    return;
  }
  
  isPlacingOrder.value = true;
  try {
    console.log('Generating order ID...');
    const orderId = await cartStore.generateOrderId('order');
    console.log('Order ID generated:', orderId);
    
    // Add PayPal payment details to order data
    const orderData = {
      orderId,
      items: cartStore.items,
      total: cartStore.cartTotal,
      paymentMethod: 'paypal',
      paymentDetails: {
        paypalOrderId: paypalOrder.id,
        status: paypalOrder.status,
        captureId: paypalOrder.purchase_units[0].payments.captures[0].id,
        amount: paypalOrder.purchase_units[0].amount.value,
        currency: paypalOrder.purchase_units[0].amount.currency_code
      },
      timestamp: new Date().toISOString()
    };

    console.log('Saving order to Firebase:', orderData);
    // Save order to Firebase
    const orderRef = dbRef(database, `orders/${orderId}`);
    await set(orderRef, orderData);
    console.log('Order saved successfully');

    // Clear cart after successful order
    console.log('Clearing cart...');
    const cartItemIds = [...cartStore.items].map(item => item.id);
    for (const itemId of cartItemIds) {
      await cartStore.removeItem(itemId);
    }
    console.log('Cart cleared');

  } catch (error) {
    console.error('Error processing PayPal order:', error);
    throw error;
  } finally {
    isPlacingOrder.value = false;
    console.log('Order processing completed');
  }
};

const placeOrder = async () => {
  if (!selectedPaymentMethod.value) return;
  
  if (selectedPaymentMethod.value === 'cod') {
    isPlacingOrder.value = true;
    try {
      // Your existing COD order logic here
      await handleCheckout();
      showCheckoutModal.value = false;
      showSuccessModal.value = true;
    } catch (error) {
      console.error('Error placing COD order:', error);
      const toast = await toastController.create({
        message: 'Failed to place order. Please try again.',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    } finally {
      isPlacingOrder.value = false;
    }
  }
  // PayPal orders are handled by the PayPal button
};

const hasCustomItemsOnly = computed(() => {
  return cartStore.items.length > 0 && cartStore.items.every(item => (item as CartItem).isCustomCake);
});

// Add the handleSuccessfulPayment function
const handleSuccessfulPayment = async (captureData: any) => {
  try {
    console.log('Processing successful payment:', captureData);
    
    // Create order in Firebase
    const orderRef = push(dbRef(database, 'orders'));
    const orderData = {
      id: orderRef.key,
      userId: authStore.user?.uid,
      items: cartStore.items,
      total: cartStore.cartTotal,
      status: 'paid',
      paymentMethod: 'paypal',
      paymentDetails: {
        transactionId: captureData.id,
        status: captureData.status,
        amount: captureData.purchase_units[0].payments.captures[0].amount.value,
        currency: captureData.purchase_units[0].payments.captures[0].amount.currency_code,
        captureTime: captureData.purchase_units[0].payments.captures[0].create_time
      },
      createdAt: new Date().toISOString()
    };

    await set(orderRef, orderData);
    console.log('Order created in Firebase:', orderData);

    // Clear the cart by setting items to empty array
    cartStore.$patch({ items: [] });

    // Close checkout modal and show success modal
    showCheckoutModal.value = false;
    showSuccessModal.value = true;

    // Show success message
    const toast = await toastController.create({
      message: 'Payment successful! Your order has been placed.',
      duration: 3000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  } catch (error) {
    console.error('Error processing successful payment:', error);
    const toast = await toastController.create({
      message: 'Error processing payment. Please contact support.',
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
    throw error;
  }
};
</script>

<style scoped>
.cart-page {
  --background: linear-gradient(135deg, #FFF7D0 0%, #C8AD7E 100%);
}

ion-header {
  --background: #FFFFFF;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

ion-toolbar {
  --background: #F0E68D;
  --border-width: 0;
  padding: 8px 16px;
}

.cart-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #58091F;
  letter-spacing: 0.5px;
  text-align: center;
}

.empty-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.empty-cart-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(88, 9, 31, 0.1);
  max-width: 400px;
  width: 100%;
}

.empty-cart-icon {
  font-size: 64px;
  color: #58091F;
  margin-bottom: 16px;
  background: rgba(240, 230, 141, 0.2);
  padding: 24px;
  border-radius: 50%;
}

.empty-cart-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #58091F;
  margin: 0 0 8px 0;
}

.empty-cart-subtitle {
  color: #666;
  margin: 0 0 24px 0;
}

.cart-container {

  padding-top: 80px;
  padding-bottom: 180px;
  /* Space for fixed summary */
}

.cart-header {
  text-align: center;
  margin-bottom: 24px;
  margin-top: 24px;
}

.cart-items-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #58091F;
  margin: 0 0 8px 0;
}

.cart-items-subtitle {
  color: #58091F;
  margin: 0;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  margin-top: 16px;
}

.cart-item {
  --background: transparent;
  --border-radius: 12px;
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  --min-height: 60px;
  --border-width: 0;
  --border-color: transparent;
  margin: 1px 0;

  box-shadow: 0 32px 8px rgba(0, 0, 0, 0.08);
}

.item-image {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #58091F;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-size {
  color: #666;
  margin: 0 0 4px 0;
  font-size: 0.8rem;
}

.item-custom-badge {
  background: #F0E68D;
  color: #58091F;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 4px;
  display: inline-block;
}

.item-price {
  color: #7a1e1e;
  font-weight: 600;
  margin: 0;
  font-size: 0.85rem;
}

.item-price-pending {
  color: #7a1e1e;
  font-weight: 600;
  margin: 0;
  font-size: 0.85rem;
}

.item-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(240, 230, 141, 0.05);
  padding: 6px;
  border-radius: 10px;
}

.quantity-controls ion-button {
  --padding-start: 8px;
  --padding-end: 8px;
  --height: 32px;
  --width: 32px;
  margin: 0;
  --border-radius: 8px;
  --border-width: 1.5px;
  --border-color: #58091F;
  --color: #58091F;
  --background: rgba(255, 255, 255, 0.9);
  --background-hover: rgba(240, 230, 141, 0.1);
  --background-activated: rgba(240, 230, 141, 0.15);
}

.quantity-controls ion-button::part(native) {
  padding: 0;
  min-width: 32px;
  min-height: 32px;
}

.quantity-controls ion-icon {
  font-size: 18px;
}

.quantity-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #58091F;
  min-width: 28px;
  text-align: center;
  padding: 0 6px;
}

.remove-btn {
  --color: #7a1e1e;
  --padding-start: 4px;
  --padding-end: 4px;
}

.cart-summary {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px 16px 0 0;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.summary-header {
  margin-bottom: 12px;
}

.summary-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #58091F;
  margin: 0;
}

.summary-content {
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: #58091F;
  font-size: 0.9rem;
}

.summary-item.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-weight: 600;
  color: #58091F;
}

.total-price {
  color: #7a1e1e;
  font-size: 1.1rem;
}

.checkout-btn {
  --background: #58091F;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 8px;
  --box-shadow: 0 2px 8px rgba(240, 230, 141, 0.2);
  height: 44px;
  font-weight: 600;
  font-size: 1rem;
  color: #fff;
}

.start-shopping-btn {
  --background: #58091F;
  --color: #F0E68D;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(88, 9, 31, 0.2);
  height: 48px;
  font-weight: 600;
  width: 100%;
  max-width: 240px;
}

ion-item-sliding {
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
}

ion-item-options {
  border-radius: 12px;
  min-width: 40px;
}

ion-item-option {
  --background: #7a1e1e;
  --color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

ion-item-option ion-icon {
  font-size: 20px;
}

/* Custom Alert Styles */
:root {
  --ion-color-danger: #7a1e1e;
  --ion-color-danger-rgb: 122, 30, 30;
  --ion-color-danger-contrast: #ffffff;
  --ion-color-danger-contrast-rgb: 255, 255, 255;
  --ion-color-danger-shade: #6c1a1a;
  --ion-color-danger-tint: #873535;
}

.custom-alert {
  --min-width: 300px;
  --max-width: 90%;
  --border-radius: 16px;
  --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  --backdrop-opacity: 0.7;
}

.custom-alert::part(header) {
  color: #F0E68D;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 16px 16px 8px;
}

.custom-alert::part(message) {
  color: #666;
  font-size: 1rem;
  padding: 8px 16px 16px;
}

.alert-button-cancel {
  --color: #ffffff;
  --background: #F0E68D;
  --background-hover: #8B6B2F;
  --background-activated: #6B4D1A;
  font-weight: 500;
  margin: 0 8px;
  border-radius: 8px;
  --box-shadow: 0 2px 8px rgba(240, 230, 141, 0.2);
}

.alert-button-remove {
  --color: #ffffff;
  --background: #7a1e1e;
  --background-hover: #8b2f2f;
  --background-activated: #6c1a1a;
  font-weight: 500;
  margin: 0 8px;
  border-radius: 8px;
  --box-shadow: 0 2px 8px rgba(122, 30, 30, 0.2);
}

.custom-alert::part(button) {
  min-height: 44px;
  font-size: 1rem;
  text-transform: none;
  margin: 8px;
  --border-radius: 8px;
  --border-width: 0;
  --padding-start: 16px;
  --padding-end: 16px;
}

.custom-alert::part(button.alert-button-cancel) {
  --background: #F0E68D;
  --background-hover: #8B6B2F;
  --background-activated: #6B4D1A;
}

.custom-alert::part(button.alert-button-remove) {
  --background: #7a1e1e;
  --background-hover: #8b2f2f;
  --background-activated: #6c1a1a;
}

@media (max-width: 480px) {
  .custom-alert {
    --min-width: 280px;
  }

  .custom-alert::part(header) {
    font-size: 1.1rem;
    padding: 14px 14px 6px;
  }

  .custom-alert::part(message) {
    font-size: 0.95rem;
    padding: 6px 14px 14px;
  }

  .custom-alert::part(button) {
    min-height: 40px;
    font-size: 0.95rem;
    margin: 6px;
  }
}

/* Custom Success Modal Styles */
.custom-success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.custom-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.custom-modal-content {
  position: relative;
  width: 90%;
  max-width: 400px;
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  padding: 0;
  z-index: 1001;
  animation: modal-pop-in 0.3s ease-out forwards;
}

@keyframes modal-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.custom-modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  text-align: center;
}

.success-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 50%;
  margin-bottom: 24px;
}

.success-icon {
  font-size: 48px;
  color: #4CAF50;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #58091F;
  margin: 0 0 16px 0;
}

.success-message {
  color: #666;
  margin: 0 0 32px 0;
  font-size: 1rem;
  line-height: 1.5;
}

.custom-success-button {
  background: #58091F;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  max-width: 250px;
  height: 48px;
  box-shadow: 0 2px 8px rgba(240, 230, 141, 0.2);
}

.custom-success-button:hover {
  background: #8B6B2F;
}

.custom-success-button:active {
  background: #6B4D1A;
}

@media (max-width: 480px) {
  .success-icon-container {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }
  
  .success-icon {
    font-size: 36px;
  }

  .success-title {
    font-size: 1.25rem;
  }

  .success-message {
    font-size: 0.9rem;
    margin-bottom: 24px;
  }

  .custom-success-button {
    padding: 10px 20px;
    font-size: 0.95rem;
    height: 44px;
  }
}

.checkout-modal {
  --height: 100%;
  --border-radius: 16px 16px 0 0;
}

.checkout-container {
  padding: 180px 0; /* Space for fixed bottom section */
}

.checkout-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #58091F;
  margin: 0 0 20px 0;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.order-item-image {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.order-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-item-details {
  flex: 1;
  min-width: 0;
}

.order-item-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #58091F;
  margin: 0 0 6px 0;
}

.order-item-size {
  font-size: 0.95rem;
  color: #666;
  margin: 0;
}

.order-item-custom {
  font-size: 0.9rem;
  color: #58091F;
  background: rgba(240, 230, 141, 0.2);
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-top: 6px;
}

.order-item-quantity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.quantity {
  font-size: 1rem;
  color: #666;
}

.price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #58091F;
}

.price-pending {
  font-size: 0.95rem;
  color: #666;
  font-style: italic;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  --background: transparent;
  --border-color: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: 80px;
}

.payment-option-content {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.payment-icon {
  font-size: 32px;
  color: #58091F;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #58091F;
}

.payment-description {
  font-size: 0.95rem;
  color: #666;
}

.bottom-spacer {
  height: 16px;
}

.checkout-bottom-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.total-section {
  background: #F0E68D;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 1.1rem;
  color: #58091F;
}

.total-row.grand-total {
  border-top: 1px solid rgba(88, 9, 31, 0.1);
  margin-top: 12px;
  padding-top: 16px;
  font-weight: 600;
  font-size: 1.25rem;
}

.total-amount, .grand-total-amount {
  font-weight: 600;
}

.place-order-btn {
  --background: #58091F;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 12px;
  height: 56px;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

ion-radio::part(container) {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #58091F;
}

ion-radio::part(mark) {
  background: #58091F;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.payment-option.paypal-option {
  --padding-end: 16px;
  --background: transparent;
  --border-color: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: auto;
  padding: 8px 0;
}

.paypal-container {
  width: 100%;
  min-height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

#paypal-button-container {
  width: 100%;
  min-height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.paypal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #666;
  width: 100%;
  height: 100%;
}

.paypal-loading p {
  margin: 0;
  font-size: 0.9rem;
}

.paypal-disabled {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.paypal-disabled p {
  margin: 0;
  font-size: 0.9rem;
}

.paypal-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #dc3545;
  text-align: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #dc3545;
  font-size: 0.9rem;
}
</style>