<template>
  <ion-page class="home-page">
    <!-- Custom Header -->
    <div class="custom-header" :class="{ 'pointer-events-none opacity-50': shouldShowModal }">
      <div class="header-top">
        <div class="px-3">
          <span class="location-text">
            {{ auth.user?.name ? `Hello, ${auth.user.name}` : 'Welcome!' }}
          </span>
          <p class="text-sm text-[#58091F]">You have arrived at the right place for cakes</p>
        </div>
        <div class="header-actions">

          <ion-button fill="clear" class="icon-btn notification-btn" @click="goToNotifications">
            <ion-icon :icon="notifications" />
            <div v-if="orderNotification.unreadCount > 0" class="notification-dot"></div>
          </ion-button>
        </div>
      </div>
      <div class="search-bar-wrapper">
        <ion-searchbar 
          v-model="searchQuery" 
          placeholder="Search cakes..." 
          class="custom-searchbar"
          @ionInput="handleSearch"
          @ionClear="clearSearch"
        />
      </div>
    </div>

    <ion-content :class="{ 'pointer-events-none opacity-50': shouldShowModal }">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content
          pulling-icon="chevron-down-circle-outline"
          pulling-text="Pull to refresh"
          refreshing-spinner="circles"
          refreshing-text="Refreshing...">
        </ion-refresher-content>
      </ion-refresher>

      <div class="content-wrapper">
        <!-- Search Results Section -->
        <div v-if="searchQuery && searchResults.length > 0" class="search-results-section">
          <div class="section-header-row">
            <h2 class="section-title">Search Results</h2>
          </div>
          <div class="featured-products-grid">
            <div v-for="product in searchResults" :key="product.id" class="product-card"
              @click="viewProduct(product)">
              <div class="product-img-wrapper">
                <img :src="product.imageUrl" :alt="product.name" class="product-img" />
              </div>
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">₱{{ product.price }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results Message -->
        <div v-if="searchQuery && searchResults.length === 0" class="no-results">
          <p>No cakes found matching "{{ searchQuery }}"</p>
        </div>

        <!-- Categories Section with Skeleton -->
        <div class="categories-section">
          <div class="section-header-row">
            <h2 class="section-title">Categories</h2>
            <span class="see-all" @click="goToCategories">See All</span>
          </div>
          <div class="categories-scroll">
            <template v-if="isLoading">
              <div v-for="n in 6" :key="n" class="category-circle">
                <div class="circle-img skeleton-circle">
                  <div class="skeleton-image"></div>
                </div>
                <div class="skeleton-text"></div>
              </div>
            </template>
            <template v-else>
              <div v-for="category in categories" :key="category.id" class="category-circle"
                @click="viewCategory(category.name)">
                <div class="circle-img">
                  <img :src="category.imageUrl" :alt="category.name" />
                </div>
                <span class="circle-label">{{ category.name.charAt(0).toUpperCase() + category.name.slice(1) }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Featured Products with Skeleton -->
        <div class="featured-products-section">
          <div class="section-header-row">
            <h2 class="section-title">Featured Products</h2>

          </div>
          <div class="featured-products-grid">
            <template v-if="isLoading">
              <div v-for="n in 4" :key="n" class="product-card skeleton-card">
                <div class="product-img-wrapper">
                  <div class="skeleton-image"></div>
                </div>
                <div class="product-info">
                  <div class="skeleton-text" style="width: 80%; height: 20px; margin-bottom: 8px;"></div>
                  <div class="skeleton-text" style="width: 40%; height: 16px;"></div>
                </div>
              </div>
            </template>
            <template v-else>
              <div v-for="product in featuredProducts" :key="product?.id" class="product-card"
                @click="viewProduct(product)">
                <div class="product-img-wrapper">
                  <img :src="product?.imageUrl" :alt="product?.name" class="product-img" />
                  <!-- <ion-button fill="clear" class="favorite-btn" @click.stop>
                    <ion-icon :icon="heartOutline" />
                  </ion-button> -->
                </div>
                <div class="product-info">

                  <div class="product-name">{{ product?.name }}</div>
                  <div class="product-price">₱{{ product?.price }}</div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Profile Completion Modal -->
    <Teleport to="body">
      <div 
        v-if="shouldShowModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] animate-fadeIn"
      >
        <div class="w-[90%] max-w-[400px] animate-slideIn relative z-[10000]">
          <div class="bg-white rounded-2xl p-6 shadow-lg">
            <div class="text-center mb-5">
              <h2 class="text-2xl font-semibold text-[#58091F] font-['Outfit']">Complete Your Profile</h2>
            </div>
            <div class="text-center">
              <ion-icon 
                :icon="personCircleOutline" 
                class="text-6xl text-[#F0E68D] mb-4" 
                aria-hidden="true"
              ></ion-icon>
              <p class="text-gray-600 text-base leading-relaxed mb-6 font-['Inter']">
                To continue using the app, please complete your profile information first.
              </p>
              <div class="flex flex-col gap-3">
                <button 
                  ref="completeButton"
                  type="button"
                  class="w-full h-12 bg-[#58091F] text-white rounded-lg font-semibold font-['Inter'] 
                         transition-colors duration-200 hover:bg-[#7A0C29] active:bg-[#7A0C29]
                         focus:outline-none focus:ring-2 focus:ring-[#58091F] focus:ring-opacity-50
                         cursor-pointer select-none"
                  @click.stop="goToEditProfile"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue';
import {
  notifications,
  cartOutline,
  locationOutline,
  chevronDownOutline,
  optionsOutline,
  chevronForward,
  heartOutline,
  star,
  personCircleOutline
} from 'ionicons/icons';
import { useRouter, useRoute } from 'vue-router';
import { useCakeStore } from '@/stores/cakeStore';
import { storeToRefs } from 'pinia';
import { useOrderNotificationStore } from '@/stores/orderNotification';
import { useAuthStore } from '@/stores/authStore';
import { onMounted, onUnmounted, watch, ref, computed, nextTick } from 'vue';
import { Teleport } from 'vue';

const router = useRouter();
const route = useRoute();
const cakeStore = useCakeStore();
const { categories, getAllCakes } = storeToRefs(cakeStore);
const orderNotification = useOrderNotificationStore();
const auth = useAuthStore();
const isLoading = ref(true);
const showModal = ref(false);
const authLoading = ref(true);
let cleanup;

watch(() => auth.user, (newUser) => {
  authLoading.value = false;
  if (newUser) {
    if (cleanup) {
      cleanup();
    }
    cleanup = orderNotification.listenToOrderNotifications(newUser);
  } else {
    if (cleanup) {
      cleanup();
    }
  }
}, { immediate: true });

onUnmounted(() => {
  if (cleanup) {
    cleanup();
  }
});

const featuredProducts = computed(() => {
  // Get one cake from each category, but only if the category has cakes
  return categories.value
    .filter(category => category?.cakes?.length > 0 && category.cakes[0]) // Filter out categories with no cakes
    .map(category => {
      const cake = category.cakes[0];
      return {
        id: cake.id,
        name: cake.name,
        imageUrl: cake.imageUrl,
        price: typeof cake.price === 'number' ? cake.price : cake.price.min,
        category: category.name
      };
    });
});

const goToNotifications = () => {
  router.push('/notifications');
};
const goToOffers = () => {
  router.push('/offers');
};
const goToCategories = () => {
  router.push('/categories');
};
const goToFeatured = () => {
  router.push('/featured');
};
const viewCategory = (categoryId) => {

  if (categoryId === 'Customize') {
    return router.push(`/customize`);
  };
  router.push(`/category/${categoryId}`);
}
const viewProduct = (productId) => {
  router.push(`/category/${productId.category}/cake?id=${productId.id}`);
};

// Add onMounted hook to handle initial loading
onMounted(async () => {
  try {
    await cakeStore.fetchCategories();
  } finally {
    isLoading.value = false;
  }
});

const handleRefresh = async (event) => {
  try {
    isLoading.value = true;
    // Refresh the cake store data
    await cakeStore.fetchCategories();
    
    // Complete the refresh
    event.target.complete();
  } catch (error) {
    console.error('Error refreshing data:', error);
    event.target.complete();
  } finally {
    isLoading.value = false;
  }
};

// Search functionality
const searchQuery = ref('');
const searchResults = ref([]);

const handleSearch = (event) => {
  const query = event.target.value.toLowerCase().trim();
  if (!query) {
    searchResults.value = [];
    return;
  }

  // Search through all categories and their cakes with proper null checks
  const results = categories.value
    ?.filter(category => category && category.cakes) // Ensure category and cakes exist
    .flatMap(category => 
      (category.cakes || []) // Provide empty array as fallback
        .filter(cake => 
          cake && // Ensure cake exists
          (
            (cake.name?.toLowerCase() || '').includes(query) || 
            (category.name?.toLowerCase() || '').includes(query)
          )
        )
        .map(cake => ({
          id: cake.id,
          name: cake.name,
          imageUrl: cake.imageUrl,
          price: typeof cake.price === 'number' ? cake.price : cake.price?.min || 0,
          category: category.name
        }))
    ) || []; // Provide empty array as fallback for undefined categories

  searchResults.value = results;
};

const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
};

// Computed property to determine if modal should be shown
const shouldShowModal = computed(() => {
  return !authLoading.value &&
         !auth.isProfileCompleted && 
         auth.user !== null && 
         route.path !== '/account/edit';
});

// Watch for route changes to prevent navigation if profile is incomplete
watch(() => route.path, (newPath) => {
  if (!auth.isProfileCompleted && auth.user !== null && newPath !== '/account/edit') {
    router.push('/');
  }
}, { immediate: true });

const goToEditProfile = () => {
  router.push('/account/edit');
};

const completeButton = ref(null);
</script>

<style scoped>
.home-page {
  --background: #fff8f0;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.custom-header {
  display: flex;
  flex-direction: column;
  background: #F0E68D;
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 16px 20px 20px 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.location-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 500;
}
.location-icon {
  font-size: 1.3rem;
  color: #FFD180;
}
.location-text {
  color: #58091F;
  font-weight: 600;
  font-size: 1.1rem;
  font-family: 'Outfit', sans-serif;
}
.dropdown-icon {
  font-size: 1rem;
  color: #FFD180;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-btn {
  --background: #fff3e0;
  --color: #58091F;
  border-radius: 12px;
  margin: 0 2px;
  position: relative;
}
.notification-btn {
  position: relative;
}
.notification-dot {
  position: absolute;
  top: 0px;
  right: -6px;
  width: 8px;
  height: 8px;
  background-color: #ff4961;
  border-radius: 50%;
  border: 2px solid #fff;
}


.custom-searchbar {
  --background: #f5f5f5;
  --border-radius: 16px;
  --box-shadow: 0 2px 8px rgba(139, 92, 47, 0.08);
  --color: #8B5C2F;
  --placeholder-color: #8B5C2F99;
  --icon-color: #8B5C2F;
  --clear-button-color: #8B5C2F;
  --placeholder-font-family: 'Inter', sans-serif;
  --placeholder-font-weight: 400;
  height: 48px;
  margin: 0;
}
.filter-btn {
  --background: #fff3e0;
  --color: #8B5C2F;
  border-radius: 12px;
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-wrapper {
  padding: 0 0 32px 0;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 32px 20px 8px 20px;
}
.section-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: #3E2723;
  margin: 0.5rem 0;
  font-family: 'Outfit', sans-serif;
  letter-spacing: -0.02em;
}
.see-all {
  color: #8B5C2F;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  opacity: 0.85;
  font-family: 'Inter', sans-serif;
}

/* Special Offers */
.special-offers-section {
  margin-bottom: 12px;
}
.offers-carousel {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 20px;
}
.offer-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(139, 92, 47, 0.10);
  padding: 20px 24px;
  min-width: 100%;
  max-width: 100%;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
}
.offer-info {
  flex: 1;
  z-index: 2;
}
.limited-time {
  background: #FFE0B2;
  color: #8B5C2F;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 12px;
  padding: 2px 10px;
  margin-bottom: 8px;
  display: inline-block;
}
.offer-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #3E2723;
  margin: 8px 0 4px 0;
}
.offer-discount {
  font-size: 1.1rem;
  color: #3E2723;
  margin-bottom: 12px;
}
.discount {
  font-size: 2.2rem;
  font-weight: 800;
  color: #8B5C2F;
}
.shop-now-btn {
  --background: #8B5C2F;
  --color: #fff;
  --border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 4px;
}
.offer-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 16px;
  margin-left: 18px;
  box-shadow: 0 2px 8px rgba(139, 92, 47, 0.10);
}
.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #E0C3A3;
  opacity: 0.5;
  transition: background 0.2s;
}
.dot.active {
  background: #8B5C2F;
  opacity: 1;
}

