<template>
  <ion-page class="cake-detail-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="cake-title ion-text-center pr-12">{{ cake?.name }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="cake" class="cake-detail-container">
        <div class="cake-image-container">
          <img :src="cake.imageUrl" :alt="cake.name" class="cake-detail-image" />
        </div>

        <div class="cake-info-container">
          <h1 class="cake-name">{{ cake.name }}</h1>
          
          <div v-if="cake.description" class="description-section">
            <h2 class="section-title">Description</h2>
            <p class="cake-description">{{ cake.description }}</p>
          </div>

          <div class="add-to-cart-container">
            <div class="bottom-content">
              <div class="price-section">
                <div class="price-row">
                  <span class="price-label">Total Price:</span>
                  <p class="total-price">
                    ₱{{ totalPrice.toFixed(2) }}
                  </p>
                </div>
              </div>
              <div class="quantity-selector">
                <button @click="decreaseQuantity" class="quantity-btn">
                  <ion-icon :icon="removeOutline"></ion-icon>
                </button>
                <span class="quantity-value">{{ quantity }}</span>
                <button @click="increaseQuantity" class="quantity-btn">
                  <ion-icon :icon="addOutline"></ion-icon>
                </button>
              </div>
              <ion-button @click="addToCart" class="add-to-cart-btn" fill="solid">
                <ion-icon :icon="cartOutline" slot="start"></ion-icon>
                Add to Cart
              </ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Simple Div Modal -->
    <div v-if="isSuccessModalOpen" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Success</h2>
          <button class="close-button" @click="closeSuccessModal">&times;</button>
        </div>
        <div class="modal-body">
          <ion-icon :icon="checkmarkCircleOutline" class="success-icon"></ion-icon>
          <h3>Item Added Successfully!</h3>
          <p>What would you like to do next?</p>
          <div class="modal-buttons">
            <ion-button 
              @click="goToCheckout" 
              expand="block" 
              class="checkout-btn"
              :strong="true"
            >
              Proceed to Checkout
            </ion-button>
            <ion-button 
              @click="closeSuccessModal" 
              expand="block" 
              fill="outline" 
              class="continue-btn"
            >
              Continue Shopping
            </ion-button>
          </div>
        </div>
      </div>
    </div>

  </ion-page>
</template>

<script setup lang="ts">
// @ts-nocheck
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon
} from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';
import { useCakeStore } from '@/stores/cakeStore';
import { computed, ref } from 'vue';
// @ts-ignore
import { cartOutline, checkmarkCircleOutline, addOutline, removeOutline } from 'ionicons/icons';
import { useCartStore } from '@/stores/cartStore';
import { toastController } from '@ionic/vue';

const route = useRoute();
const router = useRouter();
const cakeStore = useCakeStore();
const cartStore = useCartStore();

const category = computed(() => {
  return cakeStore.getCategoryById(route.params.categoryId as string);
});

const cake = computed(() => {
  if (!category.value || !route.query.id || !category.value.cakes) return null;
  return category.value.cakes.find(cake => cake.id === route.query.id);
});

const isSuccessModalOpen = ref(false);
const quantity = ref(1);

const unitPrice = computed(() => {
  if (!cake.value) return 0;
  return typeof cake.value.price === 'number' ? cake.value.price : cake.value.price.min;
});

