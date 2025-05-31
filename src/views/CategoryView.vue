<template>
  <ion-page class="category-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="category-title ion-text-center pr-12 capitalize">{{ category?.name }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="category" class="category-container">
        <!-- Show cake details if a cake ID is provided in query -->
        <div v-if="selectedCake" class="cake-detail-container">
          <div class="cake-image-container">
            <img :src="selectedCake.imageUrl" :alt="selectedCake.name" class="cake-detail-image" />
          </div>

          <div class="cake-info-container">
            <h1 class="cake-name">{{ selectedCake.name }}</h1>
            
            <div class="price-section">
              <p class="cake-price">
                ₱{{ typeof selectedCake.price === 'number' 
                  ? selectedCake.price.toFixed(2) 
                  : `${selectedCake.price.min.toFixed(2)} - ${selectedCake.price.max.toFixed(2)}` }}
              </p>
            </div>

            <div v-if="selectedCake.description" class="description-section">
              <h2 class="section-title">Description</h2>
              <p class="cake-description">{{ selectedCake.description }}</p>
            </div>

            <div v-if="selectedCake.sizes" class="sizes-section">
              <h2 class="section-title">Available Sizes</h2>
              <div class="sizes-grid">
                <div v-for="(price, size) in selectedCake.sizes" :key="size" class="size-card">
                  <span class="size-name">{{ size }}</span>
                  <span class="size-price">₱{{ price.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <ion-button expand="block" @click="addToCart(selectedCake)" class="add-to-cart-btn" fill="solid">
              <ion-icon :icon="cartOutline" slot="start"></ion-icon>
              Add to Cart
            </ion-button>
          </div>
        </div>

        <!-- Show category listing if no cake ID is provided -->
        <div v-else class="cakes-grid">
          <div v-for="cake in category.cakes" :key="cake.id" class="cake-card" @click="viewCakeDetails(cake.id)">
            <div class="cake-image">
              <img :src="cake.imageUrl" :alt="cake.name" />
            </div>
            <div class="cake-info">
              <h3 class="cake-name">{{ cake.name }}</h3>
              <p class="cake-price">
                ₱ {{ typeof cake.price === 'number' 
                  ? cake.price.toFixed(2) 
                  : `${cake.price.min.toFixed(2)} - ${cake.price.max.toFixed(2)}` }}
              </p>
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

const selectedCake = computed(() => {
  if (!category.value || !route.query.id) return null;
  return category.value.cakes.find(cake => cake.id === route.query.id);
});

const viewCakeDetails = (cakeId) => {
  router.push({
    name: 'cakeDetail',
    params: { categoryId: route.params.id },
    query: { id: cakeId }
  });
};

const isModalOpen = ref(false);
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
  --background: #F0E68D;
  --border-width: 0;
  padding: 8px 16px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.back-button {
  --color: #58091F;
}

.category-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #58091F;
  letter-spacing: 0.5px;
}

.category-container {
  padding: 16px;
  padding-top: 80px;
  max-width: 800px;
  margin: 0 auto;
}

.category-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 0 16px;
}

.cakes-title {
  font-size: 2rem;
  font-weight: 700;
  color: #58091F;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cakes-subtitle {
  font-size: 1.1rem;
  color: #58091F;
  margin: 0;
  opacity: 0.9;
}

.cakes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 8px;
}

.cake-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
}

.cake-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.cake-image {
  width: 100%;
  height: 240px;
  overflow: hidden;
  position: relative;
}

.cake-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cake-card:hover .cake-image::after {
  opacity: 1;
}

.cake-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.cake-card:hover .cake-image img {
  transform: scale(1.05);
}

.cake-info {

  display: flex;
  flex-direction: column;

  background: rgba(255, 255, 255, 0.98);
}

.cake-name {
  font-size: 1rem;
  font-weight: 600;
  color: #58091F;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cake-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #58091F;
  margin: 0;
}

