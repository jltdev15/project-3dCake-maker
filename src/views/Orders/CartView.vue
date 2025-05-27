<template>
  <ion-page class="cart-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="cart-title">Cake Cart</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="cart-container">
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
          <div class="cart-header">
            <h2 class="cart-items-title">Cart Items</h2>
            <p class="cart-items-subtitle">{{ cartStore.itemCount }} items in your cart</p>
          </div>

          <div class="cart-items">
            <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
              <div class="item-image">
                <img :src="item.imageUrl" :alt="item.name">
              </div>
              <div class="item-details">
                <h3 class="item-name">{{ item.name }}</h3>
                <p v-if="item.size" class="item-size">Size: {{ item.size }}</p>
                <p v-if="(item as CartItem).isCustomCake" class="item-custom-badge">Custom Design</p>
                <p v-if="!(item as CartItem).isCustomCake" class="item-price">₱{{ item.unitPrice.toFixed(2) }} each</p>
                <p v-else class="item-price-pending">Price to be determined</p>
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
                <ion-button fill="clear" class="remove-btn" @click="confirmRemoveItem(item.id)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </ion-button>
              </div>
            </div>
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
                <span>Total Amount</span>
                <span class="total-price">₱{{ cartStore.cartTotal.toFixed(2) }}</span>
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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonAlert
} from '@ionic/vue';
import { cartOutline, addOutline, removeOutline, trashOutline, arrowForward } from 'ionicons/icons';
import { useCartStore } from '../../stores/cartStore';
import { onMounted, ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { toastController } from '@ionic/vue';
import { useAuthStore } from '../../stores/authStore';
import type { UserData } from '../../stores/authStore';
import { database, ref as dbRef, push, set } from '../../config/firebase';
import { storeToRefs } from 'pinia';

// Define interface for cart items including custom cake properties
interface CartItem {
  id: string;
  cakeId: string;
  name: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string;
  isCustomCake?: boolean;
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
  };
}

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const isCheckingOut = ref(false);
const showDeleteAlert = ref(false);
const itemToDelete = ref<string | null>(null);

