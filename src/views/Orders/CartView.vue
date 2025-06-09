<template>
  <ion-page class="cart-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="toolbar-custom">
        <!-- Modern Redesigned Toolbar -->
        <div class="relative bg-gradient-to-r from-[#F0E68D] via-[#E6D77A] to-[#DCC867] text-gray-800 shadow-xl">
          <!-- Background Pattern Overlay -->
          <div class="absolute inset-0 bg-black/5 opacity-20"></div>
          <div class="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-transparent"></div>

          <!-- Main Content -->
          <div class="relative px-4 py-3 sm:px-6 sm:py-4">
            <div class="flex items-center justify-between">
              <!-- Left Side - Back Button -->
              <div class="flex items-center">
                <button @click="$router.push('/home')"
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
                      Cake Cart
                    </h1>
                    <p class="text-xs sm:text-sm opacity-70 font-medium tracking-wide mt-0.5 text-gray-700">
                      {{ cartStore.items.length === 0 ? 'Your cart is empty' : `${cartStore.itemCount} items ready` }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Right Side - Action Buttons -->
              <div class="flex items-center space-x-2">
                <!-- Clear Cart Button (when cart has items) -->
                <button v-if="cartStore.items.length > 0" @click="confirmClearCart"
                  class="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 active:scale-95 transition-all duration-200 touch-manipulation overflow-hidden">
                  <!-- Button Background Effect -->
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-[#F0E68D]/30 to-[#DCC867]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  </div>

                  <!-- Clear Icon -->
                  <ion-icon :icon="trashOutline"
                    class="relative text-lg sm:text-xl text-gray-800 drop-shadow-sm group-hover:scale-110 transition-transform duration-200"></ion-icon>
                </button>
                <!-- Placeholder when cart is empty -->
                <div v-else class="w-10 h-10 sm:w-12 sm:h-12"></div>
              </div>
            </div>


          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="cart-container px-2 mt-16">
        <!-- Add loading state -->
        <template v-if="isLoading">
          <!-- Skeleton loading for cart items -->
          <div class="cart-items">
            <div v-for="n in 3" :key="n" class="cart-item-skeleton">
              <div class="skeleton-image"></div>
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-badge"></div>
              </div>
              <div class="skeleton-controls">
                <div class="skeleton-quantity"></div>
              </div>
            </div>
          </div>

          <!-- Skeleton loading for cart summary -->
          <div class="cart-summary-skeleton">
            <div class="skeleton-summary-header"></div>
            <div class="skeleton-summary-content">
              <div class="skeleton-summary-item"></div>
              <div class="skeleton-summary-item"></div>
            </div>
            <div class="skeleton-button"></div>
          </div>
        </template>

        <template v-else-if="cartStore.items.length === 0">
          <div class="empty-state">
            <ion-icon :icon="cartOutline" class="empty-state-icon"></ion-icon>
            <h2>Your cart is empty</h2>
            <p>Start adding some delicious cakes to your cart</p>
            <button @click="$router.push('/home')"
              class="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white font-bold text-lg md:text-base uppercase tracking-wide rounded-2xl md:rounded-xl min-h-[56px] md:min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation max-w-[240px] w-full">
              Start Shopping
              <ion-icon :icon="arrowForward" class="text-xl"></ion-icon>
            </button>
          </div>
        </template>

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
                  <p v-if="(item as CartItem)" class="item-price">₱{{ item.unitPrice?.toFixed(2) || '0.00'
                    }} each</p>
                  
                </div>
                <div class="item-controls">
                  <div class="quantity-controls">
                    <button @click="updateItemQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1"
                      class="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ion-icon :icon="removeOutline" class="text-sm"></ion-icon>
                    </button>
                    <span class="quantity-value">{{ item.quantity }}</span>
                    <button @click="updateItemQuantity(item.id, item.quantity + 1)"
                      class="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                      <ion-icon :icon="addOutline" class="text-sm"></ion-icon>
                    </button>
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
                  ₱{{ Number(cartStore.cartTotal).toFixed(2) }}
                </span>
              </div>
            </div>
            <button @click="proceedToCheckout" :disabled="cartStore.items.length === 0"
              class="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white font-bold text-lg md:text-base uppercase tracking-wide rounded-2xl md:rounded-xl min-h-[56px] md:min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation w-full disabled:opacity-50 disabled:cursor-not-allowed">
              <span>Proceed to Checkout</span>
            </button>
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
                Thank you for your order. We'll process standard items right away and provide pricing for your custom
                cake(s) soon.
              </template>
              <template v-else>
                Thank you for your order. We'll process it right away.
              </template>
            </p>
            <button @click="handleSuccessModalDismiss"
              class="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white font-bold text-lg md:text-base uppercase tracking-wide rounded-2xl md:rounded-xl min-h-[56px] md:min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation w-full max-w-[250px]">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>


    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// @ts-ignore - These imports are used in the template
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonAlert,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/vue';
// @ts-ignore - These icons are used in the template
import { cartOutline, addOutline, removeOutline, trashOutline, arrowForward, checkmarkCircle, closeOutline, cashOutline, chevronBackOutline, bagOutline, pricetagOutline } from 'ionicons/icons';

import { useCartStore } from '../../stores/cartStore';
import { onMounted, ref, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { toastController } from '@ionic/vue';



// Define interface for cart items including custom cake properties
interface CartItem {
  id: string;
  cakeId?: string;
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
const showDeleteAlert = ref(false);
const itemToDelete = ref<string | null>(null);
const showSuccessModal = ref(false);

// Add loading state
const isLoading = ref(true);

// Add debug logging
watch(() => cartStore.items, (items) => {
  console.log('Cart Items:', items);
  console.log('Cart Total:', cartStore.cartTotal);
}, { immediate: true });



onMounted(async () => {
  console.log('Component mounted, loading cart items...');
  try {
    await cartStore.loadCartItems();
  } finally {
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
});

onUnmounted(() => {
  cartStore.cleanup();
});



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

const confirmClearCart = async () => {
  const toast = await toastController.create({
    header: 'Clear Cart',
    message: 'Are you sure you want to remove all items from your cart?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Clear All',
        role: 'destructive',
        handler: () => {
          // Clear all items from cart
          cartStore.items.forEach(item => {
            cartStore.removeItem(item.id);
          });
        }
      }
    ],
    position: 'top'
  });
  await toast.present();
};

const handleSuccessModalDismiss = () => {
  showSuccessModal.value = false;
  router.replace('/');
};

const proceedToCheckout = () => {
  router.push('/checkout');
};



const hasCustomItemsOnly = computed(() => {
  return cartStore.items.length > 0 && cartStore.items.every(item => (item as CartItem).isCustomCake);
});
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



.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 16px;
  min-height: 60vh;
}

.empty-state-icon {
  font-size: 64px;
  color: #58091F;
  margin-bottom: 24px;
  background: rgba(240, 230, 141, 0.2);
  padding: 24px;
  border-radius: 50%;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #58091F;
}

.empty-state p {
  font-size: 1rem;
  color: #666;
  margin: 0 0 24px;
  max-width: 300px;
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

.checkout-content {
  padding-top: 64px;
  padding-bottom: 300px; /* Space for fixed bottom section */
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.checkout-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.checkout-section {
  background: #fff;
  border-radius: 16px;

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
  padding-right: 0;
  margin-right: 0;
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
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.payment-options::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.payment-option {
  --background: transparent;
  --border-color: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: 10px;
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
 
  min-height: 150px;
  --background: transparent;
  --border-color: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: auto;
  padding: 8px 0;
}

.paypal-container {
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

#paypal-button-container {
  width: 100%;
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

/* Remove the old bottom-spacer class since we're using padding-bottom on checkout-content */
.bottom-spacer {
  display: none;
}

/* Custom styles now handled by Tailwind classes */

/* Skeleton Loading Styles */
.cart-item-skeleton {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-image {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.1);
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  height: 20px;
  width: 70%;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.skeleton-text {
  height: 16px;
  width: 50%;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.skeleton-badge {
  height: 24px;
  width: 100px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-top: 4px;
}

.skeleton-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.skeleton-quantity {
  height: 32px;
  width: 100px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.cart-summary-skeleton {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px 16px 0 0;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-summary-header {
  height: 24px;
  width: 40%;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-bottom: 16px;
}

.skeleton-summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.skeleton-summary-item {
  height: 20px;
  width: 100%;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.skeleton-button {
  height: 48px;
  width: 100%;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

@keyframes skeleton-loading {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}
</style>