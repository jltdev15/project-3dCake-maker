<template>
  <ion-page class="page-background">
    <ion-header>
      <ion-toolbar>
        <ion-title class="ion-text-center ">Cake Cart</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="cartStore.items.length === 0" class="empty-cart">
        <ion-icon :icon="cartOutline" class="empty-cart-icon"></ion-icon>
        <h2>Your cart is empty</h2>
        <ion-button router-link="/home" class="start-shopping-btn">Start Shopping</ion-button>
      </div>

      <div v-else class="cart-container">
        <ion-list>
          <ion-item v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <ion-thumbnail slot="start">
              <img :src="item.imageUrl" :alt="item.name">
            </ion-thumbnail>
            <ion-label>
              <h2>{{ item.name }}</h2>
              <p v-if="item.size">Size: {{ item.size }}</p>
              <p>₱{{ item.unitPrice.toFixed(2) }} each</p>
            </ion-label>
            <div class="quantity-controls">
              <ion-button fill="clear" @click="updateItemQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">
                <ion-icon :icon="removeOutline"></ion-icon>
              </ion-button>
              <ion-text>{{ item.quantity }}</ion-text>
              <ion-button fill="clear" @click="updateItemQuantity(item.id, item.quantity + 1)">
                <ion-icon :icon="addOutline"></ion-icon>
              </ion-button>
            </div>
            <ion-button fill="clear" color="danger" @click="confirmRemoveItem(item.id)">
              <ion-icon :icon="trashOutline"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-list>

        <div class="cart-summary">
          <ion-item lines="none">
            <ion-label>Total Items</ion-label>
            <ion-text slot="end">{{ cartStore.itemCount }}</ion-text>
          </ion-item>
          <ion-item lines="none">
            <ion-label><strong>Total Amount</strong></ion-label>
            <ion-text slot="end" color="danger">
              <strong>₱{{ cartStore.cartTotal.toFixed(2) }}</strong>
            </ion-text>
          </ion-item>
          <ion-button expand="block" class="checkout-btn" @click="handleCheckout" :disabled="isCheckingOut">
            <ion-spinner v-if="isCheckingOut" name="dots"></ion-spinner>
            <span v-else>Proceed to Checkout</span>
          </ion-button>
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
      </div>
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
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonText,
  IonSpinner,
  IonAlert
} from '@ionic/vue';
import { cartOutline, addOutline, removeOutline, trashOutline } from 'ionicons/icons';
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
.page-background {
  background: linear-gradient(to bottom, #C8AD7E, #FFF7D0);
}
ion-content {
    --background: transparent;
}
ion-toolbar {
    --background: linear-gradient(to right, #C8AD7E, #FFFFFF);
}
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
}

.empty-cart-icon {
  font-size: 64px;
  color: #C8AD7E;
  margin-bottom: 16px;
}

.cart-container {
  padding: 16px;
}

.cart-item {
  --background: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  border-radius: 8px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-summary {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.checkout-btn {
  margin-top: 16px;
  --background: #7A5C1E;
}

.start-shopping-btn {
  --background: #7A5C1E;
  --background-hover: #8B6B2A;
  --background-activated: #6A4F18;
  margin-top: 16px;
  font-weight: 500;
}
</style>