/* Categories Horizontal Scroll */
.categories-section {
  margin-bottom: 12px;
  background: #fff;
  padding-top: 12px;
  padding-bottom: 12px;
}
.categories-scroll {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding: 8px 20px 8px 20px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.categories-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
.category-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
  cursor: pointer;
}
.circle-img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fff3e0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(139, 92, 47, 0.08);
  margin-bottom: 8px;
  overflow: hidden;
}
.circle-img img {
  width: 44px;
  height: 44px;
  object-fit: contain;
}
.circle-label {
  font-size: 0.9rem;
  color: #8B5C2F;
  font-weight: 500;
  text-align: center;
  font-family: 'Inter', sans-serif;
}

/* Featured Products */
.featured-products-section {
  margin-top: 0;
  margin-bottom: 72px;
  position: relative;
}

.featured-products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  padding: 0 20px;
  padding-bottom: 20px; /* Add padding at bottom for last row */
}

.product-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(139, 92, 47, 0.10);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}
.product-img-wrapper {
  position: relative;
  width: 100%;
  height: 120px;
  background: #fff3e0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0 0 18px 18px;
}
.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  --background: #fff;
  --color: #8B5C2F;
  border-radius: 50%;
  min-width: 32px;
  min-height: 32px;
  z-index: 2;
}
.product-info {
  padding: 10px 12px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.product-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1rem;
  color: #FFA726;
  font-weight: 600;
}
.star-icon {
  font-size: 1.1rem;
}
.product-name {
  font-size: 1.1rem;
  color: #3E2723;
  font-weight: 600;
  margin-top: 2px;
  font-family: 'Outfit', sans-serif;
  letter-spacing: -0.01em;
}
.product-price {
  font-size: 1rem;
  color: #8B5C2F;
  font-weight: 600;
  margin-top: 4px;
  font-family: 'Inter', sans-serif;
}

