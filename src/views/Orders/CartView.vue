<template>
  <ion-page class="cart-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="cart-title">Cake Cart</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
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

      <div v-else class="cart-container">
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
              <p class="item-price">₱{{ item.unitPrice.toFixed(2) }} each</p>
            </div>
            <div class="item-controls">
              <div class="quantity-controls">
                <ion-button fill="outline" @click="updateItemQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">
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
      </div>

      <ion-alert
        :is-open="showDeleteAlert"
        header="Remove Item"
        message="Are you sure you want to remove this item from your cart?"
        :buttons="[
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Remove',
            role: 'destructive',
            handler: removeItem
          }
        ]"
        @didDismiss="showDeleteAlert = false"
      ></ion-alert>
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
import { database, ref as dbRef, push, set } from '../../config/firebase';

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
    await cartStore.updateQuantity(id, newQuantity);
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
    const orderId = await cartStore.checkout();
    if (orderId) {
      // Create admin notification
      const adminNotificationRef = dbRef(database, 'admin_notifications');
      const newNotificationRef = push(adminNotificationRef);
      await set(newNotificationRef, {
        orderId,
        userId: authStore.user?.uid,
        customerName: authStore.user?.name || 'Anonymous User',
        status: 'pending',
        type: 'non-custom',
        createdAt: Date.now(),
        read: false,
        message: `New order #${orderId} from ${authStore.user?.name || 'Anonymous User'}`
      });

      const toast = await toastController.create({
        message: 'Order placed successfully!',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
      router.replace('/');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    const toast = await toastController.create({
      message: 'Failed to place order. Please try again.',
      duration: 2000,
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
  gap: 16px;
  margin-bottom: 24px;
}

.cart-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
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
}

.item-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7A5C1E;
  margin: 0 0 4px 0;
}

.item-size {
  color: #666;
  margin: 0 0 4px 0;
  font-size: 0.9rem;
}

.item-price {
  color: #7a1e1e;
  font-weight: 600;
  margin: 0;
  font-size: 1rem;
}

.item-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7A5C1E;
  min-width: 32px;
  text-align: center;
}

.remove-btn {
  --color: #7a1e1e;
}

.cart-summary {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-header {
  margin-bottom: 16px;
}

.summary-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7A5C1E;
  margin: 0;
}

.summary-content {
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #666;
}

.summary-item.total {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-weight: 600;
  color: #7A5C1E;
}

.total-price {
  color: #7a1e1e;
  font-size: 1.2rem;
}

.checkout-btn {
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(122, 92, 30, 0.2);
  height: 56px;
  font-weight: 600;
  font-size: 1.1rem;
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
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-image {
    width: 100%;
    height: 160px;
  }

  .item-controls {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .cart-items-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .empty-cart-content {
    padding: 24px;
  }

  .item-image {
    height: 140px;
  }

  .cart-summary {
    padding: 16px;
  }
}
</style>