.add-to-cart-btn {
  --background: linear-gradient(#58091F );
  --background-hover: linear-gradient(135deg, #8B6B2F 0%, #9D7B3F 100%);
  --background-activated: linear-gradient(135deg, #8B6B2F 0%, #9D7B3F 100%);
  --border-radius: 12px;
  --box-shadow: 0 2px 8px rgba(122, 92, 30, 0.15);
  height: 40px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: auto;
  transition: all 0.3s ease;
  color: #fff;
}

.add-to-cart-btn:hover {
  --box-shadow: 0 4px 12px rgba(122, 92, 30, 0.25);
}

.add-to-cart-btn ion-icon {
  font-size: 1.2rem;
}

/* Modal Styles */
.cart-modal {
  --height: 100%;
  padding-top: 30px;
  --border-radius: 20px 20px 0 0;
  --background: #f8f8f8;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #58091F;
}

.close-button {
  --color: #58091F;
}

.modal-content {
  padding: 16px;

  max-width: 500px;
  margin: 50px auto 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.selected-cake-info {
  text-align: center;
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.image-container {
  width: 100%;
  height: 300px;
  margin: 0 auto 16px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
}

.selected-cake-image {
  width: 50%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.selected-cake-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #7A5C1E;
  margin: 0;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7A5C1E;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(122, 92, 30, 0.1);
}

.size-selection, .quantity-selection {
  background: white;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.size-list {
  background: transparent;
}

.size-item {
  --background: transparent;
  --border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid rgba(122, 92, 30, 0.1);
  transition: all 0.3s ease;
  --min-height: 48px;
}

.size-item.selected {
  background: rgba(122, 92, 30, 0.05);
  border-color: #7A5C1E;
}

.size-label {
  font-weight: 500;
  color: #7A5C1E;
  font-size: 1rem;
}

.size-price {
  color: #7a1e1e;
  font-weight: 600;
  margin-left: 8px;
  font-size: 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: rgba(122, 92, 30, 0.05);
  padding: 12px;
  border-radius: 12px;
}

.quantity-btn {
  --border-color: #7A5C1E;
  --color: #7A5C1E;
  --border-radius: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  --height: 36px;
}

.quantity-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7A5C1E;
  min-width: 36px;
  text-align: center;
}

.price-summary {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.summary-content {
  background: rgba(122, 92, 30, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 4px 0;
  font-size: 1rem;
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
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(122, 92, 30, 0.2);
}

.summary-item.total .summary-label {
  color: #7A5C1E;
  font-weight: 600;
}

.total-price {
  color: #7a1e1e;
  font-size: 1.2rem;
  font-weight: 700;
}

.confirm-button {
  --background: #58091F;
  --background-hover: linear-gradient(135deg, #8B6B2F 0%, #9D7B3F 100%);
  --background-activated: linear-gradient(135deg, #8B6B2F 0%, #9D7B3F 100%);
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(122, 92, 30, 0.2);
  height: 48px;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .cakes-grid {
    gap: 16px;
  }

  .cake-image {
    height: 220px;
  }

  .cake-info {
    padding: 8px;

  }

  .cake-name {
    font-size: 1rem;
  }

  .cake-price {
    font-size: 1rem;
  }

  .add-to-cart-btn {
    height: 36px;
    font-size: 0.9rem;
  }

  .image-container {
    height: 260px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 12px;
    gap: 16px;
  }

  .image-container {
    height: 220px;
  }

  .selected-cake-name {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .size-selection, .quantity-selection, .price-summary {
    padding: 12px;
  }

  .size-item {
    --min-height: 44px;
  }

  .quantity-controls {
    gap: 16px;
  }

  .summary-item {
    font-size: 0.95rem;
  }

  .confirm-button {
    height: 44px;
    font-size: 1rem;
  }
}

/* Add styles for cake detail view */
.cake-detail-container {
  padding: 16px;
  padding-top: 80px;
  max-width: 800px;
  margin: 0 auto;
}

.cake-image-container {
  width: 100%;
  height: 400px;
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
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.cake-name {
  font-size: 2rem;
  font-weight: 700;
  color: #58091F;
  margin: 0;
}

.price-section {
  margin-bottom: 24px;
}

.cake-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7a1e1e;
  margin: 0;
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

.sizes-section {
  margin-bottom: 24px;
}

.sizes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.size-card {
  background: rgba(122, 92, 30, 0.05);
  border: 1px solid rgba(122, 92, 30, 0.1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.size-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7A5C1E;
}

.size-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #7a1e1e;
}

@media (max-width: 768px) {
  .cake-image-container {
    height: 300px;
  }

  .cake-name {
    font-size: 1.75rem;
  }

  .cake-price {
    font-size: 1.25rem;
  }

  .cake-description {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .cake-detail-container {
    padding: 12px;
    padding-top: 70px;
  }

  .cake-image-container {
    height: 250px;
    border-radius: 16px;
  }

  .cake-info-container {
    padding: 16px;
    border-radius: 16px;
  }

  .cake-name {
    font-size: 1.2rem;
  }

  .cake-price {
    font-size: 0.9rem;
  }

  .sizes-grid {
    grid-template-columns: 1fr;
  }
}
</style> 