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
          <div class="empty-state-icon">
            <ion-icon :icon="cartOutline"></ion-icon>
          </div>
          <h2>No Orders Yet</h2>
          <p>Your order history will appear here</p>
        </div>
        
        <ion-list v-else class="orders-list">
          <ion-item v-for="order in orderStore.orders" :key="order.orderId" class="order-item" @click="navigateToOrderDetails(order.orderId)">
            <div class="order-content">
              <div class="order-header">
                <h2>Order #{{ order.orderId }}</h2>
                <span :class="['status-badge', order.status.toLowerCase()]">{{ order.status }}</span>
              </div>
              <div class="order-details">
                <div class="detail-row">
                  <span>{{ new Date(order.createdAt).toLocaleDateString() }}</span>
                </div>
                <div class="detail-row">
                  <span>₱{{ order.totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonList, IonItem } from '@ionic/vue';
import { cartOutline } from 'ionicons/icons';
import { useOrderStore } from '../../stores/orderStore';
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted } from 'vue';

const orderStore = useOrderStore();
const router = useRouter();

onMounted(() => {
  orderStore.loadOrders();
});

onUnmounted(() => {
  orderStore.cleanup();
});

const navigateToOrderDetails = (orderId: string) => {
  router.push(`/orders/${orderId}`);
};
</script>

<style scoped>
.page-background {
  background: linear-gradient(135deg, #F5E6D3, #FFF7D0);
  min-height: 100vh;
}

ion-toolbar {
  --background: linear-gradient(to right, #C8AD7E, #FFFFFF);
  --border-color: transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

ion-content {
  --background: transparent;
}

.orders-container {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.no-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
}

.empty-state-icon {
  background: rgba(255, 255, 255, 0.9);
  padding: 24px;
  border-radius: 50%;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-state-icon ion-icon {
  font-size: 64px;
  color: #C8AD7E;
}

.no-orders h2 {
  margin: 16px 0;
  color: #7A5C1E;
  font-size: 1.75rem;
  font-weight: 600;
}

.no-orders p {
  color: #666;
  font-size: 1.1rem;
}

.orders-list {
  background: transparent;
  padding: 0;
}

.order-item {
  --background: rgba(255, 255, 255, 0.9);
  --border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.order-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-content {
  width: 100%;
  padding: 16px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-header h2 {
  color: #7A5C1E;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.pending {
  background: #FFF3CD;
  color: #856404;
}

.status-badge.completed {
  background: #D4EDDA;
  color: #155724;
}

.status-badge.cancelled {
  background: #F8D7DA;
  color: #721C24;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}
</style> 