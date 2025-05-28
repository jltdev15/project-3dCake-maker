<template>
  <ion-page class="order-details-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/orders" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="details-title ion-text-center pr-12">Order Details</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="details-container">
        <div v-if="isLoading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading order details...</p>
        </div>

        <div v-else-if="!order" class="error-state">
          <div class="error-content">
            <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
            <h2>Order Not Found</h2>
            <p>The order you're looking for doesn't exist or has been removed.</p>
            <ion-button router-link="/orders" class="back-to-orders-btn" fill="solid">
              Back to Orders
              <ion-icon :icon="arrowBack" slot="start"></ion-icon>
            </ion-button>
          </div>
        </div>

        <template v-else>
          <div class="order-header">
            <div class="header-content">
              <h1 class="order-number">Order #{{ order.orderId }}</h1>
              <span :class="['status-badge', order.status.toLowerCase()]">{{ order.status }}</span>
            </div>
          </div>

          <div class="order-info-card">
            <!-- Order Type Badge -->
            <div class="type-badge-container">
              <span class="type-badge" :class="{'custom': isCustomOrder(order)}">
                {{ isCustomOrder(order) ? 'Custom Cake' : 'Standard Cake' }}
              </span>
            </div>

            <div class="info-section">
              <h3 class="section-title">Order Information</h3>
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
                    <template v-if="isCustomOrder(order)">
                      ₱{{ ((order as any).totalAmount || 0).toFixed(2) }}
                    </template>
                    <span class="value pending" v-else>
                      Pending Pricing
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Custom Order Details -->
            <div class="info-section" v-if="isCustomOrder(order)">
              <h3 class="section-title">Custom Cake Details</h3>
              <div class="custom-cake-details">
                <p class="custom-description">
                  Your custom cake order has been received. Our team will review your design request and provide pricing
                  information shortly.
                </p>
                <div class="pricing-status">
                  <span class="status-label">Status:</span>
                  <span :class="['status-value', order.pricingStatus]">
                    {{ order.pricingStatus === 'pending' ? 'Awaiting Pricing' :
                    order.pricingStatus === 'priced' ? 'Price Quoted' : 'Price Accepted' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Standard Order Items -->
            <div class="info-section" v-if="isNonCustomOrder(order)">
              <h3 class="section-title">Order Items</h3>
              <div v-if="!order.items?.length" class="no-items">
                <p>No items in this order</p>
              </div>
              <div v-else class="order-items">
                <div v-for="(item, index) in order.items" :key="index" class="order-item">
                  <div class="item-image">
                    <img :src="item.imageUrl" :alt="item.name" />
                  </div>
                  <div class="item-details">
                    <h4 class="item-name">{{ item.name || 'Unnamed Item' }}</h4>
                    <div class="item-meta">
                      <span class="quantity">Quantity: {{ item.quantity || 0 }}</span>
                      <span v-if="item.size" class="size">Size: {{ item.size }}</span>
                      <span class="price">₱{{ item.unitPrice?.toFixed(2) || '0.00' }}</span>
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
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon, IonSpinner, IonButton } from '@ionic/vue';
import { calendarOutline, timeOutline, cashOutline, alertCircleOutline, arrowBack, pricetagOutline } from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';
import { useOrderStore } from '../../stores/orderStore';
import { computed, ref, onMounted } from 'vue';

// Type definitions
interface BaseOrder {
  orderId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: number;
}

interface NonCustomOrder extends BaseOrder {
  type: 'non-custom';
  totalAmount: number;
  items: any[];
}

interface CustomOrder extends BaseOrder {
  orderType: 'custom';
  pricingStatus: 'pending' | 'priced' | 'accepted';
  totalAmount?: number;
  updatedAt: number;
  items: {
    needsPricing: boolean;
  };
}

type Order = NonCustomOrder | CustomOrder;

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const isLoading = ref(true);

// Type guard for custom order
const isCustomOrder = (order: any): order is CustomOrder => {
  return order?.hasCustomItems === true;
};

// Type guard for non-custom order
const isNonCustomOrder = (order: any): order is NonCustomOrder => {
  return order?.hasCustomItems === false;
};

const order = computed(() => {
  const orderId = route.params.id as string;
  const orderType = route.query.type || 'non-custom';
  console.log(`Looking for order ${orderId} with type ${orderType}`);
  
  const foundOrder = orderStore.orders.find(o => o.orderId === orderId);
  console.log('Found order:', foundOrder);
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
.order-details-page {
  --background: linear-gradient(135deg, #FFF7D0 0%, #C8AD7E 100%);
}

ion-header {
  --background: #FFFFFF;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

ion-toolbar {
  --background: #7A5C1E;
  --border-width: 0;
  padding: 8px 16px;
}

.back-button {
  --color: #FFFFFF;
}

.details-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
}

.details-container {
  padding: 16px;
  padding-top: 80px;
  max-width: 800px;
  margin: 0 auto;
}

.order-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7A5C1E;
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

.status-badge.processing {
  background: #CCE5FF;
  color: #004085;
}

.order-info-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.type-badge-container {
  position: absolute;
  top: -15px;
  right: 20px;
}

.type-badge {
  background: #7A5C1E;
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.type-badge.custom {
  background: #8e44ad;
}

.info-section {
  margin-bottom: 32px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
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
  color: #7A5C1E;
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

.info-content .value.price {
  color: #7a1e1e;
  font-weight: 600;
}

.info-content .value.pending {
  color: #856404;
  font-weight: 600;
}

.custom-cake-details {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
}

.custom-description {
  margin-bottom: 16px;
  color: #555;
}

.pricing-status {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-label {
  font-weight: 500;
  color: #555;
}

.status-value {
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-value.pending {
  background: #FFF3CD;
  color: #856404;
}

.status-value.priced {
  background: #CCE5FF;
  color: #004085;
}

.status-value.accepted {
  background: #D4EDDA;
  color: #155724;
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
  display: flex;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-name {
  color: #7A5C1E;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #666;
  font-size: 0.9rem;
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
  min-height: calc(100vh - 80px);
  gap: 16px;
}

.loading-state p {
  color: #666;
  font-size: 1.1rem;
}

.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
}

.error-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.error-icon {
  font-size: 48px;
  color: #dc3545;
  margin-bottom: 16px;
}

.error-state h2 {
  color: #333;
  font-size: 1.5rem;
  margin: 0 0 8px 0;
}

.error-state p {
  color: #666;
  font-size: 1.1rem;
  margin: 0 0 24px 0;
}

.back-to-orders-btn {
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(122, 92, 30, 0.2);
  height: 48px;
  font-weight: 600;
}

.no-items {
  text-align: center;
  padding: 24px;
  color: #666;
  font-style: italic;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .order-item {
    flex-direction: column;
  }

  .item-image {
    width: 100%;
    height: 160px;
  }
}

@media (max-width: 480px) {
  .order-info-card {
    padding: 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .item-image {
    height: 140px;
  }
}
</style> 