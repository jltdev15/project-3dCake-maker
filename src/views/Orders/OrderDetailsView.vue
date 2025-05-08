<template>
  <ion-page class="page-background">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/orders" ></ion-back-button>
        </ion-buttons>
        <ion-title class="ion-text-center pr-12">Order Details</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="order-details-container">
        <div v-if="isLoading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading order details...</p>
        </div>
        
        <div v-else-if="!order" class="error-state">
          <ion-icon :icon="alertCircleOutline" size="large"></ion-icon>
          <h2>Order Not Found</h2>
          <p>The order you're looking for doesn't exist or has been removed.</p>
        </div>

        <template v-else>
          <div class="order-header">
            <h1>Order #{{ order.orderId }}</h1>
            <span :class="['status-badge', order.status.toLowerCase()]">{{ order.status }}</span>
          </div>

          <div class="order-info-card">
            <div class="info-section">
              <h3>Order Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <ion-icon :icon="calendarOutline"></ion-icon>
                  <div class="info-content">
                    <span class="label">Order Date</span>
                    <span class="value">{{ new Date(order.createdAt).toLocaleDateString() }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <ion-icon :icon="timeOutline"></ion-icon>
                  <div class="info-content">
                    <span class="label">Order Time</span>
                    <span class="value">{{ new Date(order.createdAt).toLocaleTimeString() }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <ion-icon :icon="cashOutline"></ion-icon>
                  <div class="info-content">
                    <span class="label">Total Amount</span>
                    <span class="value">₱{{ order.totalAmount?.toFixed(2) || '0.00' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h3>Order Items</h3>
              <div v-if="!order.items?.length" class="no-items">
                <p>No items in this order</p>
              </div>
              <div v-else class="order-items">
                <div v-for="(item, index) in order.items" :key="index" class="order-item">
                  <div class="item-details">
                    <h4>{{ item.productName || item.name || 'Unnamed Item' }}</h4>
                    
                    <div class="item-meta">
                      <span class="quantity">Quantity: {{ item.quantity || 0 }}</span>
                      <span v-if="item.size" class="size">Size: {{ item.size }}</span>
                      <span class="price">₱{{ (item.unitPrice || item.price || item.productPrice || 0).toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon, IonSpinner } from '@ionic/vue';
import { calendarOutline, timeOutline, cashOutline, alertCircleOutline } from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';
import { useOrderStore } from '../../stores/orderStore';
import { computed, ref, onMounted } from 'vue';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const isLoading = ref(true);

const order = computed(() => {
  const orderId = route.params.id;
  const foundOrder = orderStore.orders.find(o => o.orderId === orderId);
  console.log('Found order:', foundOrder);
  if (foundOrder) {
    console.log('Order items:', foundOrder.items);
  }
  return foundOrder;
});

onMounted(async () => {
  try {
    await orderStore.loadOrders();
    console.log('All orders:', orderStore.orders);
  } catch (error) {
    console.error('Error loading orders:', error);
  } finally {
    isLoading.value = false;
  }
});
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

.order-details-container {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.order-header h1 {
  color: #7A5C1E;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.status-badge {
  padding: 8px 16px;
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

.order-info-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.info-section {
  margin-bottom: 32px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h3 {
  color: #7A5C1E;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #F5E6D3;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-item ion-icon {
  color: #C8AD7E;
  font-size: 1.25rem;
  margin-top: 2px;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-content .label {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.info-content .value {
  color: #333;
  font-weight: 500;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.item-details h4 {
  color: #7A5C1E;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.item-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 0.9rem;
  gap: 12px;
}

.size {
  color: #7A5C1E;
  font-weight: 500;
}

.price {
  font-weight: 600;
  color: #7A5C1E;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 16px;
}

.loading-state p {
  color: #666;
  font-size: 1.1rem;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  gap: 16px;
}

.error-state ion-icon {
  font-size: 48px;
  color: #dc3545;
}

.error-state h2 {
  color: #333;
  font-size: 1.5rem;
  margin: 0;
}

.error-state p {
  color: #666;
  font-size: 1.1rem;
  max-width: 300px;
}

.no-items {
  text-align: center;
  padding: 24px;
  color: #666;
  font-style: italic;
}
</style> 