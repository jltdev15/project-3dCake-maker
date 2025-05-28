<template>
  <ion-page class="orders-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="orders-title ion-text-center">Orders</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      
      <div class="orders-container">
        <!-- Loading skeleton -->
        <div v-if="isLoading" class="orders-list">
          <div class="orders-header">
            <h2 class="orders-list-title">Order History</h2>
            <p class="orders-list-subtitle">View and track your orders</p>
          </div>
          
          <div class="orders-grid">
            <div v-for="n in 3" :key="n" class="order-card skeleton">
              <div class="order-header">
                <div class="skeleton-text skeleton-title"></div>
                <div class="skeleton-badge"></div>
              </div>
              <div class="order-details">
                <div class="detail-item">
                  <div class="skeleton-circle"></div>
                  <div class="skeleton-text"></div>
                </div>
                <div class="detail-item">
                  <div class="skeleton-circle"></div>
                  <div class="skeleton-text"></div>
                </div>
                <div class="detail-item">
                  <div class="skeleton-circle"></div>
                  <div class="skeleton-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="orderStore.orders.length === 0" class="no-orders">
          <div class="empty-state-content">
            <div class="empty-state-icon">
              <ion-icon :icon="cartOutline"></ion-icon>
            </div>
            <h2 class="empty-state-title">No Orders Yet</h2>
            <p class="empty-state-subtitle">Your order history will appear here</p>
            <ion-button router-link="/home" class="start-shopping-btn" fill="solid">
              Start Shopping
              <ion-icon :icon="arrowForward" slot="end"></ion-icon>
            </ion-button>
          </div>
        </div>
        
        <!-- Orders list -->
        <div v-else class="orders-list">
          <div class="orders-header">
            <h2 class="orders-list-title">Order History</h2>
            <p class="orders-list-subtitle">View and track your orders</p>
          </div>

          <div class="orders-grid">
            <div v-for="order in orderStore.orders" 
                 :key="order.orderId" 
                 class="order-card"
                 @click="navigateToOrderDetails(order.orderId, getOrderType(order))">
              <div class="order-header">
                <h3 class="order-number">Order #{{ order.orderId }}</h3>
                <span :class="['status-badge', order.status.toLowerCase()]">{{ order.status }}</span>
              </div>
              <div class="order-details">
                <div class="detail-item">
                  <ion-icon :icon="calendarOutline"></ion-icon>
                  <span>{{ new Date(order.createdAt).toLocaleDateString() }}</span>
                </div>

                <div class="detail-item">
                  <ion-icon :icon="cashOutline"></ion-icon>
                  <span class="order-total">

                    <template v-if="isCustomOrder(order)">
                      ₱{{ (order.totalAmount || 0).toFixed(2) }}
                    </template>
                    <template v-else>
                      Pending Pricing
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonButton, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { cartOutline, calendarOutline, cashOutline, arrowForward, pricetagOutline } from 'ionicons/icons';
import { useOrderStore } from '../../stores/orderStore';
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted, ref } from 'vue';

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

const orderStore = useOrderStore();
const router = useRouter();
const isLoading = ref(true);

onMounted(async () => {
  await loadOrders();
});

onUnmounted(() => {
  orderStore.cleanup();
});

const loadOrders = async () => {
  isLoading.value = true;
  await orderStore.loadOrders();
  isLoading.value = false;
};

const handleRefresh = async (event: CustomEvent) => {
  await loadOrders();
  if (event.target) {
    (event.target as HTMLIonRefresherElement).complete();
  }
};

// Type guard for custom order
const isCustomOrder = (order: any): order is CustomOrder => {
  return order.totalAmount !== 0;
};

// Type guard for non-custom order
const isNonCustomOrder = (order: any): order is NonCustomOrder => {
  return order.orderType === 'non-custom';
};

// Helper function to determine order type
const getOrderType = (order: any): 'custom' | 'non-custom' => {
  return isCustomOrder(order) ? 'custom' : 'non-custom';
};

const navigateToOrderDetails = (orderId: string, orderType: string) => {
  router.push(`/orders/${orderId}?type=${orderType}`);
};
</script>

<style scoped>
.orders-page {
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

.orders-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
}

.orders-container {
  padding: 16px;
  padding-top: 80px;
  max-width: 1200px;
  margin: 0 auto;
}

.no-orders {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
}

.empty-state-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.empty-state-icon {
  background: rgba(255, 255, 255, 0.9);
  padding: 24px;
  border-radius: 50%;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: inline-block;
}

.empty-state-icon ion-icon {
  font-size: 64px;
  color: #7A5C1E;
}

.empty-state-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7A5C1E;
  margin: 0 0 8px 0;
}

.empty-state-subtitle {
  color: #666;
  margin: 0 0 24px 0;
}

.orders-header {
  text-align: center;
  margin-bottom: 32px;
}

.orders-list-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #7A5C1E;
  margin: 0 0 8px 0;
}

.orders-list-subtitle {
  color: #666;
  margin: 0;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.order-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-number {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7A5C1E;
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

.status-badge.accepted {
  background: #D4EDDA;
  color: #155724;
}

.status-badge.declined {
  background: #F8D7DA;
  color: #721C24;
}

.status-badge.processing {
  background: #CCE5FF;
  color: #004085;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.detail-item ion-icon {
  color: #7A5C1E;
  font-size: 1.1rem;
}

.order-total {
  font-weight: 600;
  color: #7A5C1E;
}

.order-type {
  font-weight: 500;
  color: #555;
}

.start-shopping-btn {
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(122, 92, 30, 0.2);
  height: 48px;
  font-weight: 600;
}

/* Skeleton Loading Styles */
.skeleton {
  pointer-events: none;
}

.skeleton-text {
  height: 16px;
  background: linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  width: 70%;
}

.skeleton-title {
  height: 20px;
  width: 50%;
}

.skeleton-badge {
  height: 26px;
  width: 80px;
  background: linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 20px;
}

.skeleton-circle {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 768px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }

  .orders-list-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .empty-state-content {
    padding: 24px;
  }

  .order-card {
    padding: 16px;
  }
}
</style> 