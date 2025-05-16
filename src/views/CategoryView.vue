<template>
  <ion-page class="category-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="category-title">{{ category?.name }}</ion-title>
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
          <ion-title>Add to Cart</ion-title>
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
            <img :src="selectedCake.imageUrl" :alt="selectedCake.name" class="selected-cake-image" />
            <h2 class="selected-cake-name">{{ selectedCake.name }}</h2>
          </div>
          
          <div v-if="selectedCake.sizes" class="size-selection">
            <h3>Select Size</h3>
            <ion-list class="size-list">
              <ion-item v-for="(price, size) in selectedCake.sizes" :key="size" class="size-item">
                <ion-radio-group v-model="selectedSize">
                  <ion-item lines="none">
                    <ion-label>{{ size }} - ₱{{ price }}</ion-label>
                    <ion-radio :value="size"></ion-radio>
                  </ion-item>
                </ion-radio-group>
              </ion-item>
            </ion-list>
          </div>

          <div class="quantity-selection">
            <h3>Quantity</h3>
            <div class="quantity-controls">
              <ion-button fill="outline" @click="decreaseQuantity" :disabled="quantity <= 1">
                <ion-icon :icon="removeOutline"></ion-icon>
              </ion-button>
              <span class="quantity-value">{{ quantity }}</span>
              <ion-button fill="outline" @click="increaseQuantity">
                <ion-icon :icon="addOutline"></ion-icon>
              </ion-button>
            </div>
          </div>

          <div class="price-summary">
            <h3>Price Summary</h3>
            <div class="summary-item">
              <span>Unit Price</span>
              <span class="price-value">₱{{ unitPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span>Quantity</span>
              <span class="quantity-value">{{ quantity }}</span>
            </div>
            <div class="summary-item total">
              <span>Total Price</span>
              <span class="total-price">₱{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>

          <ion-button expand="block" @click="confirmAddToCart" class="confirm-button" fill="solid">
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
    await cartStore.addItem({
      cakeId: selectedCake.value.id,
      name: selectedCake.value.name,
      size: selectedSize.value,
      quantity: quantity.value,
      unitPrice: unitPrice.value,
      totalPrice: totalPrice.value,
      imageUrl: selectedCake.value.imageUrl
    });

    const toast = await toastController.create({
      message: 'Added to cart successfully!',
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
    
    closeModal();
  } catch (error) {
    console.error('Error adding to cart:', error);
    const toast = await toastController.create({
      message: 'Failed to add item to cart. Please try again.',
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 8px;
}

.cake-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.cake-card:hover {
  transform: translateY(-4px);
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
  padding: 16px;
}

.cake-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7A5C1E;
  margin: 0 0 8px 0;
}

.cake-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #7a1e1e;
  margin: 0 0 16px 0;
}

.add-to-cart-btn {
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(122, 92, 30, 0.2);
  width: 100%;
  height: 48px;
  font-weight: 600;
}

/* Modal Styles */
.cart-modal {
  --height: 90%;
  --border-radius: 24px 24px 0 0;
}

.modal-content {
  padding: 16px;
}

.selected-cake-info {
  text-align: center;
  margin-bottom: 24px;
}

.selected-cake-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 16px;
}

.selected-cake-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7A5C1E;
  margin: 0;
}

.size-selection, .quantity-selection {
  margin: 24px 0;
}

h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7A5C1E;
  margin-bottom: 16px;
}

.size-list {
  background: transparent;
}

.size-item {
  --background: rgba(255, 255, 255, 0.9);
  --border-radius: 12px;
  margin-bottom: 8px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.quantity-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7A5C1E;
  min-width: 40px;
  text-align: center;
}

.price-summary {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 16px;
  margin: 24px 0;
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

.confirm-button {
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(122, 92, 30, 0.2);
  height: 56px;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .cakes-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .cake-image {
    height: 180px;
  }

  .cakes-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .cakes-grid {
    grid-template-columns: 1fr;
  }

  .cake-image {
    height: 200px;
  }

  .selected-cake-image {
    width: 160px;
    height: 160px;
  }
}
</style> 