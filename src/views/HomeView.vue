<template>
  <ion-page class="page-background">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title class="ion-text-center">
          PSALM CAKES CUSTOMIZED
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding-top">
      <div class="cake-carousel">
        <Swiper v-bind="swiperOptions" class="swiper">
          <SwiperSlide v-for="(cake, idx) in [
            { img: '/swiper/1.jpg', title: 'Happy Christening', name: 'Shania Rhae' },
            { img: '/swiper/2.jpg', title: '18th Birthday', name: 'Alexa' },
            { img: '/swiper/3.jpg', title: 'Wedding Cake', name: 'Mr & Mrs' },
            { img: '/swiper/4.jpg', title: 'Strawberry Cake', name: '' },
            { img: '/swiper/5.jpg', title: 'Vanilla Cake', name: '' }
          ]" :key="idx">
            <img :src="cake.img" alt="cake" class="carousel-img" />
          </SwiperSlide>
        </Swiper>
      </div>

      <ion-grid class="">
        <ion-row class="ion-justify-content-center">
          <ion-col size="6" class="ion-padding">
            <ion-card class="cake-card">
              <img src="/swiper/5.jpg" alt="18th Birthday Cake" />
              <div class="cake-label">18th Birthday Cake</div>
            </ion-card>
          </ion-col>
          <ion-col size="6" class="ion-padding">
            <ion-card class="cake-card">
              <img src="/swiper/3.jpg" alt="Wedding Cake" />
              <div class="cake-label">Wedding Cake</div>
            </ion-card>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center">
          <ion-col size="6" class="ion-padding">
            <ion-card class="cake-card">
              <img src="/swiper/4.jpg" alt="Strawberry Cake" />
              <div class="cake-label">Strawberry Cake</div>
            </ion-card>
          </ion-col>
          <ion-col size="6" class="ion-padding">
            <ion-card class="cake-card">
              <img src="/swiper/5.jpg" alt="Vanilla Cake" />
              <div class="cake-label">Vanilla Cake</div>
            </ion-card>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center">
          <ion-col size="6" class="ion-padding">
            <ion-card class="cake-card">
              <img src="/swiper/2.jpg" alt="Number Cake" />
              <div class="cake-label">Number Cake</div>
            </ion-card>
          </ion-col>
          <ion-col size="6" class="ion-padding">
            <div class="customize-card">
              <img src="/swiper/5.jpg" alt="Customize Cake" class="customize-img" />
              <div class="customize-text">STARTED CUSTOMIZE<br />YOUR DREAM CAKE!</div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonButtons,
  IonMenuButton
} from '@ionic/vue';
import { createOutline, saveOutline } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const swiperOptions = {
  modules: [Autoplay, Pagination],
  slidesPerView: 1,
  spaceBetween: 30,
  loop: false,
  pagination: {
    clickable: true,
  },
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
};
</script>

<style scoped>
.page-background {
  background: linear-gradient(to bottom, #C8AD7E, #FFF7D0);
}

ion-toolbar {
  --background: linear-gradient(to right, #C8AD7E, #FFFFFF);
}

ion-title {
  color: #000000;
  font-weight: 600;
}

ion-menu-button {
  --color: #000000;
}

ion-card {
  text-align: center;
  --background: rgba(255, 255, 255, 0.9);
  margin: 16px 0;
}

ion-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

ion-card ion-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

ion-card h3 {
  margin: 0;
  font-size: 16px;
}

ion-content {
  --background: transparent;
}



:deep(.swiper) {
  height: 100%;
}

:deep(.swiper-slide) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

:deep(.swiper-slide ion-card) {
  width: 100%;
  height: 100%;
  margin: 0;
}

:deep(.swiper-slide ion-card img) {
  height: 60%;
  object-fit: cover;
}

:deep(.swiper-pagination-bullet) {
  background: #C8AD7E;
}

:deep(.swiper-pagination-bullet-active) {
  background: #000000;
}

.carousel-img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.cake-label {
  font-size: 15px;
  font-weight: 500;
  margin-top: 8px;
  margin-bottom: 8px;
  color: #222;
}
.customize-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #FFF7D0;
  border-radius: 18px;
  height: 100%;
  min-height: 160px;
  box-shadow: 0 2px 8px rgba(200,173,126,0.15);
  padding: 16px 8px;
}
.customize-img {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}
.customize-text {
  color: #7A5C1E;
  font-weight: 600;
  text-align: center;
  font-size: 15px;
  letter-spacing: 0.5px;
}

ion-grid {
  --ion-grid-padding: 8px;
  --ion-grid-column-padding: 8px;
  height: calc(100vh - 200px); /* Account for header and swiper */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

ion-row {
  margin-bottom: 8px;
  flex: 1;
}

.cake-card {
  margin: 0;

  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cake-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  flex: 1;
}

.cake-label {
  font-size: 13px;
  font-weight: 600;
  margin: 8px 0;
  color: #333;
  text-align: center;
  padding: 0 4px;
}

.customize-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #FFF7D0;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.customize-img {
  width: 36px;
  height: 36px;
  margin-bottom: 8px;
}

.customize-text {
  color: #7A5C1E;
  font-weight: 600;
  text-align: center;
  font-size: 12px;
  line-height: 1.3;
  letter-spacing: 0.5px;
}

.cake-carousel {
  height: 15vh;
  min-height: 150px;
}
</style>