onMounted(async () => {
  await cartStore.loadCartItems();
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

const handleCheckout = async () => {
  if (isCheckingOut.value) return;

  isCheckingOut.value = true;
  try {
    console.log('Starting checkout process...');

    // Separate custom and regular cakes
    const customCakes = cartStore.items.filter((item: CartItem) => item.isCustomCake);
    const regularCakes = cartStore.items.filter((item: CartItem) => !item.isCustomCake);

    const hasCustomCakes = customCakes.length > 0;
    const hasRegularCakes = regularCakes.length > 0;

    console.log(`Cart contains: ${customCakes.length} custom cakes, ${regularCakes.length} regular cakes`);

    // Generate a common order ID for both types
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    console.log(`Generated order ID: ${orderId}`);

    // Calculate totals for different cake types
    const customTotal = customCakes.reduce((sum, item) => sum + item.totalPrice, 0);
    const regularTotal = regularCakes.reduce((sum, item) => sum + item.totalPrice, 0);

    // Base order data common to both types
    const baseOrderData = {
      userId: authStore.user?.uid ?? '',
      customerName: authStore.user?.name ?? 'Anonymous User',
      customerEmail: authStore.user?.email ?? '',
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      orderId: orderId
    };

    // Save custom cakes order if any
    if (hasCustomCakes) {
      try {
        console.log('Processing custom cakes...');

        // Safely prepare custom cakes data
        const customCakesForOrder = customCakes.map(item => {
          try {
            // Create a deep copy to avoid reference issues
            const itemCopy = JSON.parse(JSON.stringify(item));

            // Remove price fields
            delete itemCopy.unitPrice;
            delete itemCopy.totalPrice;

            // Add pricing flag
            itemCopy.needsPricing = true;

            // Log for debugging
            if (itemCopy.customDetails &&
              itemCopy.customDetails.designData &&
              itemCopy.customDetails.designData.cakeLayers) {
              console.log('Successfully prepared cake design data for saving');
            } else {
              console.warn('Custom cake missing design data for 3D view');
            }

            return itemCopy;
          } catch (err) {
            console.error('Error processing custom cake item:', err);
            // Return a simplified version if processing fails
            return {
              id: item.id,
              cakeId: item.cakeId,
              name: item.name,
              size: item.size,
              quantity: item.quantity,
              imageUrl: item.imageUrl,
              isCustomCake: true,
              needsPricing: true
            };
          }
        });

        console.log('Saving custom cakes to Firebase...');
        const customOrderRef = dbRef(database, `orders/custom/${orderId}`);
        await set(customOrderRef, {
          ...baseOrderData,
          items: customCakesForOrder,
          orderType: 'custom',
          needsPricing: true,
          pricingStatus: 'pending'
        });

        console.log('Custom cakes saved successfully');

        // Create admin notification for custom cakes
        const customNotificationRef = dbRef(database, 'admin_notifications');
        const newCustomNotificationRef = push(customNotificationRef);
        await set(newCustomNotificationRef, {
          orderId,
          userId: authStore.user?.uid ?? '',
          customerName: authStore.user?.name ?? 'Anonymous User',
          status: 'pending',
          type: 'custom',
          createdAt: Date.now(),
          read: false,
          message: `New custom cake order #${orderId} from ${authStore.user?.name ?? 'Anonymous User'} - Needs pricing`,
          has3DData: true
        });

        console.log('Custom cake admin notification created');
      } catch (customError) {
        console.error('Error saving custom cakes:', customError);
        throw new Error(`Failed to save custom cakes: ${(customError as Error).message || 'Unknown error'}`);
      }
    }

    // Save regular cakes order if any
    if (hasRegularCakes) {
      try {
        console.log('Processing regular cakes...');

        // Prepare regular cakes data (simplified)
        const regularCakesForOrder = regularCakes.map(item => ({
          id: item.id,
          cakeId: item.cakeId,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          imageUrl: item.imageUrl
        }));

        console.log('Saving regular cakes to Firebase...');
        const regularOrderRef = dbRef(database, `orders/non-custom/${orderId}`);
        await set(regularOrderRef, {
          ...baseOrderData,
          items: regularCakesForOrder,
          totalAmount: regularTotal,
          orderType: 'non-custom'
        });

        console.log('Regular cakes saved successfully');

        // Create admin notification for regular cakes
        const regularNotificationRef = dbRef(database, 'admin_notifications');
        const newRegularNotificationRef = push(regularNotificationRef);
        await set(newRegularNotificationRef, {
          orderId,
          userId: authStore.user?.uid ?? '',
          customerName: authStore.user?.name ?? 'Anonymous User',
          status: 'pending',
          type: 'non-custom',
          createdAt: Date.now(),
          read: false,
          message: `New order #${orderId} from ${authStore.user?.name ?? 'Anonymous User'}`
        });

        console.log('Regular cake admin notification created');
      } catch (regularError) {
        console.error('Error saving regular cakes:', regularError);
        throw new Error(`Failed to save regular cakes: ${(regularError as Error).message || 'Unknown error'}`);
      }
    }

    // Clear the cart after successful checkout
    try {
      console.log('Clearing cart...');
      // Instead of using cartStore.clearCart() which might not exist, clear items one by one
      const cartItemIds = [...cartStore.items].map(item => item.id);
      for (const itemId of cartItemIds) {
        await cartStore.removeItem(itemId);
      }
      console.log('Cart cleared successfully');
    } catch (clearError) {
      console.error('Error clearing cart:', clearError);
      // Don't throw here, since the order was already saved
    }

    console.log('Checkout completed successfully!');
    const toast = await toastController.create({
      message: 'Order placed successfully!',
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
    router.replace('/');
  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = (error as Error).message || 'Failed to place order. Please try again.';
    const toast = await toastController.create({
      message: errorMessage,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  } finally {
    isCheckingOut.value = false;
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
  --background: #7A5C1E;
  --border-width: 0;
  padding: 8px 16px;
}

.cart-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.empty-cart-icon {
  font-size: 64px;
  color: #7A5C1E;
  margin-bottom: 16px;
}

.empty-cart-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7A5C1E;
  margin: 0 0 8px 0;
}

.empty-cart-subtitle {
  color: #666;
  margin: 0 0 24px 0;
}

.cart-container {
  padding: 16px;
  padding-top: 80px;
  padding-bottom: 180px;
  /* Space for fixed summary */
}

.cart-header {
  text-align: center;
  margin-bottom: 24px;
}

.cart-items-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #7A5C1E;
  margin: 0 0 8px 0;
}

.cart-items-subtitle {
  color: #666;
  margin: 0;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.cart-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  color: #7A5C1E;
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
  background: #7A5C1E;
  color: #FFFFFF;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 4px;
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
  gap: 8px;
  background: rgba(122, 92, 30, 0.05);
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
  --border-color: #7A5C1E;
  --color: #7A5C1E;
  --background: rgba(255, 255, 255, 0.9);
  --background-hover: rgba(122, 92, 30, 0.1);
  --background-activated: rgba(122, 92, 30, 0.15);
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
  color: #7A5C1E;
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
  color: #7A5C1E;
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
  color: #666;
  font-size: 0.9rem;
}

.summary-item.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-weight: 600;
  color: #7A5C1E;
}

.total-price {
  color: #7a1e1e;
  font-size: 1.1rem;
}

.checkout-btn {
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 8px;
  --box-shadow: 0 2px 8px rgba(122, 92, 30, 0.2);
  height: 44px;
  font-weight: 600;
  font-size: 1rem;
}

.start-shopping-btn {
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(122, 92, 30, 0.2);
  height: 48px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .cart-container {
    padding: 12px;
    padding-top: 70px;
    padding-bottom: 160px;
  }

  .cart-item {
    padding: 10px;
    gap: 10px;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .item-name {
    font-size: 0.9rem;
  }

  .item-size {
    font-size: 0.75rem;
  }

  .item-price {
    font-size: 0.8rem;
  }

  .quantity-controls {
    gap: 6px;
    padding: 4px;
  }

  .quantity-controls ion-button {
    --height: 30px;
    --width: 30px;
  }

  .quantity-controls ion-button::part(native) {
    min-width: 30px;
    min-height: 30px;
  }

  .quantity-controls ion-icon {
    font-size: 16px;
  }

  .quantity-value {
    font-size: 1rem;
    min-width: 24px;
  }

  .cart-summary {
    padding: 12px;
  }

  .summary-header h3 {
    font-size: 1rem;
  }

  .summary-item {
    font-size: 0.85rem;
  }

  .total-price {
    font-size: 1rem;
  }

  .checkout-btn {
    height: 40px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .cart-container {
    padding: 8px;
    padding-top: 60px;
    padding-bottom: 150px;
  }

  .cart-item {
    padding: 8px;
    gap: 8px;
  }

  .item-image {
    width: 50px;
    height: 50px;
  }

  .item-name {
    font-size: 0.85rem;
  }

  .item-size {
    font-size: 0.7rem;
  }

  .item-price {
    font-size: 0.75rem;
  }

  .quantity-controls {
    gap: 4px;
    padding: 3px;
  }

  .quantity-controls ion-button {
    --height: 28px;
    --width: 28px;
  }

  .quantity-controls ion-button::part(native) {
    min-width: 28px;
    min-height: 28px;
  }

  .quantity-controls ion-icon {
    font-size: 15px;
  }

  .quantity-value {
    font-size: 0.95rem;
    min-width: 22px;
  }

  .cart-summary {
    padding: 10px;
  }

  .summary-header h3 {
    font-size: 0.95rem;
  }

  .summary-item {
    font-size: 0.8rem;
  }

  .total-price {
    font-size: 0.95rem;
  }

  .checkout-btn {
    height: 36px;
    font-size: 0.9rem;
  }
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
  color: #7A5C1E;
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
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #6B4D1A;
  font-weight: 500;
  margin: 0 8px;
  border-radius: 8px;
  --box-shadow: 0 2px 8px rgba(122, 92, 30, 0.2);
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
  --background: #7A5C1E;
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
</style>