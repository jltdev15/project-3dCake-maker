<template>
  <ion-page class="orders-page">
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
                      My Orders
                    </h1>
                    <p class="text-xs sm:text-sm opacity-70 font-medium tracking-wide mt-0.5 text-gray-700">
                      Track your order history
                    </p>
                  </div>
                </div>
              </div>

              <!-- Right Side - Action Buttons -->
              <div class="flex items-center space-x-2">
                <!-- Refresh Button -->
                <button @click="handleRefresh({ target: { complete: () => {} } })"
                  class="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 active:scale-95 transition-all duration-200 touch-manipulation overflow-hidden">
                  <!-- Button Background Effect -->
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-[#F0E68D]/30 to-[#DCC867]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  </div>

                  <!-- Refresh Icon -->
                  <ion-icon :icon="refreshOutline"
                    class="relative text-lg sm:text-xl text-gray-800 drop-shadow-sm group-hover:scale-110 transition-transform duration-200"></ion-icon>
                </button>
              </div>
            </div>


          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      
      <!-- Filter controls -->
      <div class="filter-container" v-if="!isLoading && orderStore.orders.length > 0">
        <div class="filter-wrapper">
          <button 
            v-for="filter in filters" 
            :key="filter.value"
            :class="['filter-button', { active: activeFilter === filter.value }]"
            @click="activeFilter = filter.value"
          >
            <ion-icon :icon="filter.icon" class="filter-icon"></ion-icon>
            <span>{{ filter.label }}</span>
            <span v-if="filter.count" class="filter-count">{{ filter.count }}</span>
          </button>
        </div>
      </div>
      
      <div class="orders-container">
        <!-- Loading skeleton -->
        <div v-if="isLoading" class="orders-list">
          <div class="section-header">
            <h2>Order History</h2>
          </div>
          
          <div class="orders-list">
            <div v-for="n in 3" :key="n" class="order-card skeleton">
              <div class="order-card-header">
                <div class="order-info">
                  <div class="skeleton-text skeleton-title"></div>
                  <div class="skeleton-text skeleton-subtitle"></div>
                </div>
                <div class="skeleton-badge"></div>
              </div>
              <div class="order-card-content">
                <div class="detail-item">
                  <div class="skeleton-circle"></div>
                  <div class="skeleton-text"></div>
                </div>
                <div class="detail-item">
                  <div class="skeleton-circle"></div>
                  <div class="skeleton-text"></div>
                </div>
                <!-- Add skeleton image placeholder -->
                <div class="skeleton-image"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="orderStore.orders.length === 0" class="empty-state">
          <ion-icon :icon="cartOutline" class="empty-state-icon"></ion-icon>
          <h2>No Orders Yet</h2>
          <p>Start creating your delicious cake masterpiece today!</p>
          <button @click="$router.push('/home')"
            class="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white font-bold text-lg md:text-base uppercase tracking-wide rounded-2xl md:rounded-xl min-h-[56px] md:min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation max-w-[240px] w-full">
            Start Shopping
            <ion-icon :icon="arrowForward" class="text-xl"></ion-icon>
          </button>
        </div>
        
        <!-- Orders list -->
        <div v-else class="orders-list">
          <div class="section-header">
 
            <ion-searchbar
              v-model="searchQuery"
              placeholder="Search orders"
              animated
              class="orders-searchbar"
            ></ion-searchbar>
          </div>

          <div v-if="filteredOrders.length === 0" class="no-results">
            <ion-icon :icon="searchOutline" class="no-results-icon"></ion-icon>
            <p>No orders match your search</p>
          </div>

          <div v-else class="orders-list">
            <ion-card 
              v-for="order in filteredOrders" 
              :key="order.orderId" 
              class="order-card"
              @click="navigateToOrderDetails(order.orderId)"
            >
              <div class="order-card-header">
                <div class="order-info">
                  <h3>#{{ order.orderId }}</h3>
                  <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                </div>
                <ion-badge :class="['status-badge', order.status.toLowerCase()]">
                  {{ order.status }}
                </ion-badge>
              </div>
              
              <div class="order-card-content">
                <div class="order-details">
                  <!-- Add cake image -->
                  <div class="cake-image-container" v-if="getOrderImageUrl(order)">
                    <img :src="getOrderImageUrl(order)" alt="Cake" class="cake-thumbnail">
                  </div>
                  
                  <div class="detail-row">
                    <ion-icon :icon="timeOutline"></ion-icon>
                    <span>{{ getTimeAgo(order.createdAt) }}</span>
                  </div>
                  
                  <div class="detail-row">
                    <ion-icon :icon="pricetagOutline"></ion-icon>
                    <span class="order-type">{{ isCustomOrder(order) ? 'Custom Order' : 'Standard Order' }}</span>
                  </div>
                  
                  <div class="detail-row">
                    <ion-icon :icon="cashOutline"></ion-icon>
                    <span class="order-total">
                      <template v-if="order.totalAmount">
                        ₱{{ order.totalAmount.toFixed(2) }}
                      </template>
    
                    </span>
                  </div>
                </div>
                
                <ion-button fill="clear" class="view-details-btn">
                  View Details
                  <ion-icon :icon="chevronForward" slot="end"></ion-icon>
                </ion-button>
              </div>
            </ion-card>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// @ts-nocheck
import 
{ IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonButton,
         IonRefresher, IonRefresherContent, IonCard, IonBadge, IonSegment, 
         IonSegmentButton, IonLabel, IonSearchbar, IonBackButton, IonButtons } from '@ionic/vue';
import { 
  cartOutline, calendarOutline, cashOutline, arrowForward, pricetagOutline,
  timeOutline, chevronForward, searchOutline, listOutline, checkmarkCircleOutline,
  closeCircleOutline, timeOutline as pendingIcon, chevronBackOutline, refreshOutline,
  receiptOutline
} from 'ionicons/icons';
import { useOrderStore } from '../../stores/orderStore';
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted, ref, computed } from 'vue';

