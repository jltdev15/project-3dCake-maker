<template>
  <ion-page class="order-details-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="toolbar-custom">
        <!-- Modern Redesigned Toolbar -->
        <div class="relative bg-gradient-to-r from-[#F0E68D] via-[#E6D77A] to-[#DCC867] text-gray-800 shadow-xl">
          <!-- Background Pattern Overlay -->
          <div class="absolute inset-0 bg-black/5 opacity-20"></div>
          <div class="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-transparent"></div>

          <!-- Main Content -->
          <div class="relative px-4 py-3 sm:px-6 sm:py-4">
            <div class="flex items-center justify-between">
              <!-- Left Side - Back Button -->
              <div class="flex items-center">
                <button @click="$router.go(-1)"
                  class="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 active:scale-95 transition-all duration-200 touch-manipulation">
                  <ion-icon :icon="chevronBackOutline"
                    class="text-lg sm:text-xl text-gray-800 drop-shadow-sm group-hover:scale-110 transition-transform duration-200"></ion-icon>
                </button>
              </div>

              <!-- Center - Title Section -->
              <div class="flex-1 text-center mx-4">
                <div class="flex items-center justify-center space-x-2 sm:space-x-3">
                  <!-- Title Text -->
                  <div class="text-center">
                    <h1 class="text-lg sm:text-xl font-bold tracking-wide drop-shadow-sm text-gray-800">
                      Order Details
                    </h1>
                  </div>
                </div>
              </div>

              <!-- Right Side - Action Buttons -->
              <div class="flex items-center space-x-2">
                <!-- Status indicator or action button -->
                <div v-if="order"
                  class="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 backdrop-blur-sm rounded-xl border border-black/20">
                  <ion-icon
                    :icon="order.status === 'pending' ? timeOutline : order.status === 'accepted' ? checkmarkCircleOutline : closeCircleOutline"
                    class="relative text-lg sm:text-xl text-gray-800 drop-shadow-sm" :class="{
                      'text-yellow-600': order.status === 'pending',
                      'text-green-600': order.status === 'accepted', 
                      'text-red-600': order.status === 'declined'
                    }"></ion-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Loading State -->
      <div v-if="isLoading" class="skeleton-loading">
        <!-- Skeleton Header -->
        <div class="skeleton-header">
          <div class="skeleton-toolbar">
            <div class="skeleton-back-button"></div>
            <div class="skeleton-title">
              <div class="skeleton-title-text"></div>
              <div class="skeleton-subtitle"></div>
            </div>
            <div class="skeleton-status"></div>
          </div>
          <div class="skeleton-info-strip">
            <div class="skeleton-info-item"></div>
            <div class="skeleton-info-item"></div>
            <div class="skeleton-info-item"></div>
          </div>
        </div>

        <!-- Skeleton Order Summary -->
        <div class="skeleton-card">
          <div class="skeleton-card-header">
            <div class="skeleton-order-id"></div>
            <div class="skeleton-badge"></div>
          </div>
          <div class="skeleton-card-content">
            <div class="skeleton-detail-item">
              <div class="skeleton-icon"></div>
              <div class="skeleton-detail-content">
                <div class="skeleton-label"></div>
                <div class="skeleton-value"></div>
              </div>
            </div>
            <div class="skeleton-detail-item">
              <div class="skeleton-icon"></div>
              <div class="skeleton-detail-content">
                <div class="skeleton-label"></div>
                <div class="skeleton-value"></div>
              </div>
            </div>
            <div class="skeleton-detail-item">
              <div class="skeleton-icon"></div>
              <div class="skeleton-detail-content">
                <div class="skeleton-label"></div>
                <div class="skeleton-value"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Skeleton Order Items -->
        <div class="skeleton-section">
          <div class="skeleton-section-title"></div>
          <div class="skeleton-card">
            <div class="skeleton-item">
              <div class="skeleton-item-image"></div>
              <div class="skeleton-item-content">
                <div class="skeleton-item-title"></div>
                <div class="skeleton-item-details">
                  <div class="skeleton-badge"></div>
                  <div class="skeleton-badge"></div>
                </div>
              </div>
            </div>
            <div class="skeleton-item">
              <div class="skeleton-item-image"></div>
              <div class="skeleton-item-content">
                <div class="skeleton-item-title"></div>
                <div class="skeleton-item-details">
                  <div class="skeleton-badge"></div>
                  <div class="skeleton-badge"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State - Only show when orders have been loaded -->
      <div v-else-if="hasLoadedOrders && !order" class="error-state">
        <div class="error-content">
          <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
          <h2>Order Not Found</h2>
          <p>The order you're looking for doesn't exist or has been removed.</p>
          <ion-button router-link="/orders" expand="block" class="action-button">
            Back to Orders
          </ion-button>
        </div>
      </div>

      <!-- Order Details Content -->
      <div v-else-if="order" class="details-container">
        <!-- Order Summary Card -->
        <section class="order-section">
          <ion-card class="order-summary-card">
            <!-- Order Header with ID and Status -->
            <ion-card-header>
              <div class="flex flex-row justify-between items-start">
                <div class="order-id-container">
                  <h2 class="order-id">Order #{{ order.orderId }}</h2>
                  <p class="order-date">Placed on {{ formatDate(order.createdAt) }} at {{ formatTime(order.createdAt) }}</p>
            
                </div>
                <div>
                  <ion-badge :class="['status-badge', order.status.toLowerCase()]">
                    {{ order.status }}
                  </ion-badge>
                </div>

              </div>
            </ion-card-header>
          </ion-card>
        </section>


        <!-- Standard Order Items Section -->
        <section v-if="order.items && order.items.length > 0" class="order-section">
          <h3 class="section-title">Order Items</h3>

          <ion-card class="details-card">
            <ion-card-content>
              <!-- Empty state for no items -->
              <div v-if="!order.items.length" class="empty-items">
                <ion-icon :icon="cartOutline" class="empty-icon"></ion-icon>
                <p>No items in this order</p>
              </div>

              <!-- Items list -->
              <div v-else class="flex flex-col gap-3">
                <div v-for="(item, index) in order.items" :key="index"
                  class="flex flex-col w-full rounded-lg bg-[rgba(var(--ion-color-light-rgb),0.5)]">
                  <div class="flex gap-3 w-full p-3">
                    <div class="w-20 h-20 rounded-lg overflow-hidden">
                      <img :src="getItemImage(item)" :alt="item.name" class="w-full h-full object-cover" />
                    </div>
                    <div class="flex flex-col w-full">
                      <p class="text-[#58091F] font-semibold text-base mb-1">{{ item.name || 'Unnamed Item' }}</p>
                      <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2">
                          <span class="text-gray-500 text-sm">Quantity:</span>
                          <span class="font-semibold text-[#58091F] text-base">{{ item.quantity || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Order summary (subtotal, shipping, total) -->
                <div class="mt-4 p-4 border-t border-gray-200">
                  <div class="flex justify-between items-center py-2 text-gray-600">
                    <span>Subtotal</span>
                    <span>₱{{ calculateSubtotal(order).toFixed(2) }}</span>
                  </div>

                  <div
                    class="flex justify-between items-center py-2 mt-2 pt-2 border-t border-dashed border-gray-200 font-semibold text-[#58091F]">
                    <span>Total</span>
                    <span>₱{{ order.totalAmount?.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </section>
      </div>

      <!-- Extended Loading State - Show when not loading but orders might not be loaded yet -->
      <div v-else class="loading-state">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Retrieving order details...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// @ts-nocheck
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, 
         IonBackButton, IonIcon, IonSpinner, IonButton, IonCard, IonCardHeader, 
         IonCardTitle, IonCardContent, IonBadge, IonChip, IonLabel, 
         IonCardSubtitle, IonList, IonItem, IonThumbnail, IonText } from '@ionic/vue';
import { calendarOutline, timeOutline, cashOutline, alertCircleOutline, 
         arrowBack, pricetagOutline, cartOutline, locationOutline,
         chatbubbleOutline, checkmarkCircleOutline, bicycleOutline, checkmarkDoneCircleOutline,
         chevronBackOutline, closeCircleOutline } from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';
import { useOrderStore } from '../../stores/orderStore';
import { computed, ref, onMounted, watch } from 'vue';

// Type definitions
interface BaseOrder {
  orderId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
  notes?: string;
  phone?: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  imageUrl?: string;
}



const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();

const isLoading = ref(true);
const hasLoadedOrders = ref(false);
const currentOrder = ref<Order | null>(null);



// Update loadOrderData to store the current order
const loadOrderData = async () => {
  try {
    await orderStore.loadOrders();
    
    // Check if the current order was found
    const orderId = route.params.id as string;
    currentOrder.value = orderStore.orders.find(o => o.orderId === orderId) || null;
    
    // If orders array exists but current order not found, try one more time
    if (orderStore.orders.length > 0 && !currentOrder.value) {
      await orderStore.loadOrders();
      currentOrder.value = orderStore.orders.find(o => o.orderId === orderId) || null;
    }
    
    hasLoadedOrders.value = true;
  } catch (error) {
    console.error('Error loading orders:', error);
    hasLoadedOrders.value = true;
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
};

onMounted(() => {
  loadOrderData();
});

// Helper functions for date formatting
const formatDate = (timestamp: number | string): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const formatTime = (timestamp: number | string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};

const getTimeAgo = (timestamp: number | string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return 'Just now';
};

// Get appropriate image URL for an item
const getItemImage = (item: any): string => {
  // For custom cakes with embedded image data
  if (item.isCustomCake && item.customDetails && item.customDetails.imageUrl) {
    return item.customDetails.imageUrl;
  }
  
  // For items with regular image URL
  if (item.imageUrl) {
    // Check if it's a relative path or full URL
    if (item.imageUrl.startsWith('http')) {
      return item.imageUrl;
    } else {
      // Assuming relative paths are from your server
      return item.imageUrl;
    }
  }
  
  // Default image
  return 'https://via.placeholder.com/100?text=No+Image';
};

// Calculate subtotal from items - with type assertion
const calculateSubtotal = (order: any): number => {
  if (!order.items || !Array.isArray(order.items)) return 0;
  
  return order.items.reduce((total: number, item: any) => {
    const price = item.unitPrice || 0;
    const quantity = item.quantity || 0;
    return total + (price * quantity);
  }, 0);
};

// Update the template to use currentOrder instead of order computed
const order = computed(() => currentOrder.value);

</script>

<style scoped>
.order-details-page {
  --background: var(--ion-color-light);
}

ion-header {
  --background: transparent;
}

.details-container {
  padding: 12px;
  max-width: 800px;
  margin: 0 auto;
}

/* Section Layout */
.order-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #58091F;
  margin: 0 0 12px 4px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(240, 230, 141, 0.4);
}

/* Order Summary Card */
.order-summary-card {
  margin: 0 0 16px;
  border-radius: 8px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

ion-card-header {
  padding: 16px 16px 8px;
}

ion-card-content {
  padding: 8px 16px 20px;
}



.order-summary-content {
  padding: 12px 0;
}

.order-id-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-id {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ion-color-dark);
  margin: 0;
  letter-spacing: -0.3px;
}

.order-date {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  margin: 0;
}

.order-type-container {
  margin-bottom: 12px;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 4px 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  display: block;
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  margin: 0;
}

.detail-value {
  font-size: 1rem;
  font-weight: 500;
  color: var(--ion-color-dark);
  margin: 0;
}

.price-item .detail-value.price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #58091F;
}

.status-text {
  font-weight: 600;
}

.status-text.pending {
  color: #b37e00;
}

.status-text.processing {
  color: #0040a0;
}

.status-text.completed {
  color: #157539;
}

.status-text.cancelled {
  color: #a01a30;
}

.status-badge {
  --padding-start: 10px;
  --padding-end: 10px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  height: auto;
  border-radius: 8px;
  text-transform: capitalize;
  font-weight: 500;
  font-size: 0.8rem;
  margin-top: 2px;
  padding: 0.6rem;
}

.status-badge.pending {
  --background: rgba(255, 196, 9, 0.2);
  --color: #b37e00;
}


.status-badge.accepted {
  --background: rgba(45, 211, 111, 0.2);
  --color: #157539;
}

.status-badge.declined {
  --background: rgba(235, 68, 90, 0.2);
  --color: #a01a30;
}

/* Details Cards */
.details-card {
  margin: 0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

ion-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #58091F;
}

ion-card-subtitle {
  --color: #58091F;
  font-weight: 500;
  margin-bottom: 4px;
}

/* Custom Cake Content */
.custom-cake-content {
  padding: 0 4px;
}

.custom-description {
  margin-bottom: 24px;
  color: var(--ion-color-medium);
  line-height: 1.6;
}

.pricing-status-container {
  background: rgba(var(--ion-color-light-rgb), 0.5);
  border-radius: 12px;
  padding: 8px;
}

.status-heading {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--ion-color-dark);
}

.status-timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 0 8px;
}

