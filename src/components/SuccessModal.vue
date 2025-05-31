<template>
  <ion-content class="ion-padding">
    <div class="success-modal-content">
      <ion-icon :icon="checkmarkCircleOutline" class="success-icon"></ion-icon>
      <h2>Item Added Successfully!</h2>
      <p>What would you like to do next?</p>
      <div class="success-modal-buttons">
        <ion-button @click="goToCheckout" expand="block" class="checkout-btn">
          Proceed to Checkout
        </ion-button>
        <ion-button @click="closeModal" expand="block" fill="outline" class="continue-btn">
          Continue Shopping
        </ion-button>
      </div>
    </div>
  </ion-content>
</template>

<script setup>
import { IonContent, IonButton, IonIcon, modalController } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { getCurrentInstance } from 'vue';

const router = useRouter();

const goToCheckout = async () => {
  await modalController.dismiss();
  router.push('/cart');
};

const closeModal = async () => {
  await modalController.dismiss();
};
</script>

<style scoped>
.success-modal-content {
  text-align: center;
  padding: 24px 16px;
}

.success-icon {
  font-size: 64px;
  color: #4CAF50;
  margin-bottom: 16px;
}

.success-modal-content h2 {
  color: #58091F;
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.success-modal-content p {
  color: #666;
  margin-bottom: 24px;
}

.success-modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}

.checkout-btn {
  --background: #58091F;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  margin: 0;
}

.continue-btn {
  --border-color: #58091F;
  --color: #58091F;
  margin: 0;
}

@media (max-width: 480px) {
  .success-modal-content {
    padding: 16px 12px;
  }

  .success-icon {
    font-size: 48px;
  }

  .success-modal-content h2 {
    font-size: 1.3rem;
  }

  .success-modal-buttons {
    padding: 0 12px;
  }
}
</style> 