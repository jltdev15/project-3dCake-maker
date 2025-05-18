<template>
  <ion-page class="category-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="category-title ion-text-center pr-12">{{ category?.name }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="category" class="category-container">
        <div class="category-header">
          <h2 class="cakes-title">Available Cakes</h2>
          <p class="cakes-subtitle">Select from our delicious {{ category.name.toLowerCase() }} collection</p>
        </div>

        <div class="cakes-grid">
          <div v-for="cake in category.cakes" :key="cake.id" class="cake-card" @click="viewCakeDetails(cake.id)">
            <div class="cake-image">
              <img :src="cake.imageUrl" :alt="cake.name" />
            </div>
            <div class="cake-info">
              <h3 class="cake-name">{{ cake.name }}</h3>
              <p class="cake-price">
                ₱{{ typeof cake.price === 'number' 
                  ? cake.price.toFixed(2) 
                  : `${cake.price.min.toFixed(2)} - ${cake.price.max.toFixed(2)}` }}
              </p>
              <ion-button class="add-to-cart-btn" @click.stop="addToCart(cake)" fill="solid">
                <ion-icon :icon="cartOutline" slot="start"></ion-icon>
                Add to Cart
              </ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-modal :is-open="isModalOpen" @didDismiss="closeModal" class="cart-modal">
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-title class="modal-title">Add to Cart</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal" class="close-button">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div v-if="selectedCake" class="modal-content">
          <div class="selected-cake-info">
            <div class="image-container">
              <img :src="selectedCake.imageUrl" :alt="selectedCake.name" class="selected-cake-image" />
            </div>
            <h2 class="selected-cake-name">{{ selectedCake.name }}</h2>
          </div>
          
          <div v-if="selectedCake.sizes" class="size-selection">
            <h3 class="section-title">Select Size</h3>
            <ion-list class="size-list">
              <ion-item v-for="(price, size) in selectedCake.sizes" :key="size" class="size-item" :class="{ 'selected': selectedSize === size }">
                <ion-radio-group v-model="selectedSize">
                  <ion-item lines="none">
                    <ion-label>
                      <span class="size-label">{{ size }}</span>
                      <span class="size-price">₱{{ price }}</span>
                    </ion-label>
                    <ion-radio :value="size"></ion-radio>
                  </ion-item>
                </ion-radio-group>
              </ion-item>
            </ion-list>
          </div>

          <div class="quantity-selection">
            <h3 class="section-title">Quantity</h3>
            <div class="quantity-controls">
              <ion-button fill="outline" @click="decreaseQuantity" :disabled="quantity <= 1" class="quantity-btn">
                <ion-icon :icon="removeOutline"></ion-icon>
              </ion-button>
              <span class="quantity-value">{{ quantity }}</span>
              <ion-button fill="outline" @click="increaseQuantity" class="quantity-btn">
                <ion-icon :icon="addOutline"></ion-icon>
              </ion-button>
            </div>
          </div>

          <div class="price-summary">
            <h3 class="section-title">Price Summary</h3>
            <div class="summary-content">
              <div class="summary-item">
                <span class="summary-label">Unit Price</span>
                <span class="price-value">₱{{ unitPrice.toFixed(2) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Quantity</span>
                <span class="quantity-value">{{ quantity }}</span>
              </div>
              <div class="summary-item total">
                <span class="summary-label">Total Price</span>
                <span class="total-price">₱{{ totalPrice.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <ion-button expand="block" @click="confirmAddToCart" class="confirm-button" fill="solid">
            <ion-icon :icon="cartOutline" slot="start"></ion-icon>
            Add to Cart
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup>
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonRadioGroup,
  IonRadio,
  IonText
} from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';
import { useCakeStore } from '@/stores/cakeStore';
import { computed, ref } from 'vue';
import { cartOutline, closeOutline, addOutline, removeOutline } from 'ionicons/icons';
import { useCartStore } from '@/stores/cartStore';
import { toastController } from '@ionic/vue';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const router = useRouter();
const cakeStore = useCakeStore();
const cartStore = useCartStore();
const authStore = useAuthStore();

const category = computed(() => {
  return cakeStore.getCategoryById(route.params.id);
});

const viewCakeDetails = (cakeId) => {
  router.push(`/cake/${cakeId}`);
};

const isModalOpen = ref(false);
const selectedCake = ref(null);
const selectedSize = ref('');
const quantity = ref(1);

const unitPrice = computed(() => {
  if (!selectedCake.value) return 0;
  
  if (selectedCake.value.sizes && selectedSize.value) {
    return selectedCake.value.sizes[selectedSize.value];
  }
  
  if (typeof selectedCake.value.price === 'number') {
    return selectedCake.value.price;
  }
  
  return selectedCake.value.price.min;
});

const totalPrice = computed(() => {
  return unitPrice.value * quantity.value;
});

const addToCart = (cake) => {
  selectedCake.value = cake;
  selectedSize.value = '';
  quantity.value = 1;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedCake.value = null;
  selectedSize.value = '';
  quantity.value = 1;
};

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const confirmAddToCart = async () => {
  const isActive = await cartStore.checkUserStatus();
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

  if (selectedCake.value.sizes && !selectedSize.value) {
    const toast = await toastController.create({
      message: 'Please select a size',
      duration: 2000,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
    return;
  }
  
  try {
    const cartItem = {
      cakeId: selectedCake.value.id,
      name: selectedCake.value.name,
      size: selectedSize.value,
      quantity: quantity.value,
      unitPrice: unitPrice.value,
      totalPrice: totalPrice.value,
      imageUrl: selectedCake.value.imageUrl
    };

    // Check if the same cake (with same size) already exists in cart
    const existingItem = cartStore.items.find(item => 
      item.cakeId === cartItem.cakeId && 
      item.size === cartItem.size
    );

    if (existingItem) {
      // Update quantity of existing item
      const newQuantity = existingItem.quantity + quantity.value;
      await cartStore.updateItemQuantity(existingItem.id, newQuantity);
      const toast = await toastController.create({
        message: 'Cart updated successfully!',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
    } else {
      // Add new item to cart
      await cartStore.addItem(cartItem);
      const toast = await toastController.create({
        message: 'Added to cart successfully!',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
    }
    
    closeModal();
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
</script>

<style scoped>
.category-page {
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
  --background: #7A5C1E;
  --border-width: 0;
  padding: 8px 16px;
}

.back-button {
  --color: #FFFFFF;
}

.category-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
}

.category-container {
  padding: 16px;
  padding-top: 80px;
}

.category-header {
  text-align: center;
  margin-bottom: 32px;
}

.cakes-title {
  font-size: 2rem;
  font-weight: 700;
  color: #7A5C1E;
  margin: 0 0 8px 0;
}

.cakes-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.cakes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 8px;
}

.cake-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.cake-card:hover {
  transform: translateY(-2px);
}

.cake-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.cake-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cake-card:hover .cake-image img {
  transform: scale(1.05);
}

.cake-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cake-name {
  font-size: 1rem;
  font-weight: 600;
  color: #7A5C1E;
  margin: 0;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cake-price {
  font-size: 1rem;
  font-weight: 700;
  color: #7a1e1e;
  margin: 0;
}

.add-to-cart-btn {
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 8px;
  --box-shadow: 0 2px 8px rgba(122, 92, 30, 0.15);
  height: 36px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: auto;
}

.add-to-cart-btn ion-icon {
  font-size: 1.1rem;
}

/* Modal Styles */
.cart-modal {
  --height: 85%;
  --border-radius: 20px 20px 0 0;
  --background: #f8f8f8;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #7A5C1E;
}

.close-button {
  --color: #7A5C1E;
}

.modal-content {
  padding: 12px;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selected-cake-info {
  text-align: center;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.image-container {
  width: 100%;
  height: 280px;
  margin: 0 auto 12px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.selected-cake-image {
  width: 50%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.selected-cake-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #7A5C1E;
  margin: 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7A5C1E;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(122, 92, 30, 0.1);
}

.size-selection, .quantity-selection {
  background: white;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.size-list {
  background: transparent;
}

.size-item {
  --background: transparent;
  --border-radius: 8px;
  margin-bottom: 4px;
  border: 1px solid rgba(122, 92, 30, 0.1);
  transition: all 0.3s ease;
  --min-height: 44px;
}

.size-item.selected {
  background: rgba(122, 92, 30, 0.05);
  border-color: #7A5C1E;
}

.size-label {
  font-weight: 500;
  color: #7A5C1E;
  font-size: 0.95rem;
}

.size-price {
  color: #7a1e1e;
  font-weight: 600;
  margin-left: 6px;
  font-size: 0.95rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(122, 92, 30, 0.05);
  padding: 8px;
  border-radius: 8px;
}

.quantity-btn {
  --border-color: #7A5C1E;
  --color: #7A5C1E;
  --border-radius: 6px;
  --padding-start: 8px;
  --padding-end: 8px;
  --height: 32px;
}

.quantity-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7A5C1E;
  min-width: 32px;
  text-align: center;
}

.price-summary {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-content {
  background: rgba(122, 92, 30, 0.05);
  border-radius: 8px;
  padding: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
  font-size: 0.95rem;
}

.summary-label {
  color: #666;
  font-weight: 500;
}

.price-value {
  color: #7a1e1e;
  font-weight: 600;
}

.summary-item.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(122, 92, 30, 0.2);
}

.summary-item.total .summary-label {
  color: #7A5C1E;
  font-weight: 600;
}

.total-price {
  color: #7a1e1e;
  font-size: 1.1rem;
  font-weight: 700;
}

.confirm-button {
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 8px;
  --box-shadow: 0 2px 8px rgba(122, 92, 30, 0.2);
  height: 44px;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .cakes-grid {
    gap: 12px;
  }

  .cake-image {
    height: 220px;
  }

  .cake-info {
    padding: 10px;
    gap: 6px;
  }

  .cake-name {
    font-size: 0.95rem;
  }

  .cake-price {
    font-size: 0.95rem;
  }

  .add-to-cart-btn {
    height: 32px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 8px;
    gap: 12px;
  }

  .image-container {
    height: 240px;
  }

  .selected-cake-name {
    font-size: 1.2rem;
  }

  .section-title {
    font-size: 1rem;
  }

  .size-selection, .quantity-selection, .price-summary {
    padding: 10px;
  }

  .size-item {
    --min-height: 40px;
  }

  .quantity-controls {
    gap: 12px;
  }

  .summary-item {
    font-size: 0.9rem;
  }
}
</style> 