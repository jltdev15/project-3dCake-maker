<template>
  <ion-page class="page-background">
    <ion-header>
      <ion-toolbar>
        <ion-title class="ion-text-center">Orders</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="orders-container">
        <div v-if="orderStore.orders.length === 0" class="no-orders">
          <ion-icon :icon="cartOutline" size="large"></ion-icon>
          <h2>No Orders Yet</h2>
          <p>Your order history will appear here</p>
        </div>
        
        <ion-list v-else>
          <ion-item v-for="order in orderStore.orders" :key="order.orderId" class="order-item">
            <ion-label>
              <h2>Order #{{ order.orderId }}</h2>
              <p>Status: {{ order.status }}</p>
              <p>Total: ₱{{ order.totalAmount.toFixed(2) }}</p>
              <p>Date: {{ new Date(order.createdAt).toLocaleDateString() }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonList, IonItem, IonLabel } from '@ionic/vue';
import { cartOutline } from 'ionicons/icons';
import { useOrderStore } from '../../stores/orderStore';
import { onMounted } from 'vue';

const orderStore = useOrderStore();

onMounted(async () => {
  await orderStore.loadOrders();
});
</script>

<style scoped>
.page-background {
  background: linear-gradient(to bottom, #C8AD7E, #FFF7D0);
}

ion-toolbar {
  --background: linear-gradient(to right, #C8AD7E, #FFFFFF);
}

ion-content {
  --background: transparent;
}

.orders-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

.no-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.no-orders ion-icon {
  margin-bottom: 12px;
  font-size: 48px;
  color: #7A5C1E;
}

.no-orders h2 {
  margin: 8px 0;
  color: #333;
  font-size: 1.5rem;
}

.no-orders p {
  color: #666;
  font-size: 1rem;
}

.order-item {
  --background: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  border-radius: 8px;
}

.order-item h2 {
  color: #7A5C1E;
  font-weight: 600;
}

.order-item p {
  color: #666;
  margin: 4px 0;
}
</style> 