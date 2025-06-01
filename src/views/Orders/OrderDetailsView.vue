<template>
  <ion-page class="order-details-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/orders" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="details-title ion-text-center pr-12" >Order Details</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Loading order details...</p>
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
              <div class="order-header-content">
                <div class="order-id-container">
                  <h2 class="order-id">Order #{{ order.orderId }}</h2>
                  <p class="order-date">Placed on {{ formatDate(order.createdAt) }}</p>
                </div>
                <ion-badge :class="['status-badge', order.status.toLowerCase()]">
                  {{ order.status }}
                </ion-badge>
              </div>
            </ion-card-header>
            
            <ion-card-content>
              <div class="order-summary-content">
                <!-- Order Type -->
                <!-- <div class="order-type-container">
                  <ion-chip :class="{'custom-chip': isCustomOrder(order), 'standard-chip': !isCustomOrder(order)}">
                    <ion-label class="px-1">{{ !isCustomOrder(order) ? 'Custom Cake' : 'Standard Cake' }}</ion-label>
                  </ion-chip>
                </div> -->
                
                <!-- Order Details List -->
                <div class="details-list">
                  <!-- Date and Time -->
                  <div class="flex items-center flex-row gap-2">
                    <ion-icon class="text-2xl" :icon="calendarOutline"></ion-icon>
                    <div class="detail-content">
                      <span class="detail-label">Order Date</span>
                      <span class="detail-value">{{ formatDate(order.createdAt) }}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center flex-row gap-2">
                    <ion-icon class="text-2xl" :icon="timeOutline"></ion-icon>
                    <div class="detail-content">
                      <span class="detail-label">Order Time</span>
                      <span class="detail-value">{{ formatTime(order.createdAt) }}</span>
                    </div>
                  </div>
                  
                  <!-- Order Cost -->
                  <div class="flex items-center flex-row gap-2">
                    <ion-icon class="text-2xl" :icon="cashOutline"></ion-icon>
                    <div class="detail-content">
                      <span class="detail-label">Total Amount</span>
                      <template v-if="order.total">
                        
                        <span class="detail-value price">₱{{ order.total.toFixed(2) }}</span>
                      </template>
                      <template v-else>
                        <ion-badge class="pricing-badge">Pending Pricing</ion-badge>
                        
                      </template>
                    </div>
                  </div>
                  
                  <!-- Order Status -->
                  <!-- <div class="detail-item">
                    <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                    <div class="detail-content">
                      <span class="detail-label">Status</span>
                      <span class="detail-value status-text" :class="order.status.toLowerCase()">
                        {{ order.status }}
                      </span>
                    </div>
                  </div> -->
                </div>
              </div>
            </ion-card-content>
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
              <ion-list v-else class="item-list">
                <ion-item v-for="(item, index) in order.items" :key="index" class="order-item" lines="none">
                  <div class="item-container">
                    <ion-thumbnail slot="start" class="item-image">
                      <img :src="getItemImage(item)" :alt="item.name" />
                    </ion-thumbnail>
                    
                    <div class="item-details">
                      <h3 class="item-name">{{ item.name || 'Unnamed Item' }}</h3>
                      
                      <div class="item-info">
                        <!-- Custom cake details -->
                        <div v-if="item.isCustomCake && item.customDetails" class="custom-cake-details">
                     
                          <div class="item-meta">
                            <ion-badge v-if="item.size" class="size-badge">
                              Size: {{ item.size }}
                            </ion-badge>
                            
                            <ion-badge v-if="item.customDetails.layers" class="layers-badge">
                              Layers: {{ item.customDetails.layers }}
                            </ion-badge>
                            
                            <ion-badge v-if="item.customDetails.flavor?.name" class="flavor-badge">
                              Flavor: {{ item.customDetails.flavor.name }}
                            </ion-badge>
                        </div>
                          
                          <div v-if="item.customDetails.message" class="cake-message">
                            <span class="message-label">Message:</span>
                            <span class="message-text">"{{ item.customDetails.message }}"</span>
                          </div>
                          
                          <div v-if="item.customDetails.designData" class="design-details">
                            <div v-if="item.customDetails.designData.toppings && item.customDetails.designData.toppings.length" class="toppings-list">
                              <span class="toppings-label">Toppings:</span>
                              <div class="topping-items">
                                <ion-badge 
                                  v-for="(topping, idx) in item.customDetails.designData.toppings" 
                                  :key="idx" 
                                  class="topping-badge"
                                >
                                  {{ topping.name }}
                                </ion-badge>
                              </div>
                            </div>
                            
                            <div v-if="item.customDetails.designData.decorations && item.customDetails.designData.decorations.length" class="decorations-list">
                              <span class="decorations-label">Decorations:</span>
                              <div class="decoration-items">
                                <ion-badge 
                                  v-for="(decoration, idx) in item.customDetails.designData.decorations" 
                                  :key="idx" 
                                  class="decoration-badge"
                                >
                                  {{ decoration.name }}
                                </ion-badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Standard cake details -->
                        <div v-else class="item-meta">
                          <ion-badge v-if="item.size" class="size-badge">
                            Size: {{ item.size }}
                          </ion-badge>
                          
                          <ion-badge v-if="item.flavor" class="flavor-badge">
                            Flavor: {{ item.flavor }}
                          </ion-badge>
                          
                          <ion-badge v-if="item.occasion" class="occasion-badge">
                            {{ item.occasion }}
                          </ion-badge>
                        </div>
                        
                        <div class="item-quantity">
                          <span class="quantity-label">Quantity:</span>
                          <span class="quantity-value">{{ item.quantity || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ion-item>
                
                <!-- Order summary (subtotal, shipping, total) -->
                <div class="order-summary">
                  <div class="summary-row">
                    <span>Subtotal</span>
                    <span>₱{{ calculateSubtotal(order).toFixed(2) }}</span>
                  </div>
                  <div class="summary-row total">
                    <span>Total</span>
                    <span>₱{{ order.total?.toFixed(2) || '0.00' }}</span>
                  </div>
                </div>
              </ion-list>
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
         chatbubbleOutline, checkmarkCircleOutline, bicycleOutline, checkmarkDoneCircleOutline } from 'ionicons/icons';
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
  shippingAddress?: ShippingAddress;
  shippingCost?: number;
  hasCustomItems?: boolean;
  hasRegularItems?: boolean;
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

interface CustomOrder extends BaseOrder {
  hasCustomItems: true;
  hasRegularItems: false;
  pricingStatus: 'pending' | 'priced' | 'accepted';
  totalAmount?: number;
  updatedAt: number;
  items: {
    needsPricing: boolean;
  };
}

interface NonCustomOrder extends BaseOrder {
  hasCustomItems: false;
  hasRegularItems: true;
  type: 'non-custom';
  totalAmount: number;
  items: OrderItem[];
}

const route = useRoute();

const orderStore = useOrderStore();
const isLoading = ref(true);
const hasLoadedOrders = ref(false);

// Type guard for custom order
const isCustomOrder = (order: any): order is CustomOrder => {
  return order?.isCustomCake === true;
};

// Type guard for non-custom order
const isNonCustomOrder = (order: any): order is NonCustomOrder => {
  return order?.hasRegularItems === true;
};

const order = computed(() => {
  const orderId = route.params.id as string;
  console.log(`Looking for order ${orderId}`);
  
  const foundOrder = orderStore.orders.find(o => o.orderId === orderId);
  console.log('Found order:', foundOrder);
  return foundOrder;
});

// Reset loading state when route params change
watch(() => route.params.id, () => {
  isLoading.value = true;
  loadOrderData();
});

// Function to load order data
const loadOrderData = async () => {
  try {
    await orderStore.loadOrders();
    console.log('All orders:', orderStore.orders);
    
    // Check if the current order was found
    const orderId = route.params.id as string;
    const currentOrder = orderStore.orders.find(o => o.orderId === orderId);
    
    // If orders array exists but current order not found, try one more time
    if (orderStore.orders.length > 0 && !currentOrder) {
      console.log('Order not found in initial load, retrying...');
      await orderStore.loadOrders();
    }
    
    hasLoadedOrders.value = true;
  } catch (error) {
    console.error('Error loading orders:', error);
    hasLoadedOrders.value = true;
  } finally {
    // Add a small delay to ensure loading state is visible
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

// Helper function to estimate delivery date (3-5 business days from order date)


// Computed properties for conditional rendering

</script>

<style scoped>
.order-details-page {
  --background: var(--ion-color-light);
}

ion-header {
  --background: transparent;
}

ion-toolbar {
  --background: #F0E68D;
  --color: #58091F;
  --border-width: 0;
}

.details-title {
  font-weight: 600;
  font-size: 1.25rem;
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
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

ion-card-header {
  padding: 16px 16px 8px;
}

ion-card-content {
  padding: 8px 16px 20px;
}

.order-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 4px 0;
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

.status-badge.processing {
  --background: rgba(56, 128, 255, 0.2);
  --color: #0040a0;
}

.status-badge.completed {
  --background: rgba(45, 211, 111, 0.2);
  --color: #157539;
}

.status-badge.cancelled {
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

/* Custom cake details */
.custom-cake-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  background-color: rgba(240, 230, 141, 0.1);

  border-radius: 8px;
}

.cake-message {
  margin-top: 4px;
  font-style: italic;
}

.message-label {
  font-weight: 600;
  color: var(--ion-color-medium);
  margin-right: 6px;
}

.message-text {
  color: #58091F;
}

.design-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toppings-list,
.decorations-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toppings-label,
.decorations-label {
  font-weight: 600;
  color: var(--ion-color-medium);
}

.topping-items,
.decoration-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.topping-badge,
.decoration-badge {
  --background: rgba(240, 230, 141, 0.3);
  --color: #58091F;
  font-size: 0.75rem;
  font-weight: 500;
}

.layers-badge {
  --background: rgba(240, 230, 141, 0.2);
  --color: #58091F;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
}
</style> 