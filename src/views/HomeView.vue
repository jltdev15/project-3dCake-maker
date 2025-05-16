<template>
  <ion-page class="home-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="menu-button"></ion-menu-button>
        </ion-buttons>
        <ion-title class="brand-title">
          PSALM CAKES
        </ion-title>
        <ion-buttons slot="end">
          <ion-button class="notification-button" @click="goToNotifications">
            <ion-icon :icon="notificationsOutline"></ion-icon>
            <ion-badge v-if="orderNotification.unreadCount > 0" color="danger" class="notification-badge">
              {{ orderNotification.unreadCount }}
            </ion-badge>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="content-wrapper">
        <!-- Hero Section -->
        <div class="hero-section" @click="goToCustomize">
          <div class="hero-content">
            <h1 class="hero-title">Create Your Dream Cake</h1>
            <p class="hero-subtitle">Start customizing your perfect cake today</p>
            <ion-button class="customize-button" fill="solid">
              Start Customizing
              <ion-icon :icon="createOutline" slot="end"></ion-icon>
            </ion-button>
          </div>
          <div class="hero-image">
            <img src="/swiper/5.jpg" alt="Customize Cake" />
          </div>
        </div>

        <!-- Categories Section -->
        <div class="categories-section">
          <div class="section-header">
            <h2 class="section-title">Explore Categories</h2>
            <p class="section-subtitle">Discover our delicious cake varieties</p>
          </div>

          <div class="categories-grid">
            <div 
              v-for="category in categories" 
              :key="category.id"
              class="category-card"
              @click="viewCategory(category.id)"
            >
              <div class="category-image">
                <img :src="category.imageUrl" :alt="category.name" />
              </div>
              <div class="category-content">
                <h3 class="category-name">{{ category.name }}</h3>
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
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonMenuButton,
  IonBadge,
  toastController
} from '@ionic/vue';
import { createOutline, notificationsOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useCakeStore } from '@/stores/cakeStore';
import { storeToRefs } from 'pinia';
import { useOrderNotificationStore } from '@/stores/orderNotification';
import { useAuthStore } from '@/stores/authStore';
import { onMounted, onUnmounted, watch } from 'vue';

const router = useRouter();
const cakeStore = useCakeStore();
const { categories } = storeToRefs(cakeStore);
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

const goToNotifications = () => {
  router.push('/notifications');
};

const viewCategory = (categoryId) => {
  router.push(`/category/${categoryId}`);
};

const goToCustomize = () => {
  router.push('/customize-cake');
};
</script>

<style scoped>
.home-page {
  --background: linear-gradient(135deg, #FFF7D0 0%, #C8AD7E 100%);
}

ion-header {
  --background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

ion-toolbar {
  --background: #7A5C1E;
  --border-width: 0;
  padding: 8px 16px;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
}

.menu-button {
  --color: #FFFFFF;
  font-size: 24px;
}

.notification-button {
  --color: #FFFFFF;
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(25%, -25%);
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
}

.content-wrapper {
  padding: 16px;
  padding-top: 80px;
}

/* Hero Section */
.hero-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.hero-section:hover {
  transform: translateY(-3px);
}

.hero-content {
  flex: 1;
  padding-right: 12px;
}

.hero-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7A5C1E;
  margin: 0 0 6px 0;
}

.hero-subtitle {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 12px 0;
}

.customize-button {
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 8px;
  --box-shadow: 0 3px 8px rgba(122, 92, 30, 0.2);
  font-weight: 600;
  height: 36px;
  padding: 0 12px;
  font-size: 0.9rem;
}

.hero-image {
  flex: 1;
  max-width: 200px;
  height: 130px;
  border-radius: 12px;
  overflow: hidden;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Categories Section */
.categories-section {
  padding: 16px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #7A5C1E;
  margin: 0 0 8px 0;
}

.section-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  padding: 8px;
}

.category-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
}

.category-image {
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-card:hover .category-image img {
  transform: scale(1.05);
}

.category-content {
  padding: 12px;
  text-align: center;
}

.category-name {
  font-size: 1rem;
  font-weight: 600;
  color: #7A5C1E;
  margin: 0;
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }

  .hero-content {
    padding-right: 0;
    margin-bottom: 16px;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .hero-image {
    max-width: 100%;
    height: 160px;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .category-image {
    height: 120px;
  }

  .category-name {
    font-size: 0.875rem;
  }
}
</style>