// Type definitions
interface BaseOrder {
  orderId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

interface NonCustomOrder extends BaseOrder {
  type: 'non-custom';
  totalAmount: number;
  items: {
    imageUrl: string;
    [key: string]: any;
  }[];
}

// Define structure for items within a CustomOrder in Firebase (matching orderStore.ts)
interface CustomOrderItem {
  cakeId?: string;
  id?: string;
  customDetails?: {
    id?: string;
    imageUrl?: string;
    [key: string]: any;
  };
  imageUrl?: string;
  isCustomCake?: boolean;
  name?: string;
  quantity?: number;
  size?: string;
  totalPrice?: number;
  unitPrice?: number;
  [key: string]: any;
}

interface CustomOrder extends BaseOrder {
  orderType: 'custom';
  // pricingStatus: 'pending' | 'priced' | 'accepted'; // Removed
  totalAmount?: number;
  updatedAt: number;
  designUrl?: string;
  imageUrl?: string;
  items: CustomOrderItem[]; // Changed to array of CustomOrderItem
}

type Order = NonCustomOrder | CustomOrder;

const orderStore = useOrderStore();
const router = useRouter();
const isLoading = ref(true);
const searchQuery = ref('');
const activeFilter = ref('all');

// Load orders on component mount
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
  activeFilter.value = 'all';
  searchQuery.value = '';
  await loadOrders();
  if (event.target) {
    (event.target as HTMLIonRefresherElement).complete();
  }
};

// Filtered orders based on search query and active filter
const filteredOrders = computed(() => {
  let filtered = [...orderStore.orders];
  
  // Apply status filter
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(order => 
      order.status.toLowerCase() === activeFilter.value.toLowerCase()
    );
  }
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order => 
      order.orderId.toLowerCase().includes(query) || 
      order.customerName.toLowerCase().includes(query)
    );
  }
  
  // Sort by date (newest first)
  return filtered.sort((a, b) => b.createdAt - a.createdAt);
});

// Helper functions
const isCustomOrder = (order: any): order is CustomOrder => {
  return order.orderType === 'custom';
};

