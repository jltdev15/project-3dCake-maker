<template>
  <ion-page class="categories-page">
    <!-- Custom Header -->
    <div class="custom-header">
      <ion-button fill="clear" class="back-btn" @click="router.back()">
        <ion-icon :icon="arrowBack" />
      </ion-button>
      <h1 class="page-title pr-8">Category</h1>
    </div>

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
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { arrowBack } from 'ionicons/icons';
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

.custom-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: #F0E68D;
  padding: 24px 0 12px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  --color: #333;
  font-size: 18px;

}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #222;
  margin: 0 40px 0 0;
}

.content-wrapper {

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
  .custom-header {
    padding: 16px 0 8px 0;
  }
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