const totalPrice = computed(() => {
  return unitPrice.value * quantity.value;
});

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const addToCart = async () => {
  console.log('addToCart function called');
  const isActive = await cartStore.checkUserStatus();
  console.log('User status check:', isActive);
  
  if (!isActive) {
    const toast = await toastController.create({
      message: 'Your account has been blocked. Please contact support.',
      duration: 2000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
    return;
  }
  
  try {
    console.log('Attempting to add item to cart');
    if (!cake.value) return;
    
    const cartItem = {
      cakeId: cake.value.id,
      name: cake.value.name,
      quantity: quantity.value,
      unitPrice: unitPrice.value,
      totalPrice: totalPrice.value,
      imageUrl: cake.value.imageUrl,
      isCustomCake: false
    };

    const existingItem = cartStore.items.find(item => 
      item.cakeId === cartItem.cakeId
    );

    if (existingItem) {
      console.log('Updating existing item quantity');
      const newQuantity = existingItem.quantity + quantity.value;
      await cartStore.updateItemQuantity(existingItem.id, newQuantity);
    } else {
      console.log('Adding new item to cart');
      await cartStore.addItem(cartItem);
    }
    
    console.log('Setting modal to open');
    isSuccessModalOpen.value = true;
  } catch (error) {
    console.error('Error updating cart:', error);
    const toast = await toastController.create({
      message: 'Failed to update cart. Please try again.',
      duration: 2000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }
};

const closeSuccessModal = () => {
  console.log('Closing modal');
  isSuccessModalOpen.value = false;
  
};

const goToCheckout = () => {
  console.log('Going to checkout');
  closeSuccessModal();
  router.push('/cart');
};
</script>

<style scoped>
.cake-detail-page {
  --background: linear-gradient(135deg, #FFF7D0 0%, #C8AD7E 100%);
}

ion-header {
  --background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

ion-toolbar {
  --background: #F0E68D;
  --border-width: 0;
  padding: 8px 16px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.back-button {
  --color: #58091F;
}

.cake-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #58091F;
  letter-spacing: 0.5px;
}

.cake-detail-container {
  padding: 16px;
  padding-top: 80px;
  padding-bottom: 80px;
  max-width: 800px;
  margin: 0 auto;
}

.cake-image-container {
  width: 100%;
  height: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cake-detail-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cake-info-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.cake-name {
  font-size: 2rem;
  font-weight: 700;
  color: #58091F;
  margin: 0 0 16px 0;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7A5C1E;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(122, 92, 30, 0.1);
}

.description-section {
  margin-bottom: 24px;
}

.cake-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #666;
  margin: 0;
}

.add-to-cart-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.bottom-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.price-section {
  flex: 1;
  margin: 0;
}

.price-row {
  display: flex;

  flex-direction: column;

}

.price-label {
  font-size: 1.1rem;
  color: #666;
  font-weight: 600;
}

.total-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #58091F;
  margin: 0;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f8f8;
  border-radius: 12px;
  padding: 6px 10px;
  border: 1px solid #eee;
  margin-right: 10px;
}

.quantity-btn {
  background: none;
  color: #58091F;
  padding: 0;
  border-radius: 50%;
  border: none;
  box-shadow: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.2s;
}

.quantity-btn:hover {
  background-color: rgba(88, 9, 31, 0.1);
}

.quantity-value {
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
  width: 24px;
  text-align: center;
}

.add-to-cart-btn {
  --background: #58091F;
  --background-hover: linear-gradient(135deg, #8B6B2F 0%, #9D7B3F 100%);
  --background-activated: linear-gradient(135deg, #8B6B2F 0%, #9D7B3F 100%);
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(122, 92, 30, 0.2);
  height: 48px;
  font-weight: 600;
  font-size: 1.1rem;
  min-width: 300px;
  margin: 0;
}

@media (max-width: 768px) {
  .cake-image-container {
    height: 300px;
  }

  .cake-name {
    font-size: 1.75rem;
  }

  .bottom-content {
    gap: 12px;
  }
  
  .price-label {
    font-size: 1rem;
  }
  
  .total-price {
    font-size: 1.4rem;
  }
  
  .add-to-cart-btn {
    min-width: 180px;
    font-size: 1rem;
  }
  
  .quantity-selector {
    padding: 4px 8px;
  }
  
  .quantity-btn {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .cake-detail-container {
    padding: 12px;
    padding-top: 70px;
    padding-bottom: 70px;
  }

  .cake-image-container {
    height: 400px;
    border-radius: 16px;
  }

  .cake-info-container {
    padding: 16px;
    border-radius: 16px;
  }

  .cake-name {
    font-size: 1.5rem;
  }

  .bottom-content {
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .price-section {
    width: 100%;
    margin-bottom: 12px;
  }
  
  .price-label {
    font-size: 0.95rem;
  }
  
  .total-price {
    font-size: 1.3rem;
  }
  
  .quantity-selector {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .add-to-cart-btn {
    min-width: 100%;
    height: 44px;
    font-size: 0.9rem;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 100%;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-header h2 {
  margin: 0;
  color: #58091F;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f0f0f0;
}

.modal-body {
  padding: 20px;
  text-align: center;
}

.success-icon {
  font-size: 48px;
  color: #4CAF50;
  margin-bottom: 16px;
}

.modal-body h3 {
  color: #58091F;
  font-size: 1.25rem;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.modal-body p {
  color: #666;
  margin: 0 0 24px 0;
  font-size: 1rem;
}

.modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 0 16px 0;
}

.checkout-btn {
  --background: #58091F;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  margin: 0;
  height: 48px;
  font-weight: 600;
}

.continue-btn {
  --border-color: #58091F;
  --color: #58091F;
  margin: 0;
  height: 48px;
  font-weight: 600;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@media (min-width: 768px) {
  .modal-content {
    max-width: 500px;
    border-radius: 20px;
  }
}
</style> 