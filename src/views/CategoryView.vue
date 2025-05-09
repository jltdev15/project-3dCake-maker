<template>
  <ion-page class="page-background">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title class="ion-text-center pr-16">{{ category?.name }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="">
      <div v-if="category" class="category-container">


        <h2 class="cakes-title">Available Cakes</h2>
        <ion-grid>
          <ion-row>
            <ion-col size="6" v-for="cake in category.cakes" :key="cake.id" class="my-3 ">
              <ion-card class="cake-card" @click="viewCakeDetails(cake.id)">
                <img :src="cake.imageUrl" :alt="cake.name" class="p-4"/>
                <div class="cake-info">
                  <h3>{{ cake.name }}</h3>
                  <p class="price" style="color: red;">
                    ₱{{ typeof cake.price === 'number' 
                      ? cake.price.toFixed(2) 
                      : `${cake.price.min.toFixed(2)} - ${cake.price.max.toFixed(2)}` }}
                  </p>
                <ion-button  class="add-to-cart-btn" @click.stop="addToCart(cake)" color="danger">
                  <ion-icon :icon="cartOutline" slot="start"></ion-icon>
                  Add to Cart
                </ion-button>
                </div>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>

    <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Add to Cart</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div v-if="selectedCake">
          <h2>{{ selectedCake.name }}</h2>
          
          <div v-if="selectedCake.sizes" class="size-selection">
            <h3>Select Size</h3>
            <ion-list>
              <ion-item v-for="(price, size) in selectedCake.sizes" :key="size">
                <ion-radio-group v-model="selectedSize">
                  <ion-item>
                    <ion-label>{{ size }} - ₱{{ price }}</ion-label>
                    <ion-radio :value="size"></ion-radio>
                  </ion-item>
                </ion-radio-group>
              </ion-item>
            </ion-list>
          </div>

          <div class="quantity-selection">
            <h3>Quantity</h3>
            <ion-item>
              <ion-label>Quantity</ion-label>
              <ion-buttons slot="end">
                <ion-button @click="decreaseQuantity" :disabled="quantity <= 1">-</ion-button>
                <ion-text>{{ quantity }}</ion-text>
                <ion-button @click="increaseQuantity">+</ion-button>
              </ion-buttons>
            </ion-item>
          </div>

          <div class="price-summary">
            <h3>Price Summary</h3>
            <ion-item lines="none">
              <ion-label>Unit Price</ion-label>
              <ion-text slot="end" color="danger">
                ₱{{ unitPrice.toFixed(2) }}
              </ion-text>
            </ion-item>
            <ion-item lines="none">
              <ion-label>Quantity</ion-label>
              <ion-text slot="end">{{ quantity }}</ion-text>
            </ion-item>
            <ion-item lines="none">
              <ion-label><strong>Total Price</strong></ion-label>
              <ion-text slot="end" color="danger">
                <strong>₱{{ totalPrice.toFixed(2) }}</strong>
              </ion-text>
            </ion-item>
          </div>

          <ion-button expand="block" @click="confirmAddToCart" class="ion-margin-top" color="danger">
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
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
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
import { cartOutline } from 'ionicons/icons';
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
.page-background {
  background: linear-gradient(to bottom, #C8AD7E, #FFF7D0);
}

.category-container {
  padding: 16px;
}

.category-header {
  margin-bottom: 24px;
}

.category-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 16px;
}

.category-description {
  color: #333;
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
}

.cakes-title {
  color: #7A5C1E;
  font-weight: 600;
  margin: 24px 0 16px;
  font-size: 24px;
}

.cake-card {
  margin: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cake-card:hover {
  transform: translateY(-5px);
}

.cake-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  padding: 0;
  border-radius: 8px 8px 0 0;
}

.cake-info {
  padding: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cake-info h3 {
  margin: 0;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  color: #7a1e1e;
  font-weight: 600;
  margin: 4px 0;
  font-size: 14px;
}

.add-to-cart-btn {
  --padding-start: 4px;
  --padding-end: 4px;
  --padding-top: 4px;
  --padding-bottom: 4px;
  margin: 0;
  height: 32px;
  font-size: 12px;
  width: 100%;
}

.add-to-cart-btn ion-icon {
  font-size: 16px;
  margin-right: 4px;
}

.size-selection, .quantity-selection {
  margin: 16px 0;
}

h3 {
  color: #7A5C1E;
  font-size: 16px;
  margin-bottom: 8px;
}

ion-radio-group {
  width: 100%;
}

ion-item {
  --padding-start: 0;
}

.price-summary {
  margin: 16px 0;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 8px;
}

.price-summary ion-item {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
}

.price-summary ion-text {
  font-size: 16px;
}
</style> 