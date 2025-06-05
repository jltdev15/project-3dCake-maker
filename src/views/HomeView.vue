<template>
  <ion-page class="home-page">
    <!-- Custom Header -->
    <div class="custom-header">
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
        <ion-searchbar placeholder="Search" class="custom-searchbar" />
      </div>
    </div>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content
          pulling-icon="chevron-down-circle-outline"
          pulling-text="Pull to refresh"
          refreshing-spinner="circles"
          refreshing-text="Refreshing...">
        </ion-refresher-content>
      </ion-refresher>

      <div class="content-wrapper">
        <!-- Categories Horizontal Scroll -->
        <div class="categories-section">
          <div class="section-header-row">
            <h2 class="section-title">Categories</h2>
            <span class="see-all" @click="goToCategories">See All</span>
          </div>
          <div class="categories-scroll">
            <div v-for="category in categories" :key="category.id" class="category-circle"
              @click="viewCategory(category.name)">
              <div class="circle-img">
                <img :src="category.imageUrl" :alt="category.name" />
              </div>
              <span class="circle-label">{{ category.name.charAt(0).toUpperCase() + category.name.slice(1) }}</span>
            </div>
          </div>
        </div>

        <!-- Featured Products -->
        <div class="featured-products-section">
          <div class="section-header-row">
            <h2 class="section-title">Featured Products</h2>

          </div>
          <div class="featured-products-grid">
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
          </div>
        </div>
      </div>
    </ion-content>
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
  star
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useCakeStore } from '@/stores/cakeStore';
import { storeToRefs } from 'pinia';
import { useOrderNotificationStore } from '@/stores/orderNotification';
import { useAuthStore } from '@/stores/authStore';
import { onMounted, onUnmounted, watch, ref, computed } from 'vue';

const router = useRouter();
const cakeStore = useCakeStore();
const { categories, getAllCakes } = storeToRefs(cakeStore);
const orderNotification = useOrderNotificationStore();
const auth = useAuthStore();
let cleanup;

watch(() => auth.user, (newUser) => {
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

const handleRefresh = async (event) => {
  try {
    // Refresh the cake store data
    await cakeStore.fetchCategories();
    
    // Complete the refresh
    event.target.complete();
  } catch (error) {
    console.error('Error refreshing data:', error);
    event.target.complete();
  }
};
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
</style>