<template>
  <ion-page class="home-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="brand-title">
          PSALM CAKES
        </ion-title>
        <ion-buttons slot="end">
          <ion-button class="notification-button" @click="goToNotifications">
            <ion-icon :icon="notifications" class="notification-icon"></ion-icon>
            <ion-badge v-if="orderNotification.unreadCount > 0" color="danger" class="notification-badge">
              {{ orderNotification.unreadCount }}
            </ion-badge>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="content-wrapper">
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
                <div class="category-overlay"></div>
              </div>
              <div class="category-content">
                <h3 class="category-name">{{ category.name }}</h3>
                <ion-icon :icon="chevronForward" class="category-arrow"></ion-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating Action Button -->
        <ion-button class="floating-customize-button" fill="solid" @click="goToCustomize">
          <ion-icon :icon="createOutline" slot="start"></ion-icon>
          Start Customizing
        </ion-button>
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
import { createOutline, notificationsOutline, notifications, chevronForward } from 'ionicons/icons';
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
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
}

.notification-button {
  --color: #FFFFFF;
  position: relative;
  margin-right: 8px;
}

.notification-icon {
  font-size: 24px;
  transition: transform 0.2s ease;
}

.notification-button:hover .notification-icon {
  transform: scale(1.1);
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
  padding-bottom: 100px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Categories Section */
.categories-section {
  padding: 16px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 0 16px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #7A5C1E;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  opacity: 0.9;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 8px;
  max-width: 800px;
  margin: 0 auto;
}

.category-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.category-image {
  width: 100%;
  height: 280px;
  overflow: hidden;
  position: relative;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.3));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover .category-image img {
  transform: scale(1.05);
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.category-content {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.98);
}

.category-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7A5C1E;
  margin: 0;
  transition: color 0.3s ease;
}

.category-arrow {
  color: #7A5C1E;
  font-size: 20px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.category-card:hover .category-arrow {
  transform: translateX(4px);
  opacity: 1;
}

.category-card:hover .category-name {
  color: #8B6B2F;
}

/* Floating Action Button */
.floating-customize-button {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  --background: linear-gradient(135deg, #7A5C1E 0%, #8B6B2F 100%);
  --background-hover: linear-gradient(135deg, #8B6B2F 0%, #9D7B3F 100%);
  --background-activated: linear-gradient(135deg, #8B6B2F 0%, #9D7B3F 100%);
  --border-radius: 50px;
  --box-shadow: 0 4px 16px rgba(122, 92, 30, 0.3);
  --padding-start: 32px;
  --padding-end: 32px;
  height: 52px;
  font-weight: 600;
  font-size: 1.1rem;
  z-index: 1000;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.floating-customize-button ion-icon {
  margin-right: 8px;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .categories-grid {
    gap: 16px;
  }

  .category-image {
    height: 240px;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .floating-customize-button {
    bottom: 20px;
    --padding-start: 24px;
    --padding-end: 24px;
    height: 48px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .categories-grid {
    gap: 12px;
  }

  .category-image {
    height: 200px;
  }

  .category-name {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .floating-customize-button {
    bottom: 16px;
    --padding-start: 20px;
    --padding-end: 20px;
    height: 44px;
    font-size: 0.9rem;
  }
}
</style>