const isNonCustomOrder = (order: any): order is NonCustomOrder => {
  return order.type === 'non-custom';
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const getTimeAgo = (timestamp: number): string => {
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

const navigateToOrderDetails = (orderId: string) => {
  router.push(`/orders/${orderId}`);
};

// Function to get image URL from order
const getOrderImageUrl = (order: any): string | undefined => {
  // For non-custom orders, get the first item's image
  if (isNonCustomOrder(order) && order.items && order.items.length > 0) {
    return order.items[0].imageUrl;
  }
  
  // For custom orders, check if there's a designUrl or imageUrl
  if (isCustomOrder(order)) {
    if (order.designUrl) return order.designUrl;
    if (order.imageUrl) return order.imageUrl;
  }
  
  return undefined;
};

// Add filters configuration
const filters = computed(() => [
  {
    label: 'All',
    value: 'all',
    icon: listOutline,
    count: orderStore.orders.length
  },
  {
    label: 'Pending',
    value: 'pending',
    icon: pendingIcon,
    count: orderStore.orders.filter(order => order.status.toLowerCase() === 'pending').length
  },
  {
    label: 'Accepted',
    value: 'accepted',
    icon: checkmarkCircleOutline,
    count: orderStore.orders.filter(order => order.status.toLowerCase() === 'accepted').length
  },
  {
    label: 'Declined',
    value: 'declined',
    icon: closeCircleOutline,
    count: orderStore.orders.filter(order => order.status.toLowerCase() === 'declined').length
  }
]);
</script>

<style scoped>
.orders-page {
  --background: var(--ion-color-light);
}

ion-header {
  --background: transparent;
}

.filter-container {
  background: var(--ion-color-light);
  padding: 24px 20px;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.filter-wrapper {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 4px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  -webkit-overflow-scrolling: touch;
  max-width: 1200px;
  margin: 0 auto;
}

.filter-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 24px;
  background: var(--ion-color-light-shade);
  color: var(--ion-color-medium);
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: fit-content;
  position: relative;
  height: 48px;
}

.filter-button:hover {
  background: var(--ion-color-light-shade);
  color: var(--ion-color-dark);
  transform: translateY(-1px);
}

.filter-button.active {
  background: #F0E68D;
  color: #58091F;
  box-shadow: 0 4px 12px rgba(240, 230, 141, 0.3);
  transform: translateY(-1px);
}

.filter-icon {
  font-size: 1.25rem;
}

.filter-count {
  background: rgba(88, 9, 31, 0.1);
  color: #58091F;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 28px;
  text-align: center;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-button.active .filter-count {
  background: rgba(88, 9, 31, 0.2);
}

@media (max-width: 768px) {
  .filter-container {
    padding: 20px 16px;
  }

  .filter-button {
    padding: 10px 20px;
    font-size: 0.95rem;
    height: 44px;
  }

  .filter-icon {
    font-size: 1.2rem;
  }

  .filter-count {
    padding: 3px 8px;
    font-size: 0.85rem;
    min-width: 26px;
    height: 26px;
  }
}

@media (max-width: 480px) {
  .filter-container {
    padding: 16px 12px;
  }

  .filter-button {
    padding: 8px 16px;
    font-size: 0.9rem;
    height: 40px;
  }

  .filter-icon {
    font-size: 1.1rem;
  }

  .filter-count {
    padding: 2px 6px;
    font-size: 0.8rem;
    min-width: 24px;
    height: 24px;
  }
}

.orders-container {
  padding: 16px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--ion-color-dark);
}

.orders-searchbar {
 
  --border-radius: 8px;
  --box-shadow: none;
  --placeholder-opacity: 0.7;
  margin-bottom: 8px;
  padding: 0;
  border-bottom: 1px solid var(--ion-color-light-shade);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  margin: 0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--ion-color-light-shade);
}

.order-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--ion-color-dark);
}

.order-date {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
}

.status-badge {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 6px;
  --padding-bottom: 6px;
  height: auto;
  border-radius: 6px;
  text-transform: capitalize;
  font-weight: 500;
  font-size: 0.75rem;
  padding:0.6rem;
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

.order-card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-row ion-icon {
  font-size: 1.1rem;
  color: var(--ion-color-medium);
}

.order-type {
  font-weight: 500;
  color: var(--ion-color-dark);
}

.order-total {
  font-weight: 600;
  color: var(--ion-color-dark);
}

.pricing-badge {
  --background: rgba(var(--ion-color-warning-rgb), 0.2);
  --color: var(--ion-color-warning-shade);
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
}

.view-details-btn {
  --color: var(--ion-color-primary);
  font-weight: 500;
  margin: 0;
  font-size: 0.9rem;
  text-transform: none;
  height: 36px;
  align-self: flex-end;
  margin-left: auto;
}

/* Empty state styles */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 16px;
  min-height: 60vh;
}

.empty-state-icon {
  font-size: 64px;
  color: #58091F;
  margin-bottom: 24px;
  background: rgba(240, 230, 141, 0.2);
  padding: 24px;
  border-radius: 50%;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #58091F;
}

.empty-state p {
  font-size: 1rem;
  color: #666;
  margin: 0 0 24px;
  max-width: 300px;
}

/* No results state */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
}

.no-results-icon {
  font-size: 48px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.no-results p {
  color: var(--ion-color-medium);
  font-size: 1rem;
  margin: 0;
}

/* Skeleton styles */
.skeleton {
  pointer-events: none;
}

.skeleton-text {
  height: 16px;
  background: linear-gradient(90deg, 
    rgba(0,0,0,0.06) 0%, 
    rgba(0,0,0,0.1) 50%, 
    rgba(0,0,0,0.06) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  width: 70%;
}

.skeleton-title {
  height: 20px;
  width: 120px;
  margin-bottom: 8px;
}

.skeleton-subtitle {
  height: 14px;
  width: 80px;
}

.skeleton-badge {
  height: 24px;
  width: 80px;
  background: linear-gradient(90deg, 
    rgba(0,0,0,0.06) 0%, 
    rgba(0,0,0,0.1) 50%, 
    rgba(0,0,0,0.06) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

.skeleton-circle {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(90deg, 
    rgba(0,0,0,0.06) 0%, 
    rgba(0,0,0,0.1) 50%, 
    rgba(0,0,0,0.06) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-image {
  height: 120px;
  width: 100%;
  background: linear-gradient(90deg, 
    rgba(0,0,0,0.06) 0%, 
    rgba(0,0,0,0.1) 50%, 
    rgba(0,0,0,0.06) 100%);
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

@media (min-width: 768px) {
  .orders-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  
  .section-header h2 {
    font-size: 1.75rem;
  }
}

/* Cake image styles */
.cake-image-container {
  margin-bottom: 12px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.cake-thumbnail {
  width: 100%;
  max-width: 150px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style> 