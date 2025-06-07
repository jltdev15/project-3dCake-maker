<template>
  <ion-page class="categories-page">
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
                <button @click="router.back()"
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
                      Categories
                    </h1>
                    <p class="text-xs sm:text-sm opacity-70 font-medium tracking-wide mt-0.5 text-gray-700">
                      Choose your favorite category
                    </p>
                  </div>
                </div>
              </div>

              <!-- Right Side - Placeholder for balance -->
              <div class="flex items-center space-x-2">
                <div class="w-10 h-10 sm:w-12 sm:h-12"></div>
              </div>
            </div>

            <!-- Category Stats -->
            <div class="mt-3 pt-3 border-t border-black/20">
              <div class="flex items-center justify-center text-xs sm:text-sm">
                <div class="flex items-center space-x-2 text-gray-700/80">
                  <ion-icon :icon="gridOutline" class="text-sm"></ion-icon>
                  <span>{{ categories.length }} Categories Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="content-wrapper">
        <div class="categories-grid">
          <div v-for="category in categories" :key="category.id" 
               class="category-card" 
               @click="viewCategory(category.name)">
            <div class="category-img-wrapper">
              <img :src="category.imageUrl" :alt="category.name" class="category-img" />
            </div>
            <div class="category-name capitalize font-bold">{{ category.name }}</div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonButton, IonIcon, IonHeader, IonToolbar } from '@ionic/vue';
import { arrowBack, chevronBackOutline, gridOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useCakeStore } from '@/stores/cakeStore';
import { storeToRefs } from 'pinia';

const router = useRouter();
const cakeStore = useCakeStore();
const { categories } = storeToRefs(cakeStore);

const viewCategory = (categoryId) => {
  if(categoryId === 'Customize') {
    return router.push(`/customize`);
  };
  router.push(`/category/${categoryId}`);
};
</script>

<style scoped>
.categories-page {
  --background: #fff;
  min-height: 100vh;
}

.content-wrapper {
  padding: 20px 8px 0 8px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px 24px;
  justify-items: center;
  padding-bottom: 32px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  box-shadow: none;
  border: none;
  cursor: pointer;
  transition: transform 0.15s;
  width: 100%;
  max-width: 200px;
}

.category-card:active {
  transform: scale(0.97);
}

.category-img-wrapper {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: #fff8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 20px;
  border: 2px solid #ffe4c4;
  box-shadow: 0 2px 8px rgba(255, 196, 140, 0.2);
}

.category-img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  display: block;
}

.category-name {
  font-size: 1.2rem;
  color: #222;
  font-weight: 500;
  text-align: center;
  margin-top: 0;
}

@media (max-width: 900px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px 20px;
  }
  .category-card {
    max-width: 180px;
  }
  .category-img-wrapper {
    width: 140px;
    height: 140px;
  }
  .category-img {
    width: 105px;
    height: 105px;
  }
}

@media (max-width: 600px) {
  .content-wrapper {
    padding: 20px 8px 0 8px;
  }
  .categories-grid {
    gap: 32px 16px;
  }
  .category-img-wrapper {
    width: 120px;
    height: 120px;
  }
  .category-img {
    width: 90px;
    height: 90px;
  }
  .category-card {
    max-width: 140px;
  }
}
</style> 