@media (max-width: 768px) {
  .categories-section {
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .section-header-row {
    margin: 0 10px 6px 10px;
  }
  .featured-products-section {
    height: 500px; /* Slightly smaller height on mobile */
  }
  .featured-products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    padding: 0 12px;
    padding-bottom: 20px;
  }
  .offer-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 12px;
  }
  .offer-img {
    margin-left: 0;
    margin-top: 12px;
    width: 100%;
    height: 100px;
  }
}
@media (max-width: 480px) {
  .custom-header {
    padding: 16px 10px 16px 10px;
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
  }
  .header-top {
    margin-bottom: 12px;
  }
  .search-bar-wrapper {
    margin: 12px 10px 0 10px;
  }
  .section-header-row {
    margin: 12px 10px 12px 10px;
  }
  .offers-carousel {
    margin: 0 10px;
  }
  .categories-scroll {
    padding: 8px;
  }
  .featured-products-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 12px;
  }
}

/* Skeleton Loading Styles */
.skeleton-circle {
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.skeleton-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(139, 92, 47, 0.10);
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  position: relative;
  overflow: hidden;
}

.skeleton-text {
  background: #f0f0f0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton-image::after,
.skeleton-text::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Specific skeleton styles */
.category-circle .skeleton-image {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

.category-circle .skeleton-text {
  width: 60px;
  height: 16px;
  margin-top: 8px;
}

.product-card .skeleton-image {
  width: 100%;
  height: 120px;
}

/* Adjust skeleton colors to match theme */
.skeleton-image,
.skeleton-text {
  background: #fff3e0;
}

.skeleton-image::after,
.skeleton-text::after {
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.4) 20%,
    rgba(255, 255, 255, 0.8) 60%,
    rgba(255, 255, 255, 0)
  );
}

.search-results-section {
  margin-top: 16px;
}

.no-results {
  text-align: center;
  padding: 32px 20px;
  color: #8B5C2F;
  font-size: 1.1rem;
  font-family: 'Inter', sans-serif;
}

/* Add these animations to your existing styles */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

/* Add this new style */
.pointer-events-none {
  pointer-events: none;
  user-select: none;
}
</style>