.timeline-connector {
  position: absolute;
  top: 15px;
  left: 24px;
  right: 24px;
  height: 2px;
  background: var(--ion-color-light-shade);
  z-index: 1;
}

.timeline-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  z-index: 2;
}

.timeline-marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ion-color-light-shade);
  border: 2px solid white;
  margin-bottom: 8px;
}

.timeline-item.active .timeline-marker {
  background: #F0E68D;
  border-color: #58091F;
}

.timeline-content {
  text-align: center;
  padding: 0 8px;
}

.timeline-title {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  font-weight: 500;
}

.timeline-date {
  font-size: 0.7rem;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

.timeline-item.active .timeline-title {
  color: #58091F;
  font-weight: 600;
}

.timeline-item.completed:before {
  content: '';
  position: absolute;
  top: 15px;
  left: -50%;
  width: 100%;
  height: 2px;
  background: #F0E68D;
  z-index: 1;
}

/* Customer Notes */
.customer-notes {
  color: var(--ion-color-medium);
  line-height: 1.6;
  white-space: pre-wrap;
  font-style: italic;
}

/* Order Items List */
.item-list {
  background: transparent;
}

.order-item {
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
  margin-bottom: 8px;
  border-radius: 8px;
  --background: rgba(var(--ion-color-light-rgb), 0.5);
}

.item-image {
  --border-radius: 6px;
  --size: 60px;
  margin: 8px;
}

.order-item h3 {
  font-weight: 600;
  color: var(--ion-color-dark);
  font-size: 0.95rem;
  margin-bottom: 4px;
  text-align: left;
}

.item-price {
  font-weight: 600;
  color: #58091F;
  padding: 0 16px;
}

.order-summary {
  padding: 16px;
  border-top: 1px solid rgba(var(--ion-color-light-shade-rgb), 0.5);
  margin-top: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.summary-row.total {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed rgba(var(--ion-color-medium-rgb), 0.2);
  font-weight: 700;
  font-size: 1rem;
  color: #58091F;
}

/* Empty State */
.empty-items {
  padding: 32px 16px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 64px 0;
  gap: 16px;
}

.loading-state p {
  color: var(--ion-color-medium);
}

/* Error State */
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 48px 16px;
}

.error-content {
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  max-width: 320px;
}

.error-icon {
  font-size: 48px;
  color: var(--ion-color-danger);
  margin-bottom: 16px;
}

.error-content h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--ion-color-dark);
}

.error-content p {
  margin: 0 0 24px;
  color: var(--ion-color-medium);
  line-height: 1.5;
}

.action-button {
  --background: #58091F;
  --border-radius: 8px;
  --box-shadow: 0 4px 12px rgba(88, 9, 31, 0.3);
  font-weight: 600;
}

@media (max-width: 480px) {
  .details-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .timeline-title {
    font-size: 0.7rem;
  }
  
  .order-item {
    flex-direction: column;
  }
  
  .order-section {
    margin-bottom: 16px;
  }
  
  .section-title {
    font-size: 1rem;
  }
}

@media (max-width: 600px) {
  .order-summary-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .summary-column {
    gap: 16px;
  }
}

.detail-value.success {
  color: #157539;
  font-weight: 600;
}

.detail-item ion-icon {
  font-size: 1.8rem;
  min-width: 24px;
  color: #58091F;
}

.custom-chip ion-icon,
.standard-chip ion-icon {
  font-size: 1.4rem;
  padding-right: 10px;
}

.order-type-container ion-chip {
  --padding-start: 10px;
  --padding-end: 10px;
  height: auto;
  padding: 8px 4px;
}

/* Enhanced Item Styling */
.item-container {
  display: flex;
  width: 100%;
  padding: 12px;
  gap: 16px;
  background: rgba(var(--ion-color-light-rgb), 0.5);
  border-radius: 12px;
  margin-bottom: 12px;
}

.item-image {
  --size: 100px;
  --border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0px;
}

.item-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #58091F;
  margin: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-description {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.size-badge,
.flavor-badge,
.occasion-badge {
  --background: rgba(240, 230, 141, 0.2);
  --color: #58091F;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.quantity-label {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.quantity-value {
  font-weight: 600;
  color: #58091F;
  font-size: 1rem;
}

.item-price-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.unit-price {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.total-price {
  font-weight: 600;
  color: #58091F;
  font-size: 1.1rem;
}

@media (max-width: 480px) {
  .item-container {
    flex-direction: row;
    align-items: center;
    text-align: center;
  }

  .item-image {
    --size: 150px;
    margin-bottom: 12px;
  }

  .item-meta {
    justify-content: center;
  }

  .item-quantity,
  .item-price-details {
    align-items: center;
  }
}

/* Simplified Custom Cake Details Styles */
.custom-cake-details {
  margin-top: 8px;
  padding: 8px;
  background: rgba(240, 230, 141, 0.1);
  border-radius: 6px;
}

.toppings-list {
  display: none;
}

.topping-item {
  display: none;
}

.topping-name {
  display: none;
}

.topping-price {
  display: none;
}

.toppings-total {
  display: none;
}

/* Skeleton Loading Styles */
.skeleton-loading {
  padding: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.skeleton-header {
  background: linear-gradient(to right, #F0E68D, #E6D77A, #DCC867);
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
}

.skeleton-toolbar {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.skeleton-back-button {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  animation: pulse 1.5s infinite;
}

.skeleton-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title-text {
  width: 60%;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  animation: pulse 1.5s infinite;
}

.skeleton-subtitle {
  width: 40%;
  height: 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.skeleton-status {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  animation: pulse 1.5s infinite;
}

.skeleton-info-strip {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.skeleton-info-item {
  width: 80px;
  height: 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.skeleton-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.skeleton-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.skeleton-order-id {
  width: 40%;
  height: 24px;
  background: #f0f0f0;
  border-radius: 6px;
  animation: pulse 1.5s infinite;
}

.skeleton-badge {
  width: 80px;
  height: 24px;
  background: #f0f0f0;
  border-radius: 12px;
  animation: pulse 1.5s infinite;
}

.skeleton-detail-item {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.skeleton-icon {
  width: 24px;
  height: 24px;
  background: #f0f0f0;
  border-radius: 6px;
  animation: pulse 1.5s infinite;
}

.skeleton-detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-label {
  width: 30%;
  height: 16px;
  background: #f0f0f0;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.skeleton-value {
  width: 60%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.skeleton-section {
  margin-bottom: 24px;
}

.skeleton-section-title {
  width: 30%;
  height: 24px;
  background: #f0f0f0;
  border-radius: 6px;
  margin-bottom: 16px;
  animation: pulse 1.5s infinite;
}

.skeleton-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  margin-bottom: 12px;
  background: #f8f8f8;
  border-radius: 12px;
}

.skeleton-item-image {
  width: 100px;
  height: 100px;
  background: #f0f0f0;
  border-radius: 8px;
  animation: pulse 1.5s infinite;
}

.skeleton-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-item-title {
  width: 70%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.skeleton-item-details {
  display: flex;
  gap: 8px;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}

@media (max-width: 480px) {
  .skeleton-item {
    flex-direction: column;
  }
  
  .skeleton-item-image {
    width: 100%;
    height: 150px;
  }
  
  .skeleton-info-strip {
    flex-direction: column;
    gap: 8px;
  }
  
  .skeleton-info-item {
    width: 100%;
  }
}

.debug-info {
  margin-top: 8px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.debug-info p {
  margin: 2px 0;
}

.no-toppings {
  padding: 8px;
  text-align: center;
  color: var(--ion-color-medium);
  font-style: italic;
  font-size: 0.9rem;
}
</style> 